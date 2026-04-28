const pool = require('../config/db');

const createTrade = async (req, res) => {
  const {
    league_id,
    from_team_id,
    to_team_id,
    offered_players,
    requested_players
  } = req.body;

  try {
    const tradeResult = await pool.query(
      `INSERT INTO trades
       (league_id, from_team_id, to_team_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [league_id, from_team_id, to_team_id]
    );

    const trade = tradeResult.rows[0];

    for (const playerId of offered_players) {
      await pool.query(
        `INSERT INTO trade_players (trade_id, team_id, player_id)
         VALUES ($1, $2, $3)`,
        [trade.id, from_team_id, playerId]
      );
    }

    for (const playerId of requested_players) {
      await pool.query(
        `INSERT INTO trade_players (trade_id, team_id, player_id)
         VALUES ($1, $2, $3)`,
        [trade.id, to_team_id, playerId]
      );
    }

    res.json(trade);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getTradesForTeam = async (req, res) => {
  const { teamId } = req.params;

  const result = await pool.query(
    `SELECT * FROM trades
     WHERE from_team_id = $1 OR to_team_id = $1
     ORDER BY created_at DESC`,
    [teamId]
  );

  res.json(result.rows);
};

const rejectTrade = async (req, res) => {
  const { id } = req.params;

  await pool.query(
    `UPDATE trades
     SET status = 'rejected'
     WHERE id = $1`,
    [id]
  );

  res.json({ message: 'Trade rejected' });
};

const acceptTrade = async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const tradeRes = await client.query(
      'SELECT * FROM trades WHERE id = $1',
      [id]
    );

    const trade = tradeRes.rows[0];

    const playersRes = await client.query(
      'SELECT * FROM trade_players WHERE trade_id = $1',
      [id]
    );

    for (const row of playersRes.rows) {
      const newTeam =
        row.team_id === trade.from_team_id
          ? trade.to_team_id
          : trade.from_team_id;

      await client.query(
        `UPDATE team_players
         SET team_id = $1
         WHERE team_id = $2 AND player_id = $3`,
        [newTeam, row.team_id, row.player_id]
      );
    }

    await client.query(
      `UPDATE trades
       SET status = 'accepted'
       WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');

    res.json({ message: 'Trade accepted' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });

  } finally {
    client.release();
  }
};

module.exports = { createTrade, getTradesForTeam, acceptTrade, rejectTrade };