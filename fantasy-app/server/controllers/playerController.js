const pool = require('../config/db');

//Method to display Player list from db
const getPlayers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM players');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

const getPlayerById = async (req, res) => {
    //Get player id from url
    const { id } = req.params;

    try {
        const result = await pool.query(
        'SELECT * FROM players WHERE id = $1',
        [id]
        );

        //Error catch for nonexistent player
        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Player not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
    }
};


module.exports = { getPlayers, getPlayerById };