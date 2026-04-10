const pool = require('../config/db');

//Method to get team infrormation by team id in request url
const getTeamById = async (req, res) => {
    //Get team id from url
    const { id } = req.params;

    try {
        const result = await pool.query(
        'SELECT * FROM teams WHERE id = $1',
        [id]
        );

        //Error catch for nonexistent team
        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Team not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
     console.error(err);
     res.status(500).send('Error fetching team');
    }
};

//Method to get teams for user by user id in token
const getUserTeams = async (req, res) => {
  try {
    //Gather team details from user id
    const result = await pool.query(
      'SELECT * FROM teams WHERE user_id = $1',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching user teams');
  }
};

module.exports = { getTeamById, getUserTeams};