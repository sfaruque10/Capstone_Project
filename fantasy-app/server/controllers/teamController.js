const pool = require("../config/db");
const axios = require("axios");
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
         tp.points,
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
      `INSERT INTO team_players (team_id, player_id, slot, league_id, points)
       VALUES ($1, $2, $3, $4, 0)
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

// based on this sorta https://www.prizepicks.com/playbook-article/how-to-play-prizepicks-mlb-fantasy-scoring-system
const BATTING_SCORING = {
  runs: 2,
  hits: 1,
  RBIs: 2,
  homeRuns: 10,
  walks: 2,
  strikeouts: -1, // Penalty for hitters
};

const PITCHING_SCORING = {
  strikeouts: 3, // Reward for pitchers
  earnedRuns: -3,
  hits: -1, // Penalty for allowing hits
  walks: -1,
  runs: 0, // Usually unearned runs aren't penalized
  "fullInnings.partInnings": 3, // 3 pts per inning
};

const syncTeamPoints = async (req, res) => {
  const { id } = req.params;
  console.log(`\n[1] --- Sync Triggered for Team ID: ${id} ---`);

  try {
    const scoreboard = await axios.get(
      "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
    );
    const eventIds = scoreboard.data.events.map((e) => e.id);
    console.log(`[2] Found ${eventIds.length} games on scoreboard.`);

    if (eventIds.length === 0) {
      return res.json({ message: "No games found for today." });
    }

    for (const eventId of eventIds) {
      console.log(`[3] Fetching Game ID: ${eventId}`);
      const summary = await axios.get(
        `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${eventId}`,
      );

      const teamsArray = summary.data.boxscore?.players;
      if (!teamsArray) {
        console.log(`    (!) No boxscore data for game ${eventId}`);
        continue;
      }

      for (const teamData of teamsArray) {
        for (const statSection of teamData.statistics) {
          const type = statSection.type;

          const rules = type === "batting" ? BATTING_SCORING : PITCHING_SCORING;

          const { keys, athletes } = statSection;

          await Promise.all(
            athletes.map(async (athleteData) => {
              let totalPoints = 0;
              const espnId = athleteData.athlete.id;

              keys.forEach((key, index) => {
                const rawValue = athleteData.stats[index];
                const statValue = parseFloat(rawValue) || 0;

                if (key === "fullInnings.partInnings") {
                  const [innings, outs] = String(rawValue)
                    .split(".")
                    .map(Number);
                  const totalOuts = innings * 3 + (outs || 0);
                  totalPoints += totalOuts * 1; // 1 pt per out (3 per full inning)
                } else if (rules[key]) {
                  totalPoints += statValue * rules[key];
                }
              });

              if (totalPoints !== 0) {
                await pool.query(
                  `UPDATE team_players 
             SET points = $1 
             WHERE team_id = $2 AND player_id = $3`,
                  [totalPoints, id, espnId],
                );
              }
            }),
          );
        }
      }
    }
    console.log(`[5] --- Sync Finished ---\n`);
    res.json({ message: "Sync complete" });
  } catch (err) {
    console.error("Pathing/Sync Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTeamById,
  getUserTeams,
  getTeamPlayers,
  addPlayerToTeam,
  removePlayerFromTeam,
  updatePlayerSlot,
  syncTeamPoints,
};
