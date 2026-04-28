const pool = require("../config/db");

//Method to create league
const createLeague = async (req, res) => {
  //League Name from request
  const { name } = req.body;

  //Error if name is null (Remove later if error catch is made on front end)
  if (!name) {
    return res.status(400).json({ error: "League name is required" });
  }

  //Add league to database with owner id
  try {
    const result = await pool.query(
      "INSERT INTO leagues (name, owner_id) VALUES ($1, $2) RETURNING *",
      [name, req.user.id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating league");
  }
};

//Method to join league
const joinLeague = async (req, res) => {
  //Get team name and league id from request
  const { name, league_name } = req.body;

  //Error catches if missing data (Remove later if error catch is added to front end)
  if (!name) {
    return res.status(400).json({ error: "Team name is required" });
  }
  if (!league_name) {
    return res.status(400).json({ error: "League Name is required" });
  }

  try {
    //Check if league trying to join exists
    const leagueCheck = await pool.query(
      "SELECT * FROM leagues WHERE LOWER(name) = LOWER($1)",
      [league_name],
    );

    if (leagueCheck.rows.length === 0) {
      return res.status(404).json({ error: "League not found" });
    }

    const league = leagueCheck.rows[0];

    //Check if user has already created a team in this league
    const existingTeam = await pool.query(
      "SELECT * FROM teams WHERE user_id = $1 AND league_id = $2",
      [req.user.id, league.id],
    );

    if (existingTeam.rows.length > 0) {
      return res.status(400).json({ error: "User already in this league" });
    }

    //Check if league is already at max team limit
    const teamCount = await pool.query(
      "SELECT COUNT(*) FROM teams WHERE league_id = $1",
      [league.id],
    );

    const count = parseInt(teamCount.rows[0].count);

    //Putting max as 16 for now, CHECK LATER IF MIND IS CHANGED
    if (count >= 16) {
      return res
        .status(400)
        .json({ error: "League is at maximum number of teams" });
    }

    //Add team to database with league id
    const result = await pool.query(
      "INSERT INTO teams (name, user_id, league_id) VALUES ($1, $2, $3) RETURNING *",
      [name, req.user.id, league.id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
};

//Method to display JSON league info per user
const getLeagues = async (req, res) => {
  try {
    //Gather League details from user id
    const result = await pool.query(
      `SELECT l.*, t.name AS team_name
        FROM leagues l
        JOIN teams t ON l.id = t.league_id
        WHERE t.user_id = $1`,
      [req.user.id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching leagues");
  }
};

//Method to get league by league id in request url
const getLeagueById = async (req, res) => {
  //Get league id from url
  const { id } = req.params;

  try {
    //Gather league details from league id
    const result = await pool.query(
      `SELECT l.id, l.name, u.username AS owner_name
        FROM leagues l
        JOIN users u ON l.owner_id = u.id
        WHERE l.id = $1`,
      [id],
    );

    //Error catch for nonexistent league
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "League not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching league");
  }
};

//Method to get teams in league by league id in request url
const getLeagueTeams = async (req, res) => {
  //Get league id from url
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT t.id, t.name, u.username FROM teams t JOIN users u ON t.user_id = u.id WHERE t.league_id = $1;",
      [id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching teams");
  }
};
const getLeagueDraftedPlayers = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT player_id FROM team_players WHERE league_id = $1",
      [id],
    );

    const takenIds = result.rows.map((row) => Number(row.player_id));

    res.json(takenIds);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching drafted players");
  }
};

module.exports = {
  createLeague,
  joinLeague,
  getLeagues,
  getLeagueById,
  getLeagueTeams,
  getLeagueDraftedPlayers,
};
