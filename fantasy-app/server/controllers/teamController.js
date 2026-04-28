const pool = require("../config/db");

//Method to get team infrormation by team id in request url
const getTeamById = async (req, res) => {
  //Get team id from url
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM teams WHERE id = $1", [id]);

    //Error catch for nonexistent team
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching team");
  }
};

//Method to get teams for user by user id in token
const getUserTeams = async (req, res) => {
  try {
    //Gather team details from user id
    const result = await pool.query("SELECT * FROM teams WHERE user_id = $1", [
      req.user.id,
    ]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching user teams");
  }
};

const getTeamPlayers = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         tp.id,
         tp.slot,
         p.id as player_id,
         p.name,
         p.position,
         p.team
       FROM team_players tp
       JOIN players p ON tp.player_id = p.id
       WHERE tp.team_id = $1`,
      [id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const addPlayerToTeam = async (req, res) => {
  const { id } = req.params; // team_id
  const { player_id, slot, league_id } = req.body;

  try {
    // Prevent duplicates
    const exists = await pool.query(
      "SELECT * FROM team_players WHERE team_id = $1 AND player_id = $2",
      [id, player_id],
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Player already on team" });
    }

    const result = await pool.query(
      `INSERT INTO team_players (team_id, player_id, slot, league_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, player_id, slot, league_id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const removePlayerFromTeam = async (req, res) => {
  const { id, playerId } = req.params;

  await pool.query(
    "DELETE FROM team_players WHERE team_id = $1 AND player_id = $2",
    [id, playerId],
  );

  res.json({ message: "Removed" });
};

const updatePlayerSlot = async (req, res) => {
  const { team_id, player_id, slot } = req.body;

  await pool.query(
    `UPDATE team_players
     SET slot = $1
     WHERE team_id = $2 AND player_id = $3`,
    [slot, team_id, player_id],
  );

  res.json({ message: "Updated" });
};

module.exports = {
  getTeamById,
  getUserTeams,
  getTeamPlayers,
  addPlayerToTeam,
  removePlayerFromTeam,
  updatePlayerSlot,
};
