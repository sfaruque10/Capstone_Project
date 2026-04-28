const pool = require("../config/db");
const axios = require("axios");

//Method to display Player list from db
const getPlayers = async (req, res) => {
  const { search, position } = req.query;

  let query = 'SELECT * FROM players WHERE 1=1';
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    query += ` AND LOWER(name) LIKE LOWER($${values.length})`;
  }

  if (position) {
    values.push(position);
    query += ` AND position = $${values.length}`;
  }

  query += ' ORDER BY name';

  const result = await pool.query(query, values);
  res.json(result.rows);
};

const getPlayerById = async (req, res) => {
  //Get player id from url
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM players WHERE id = $1", [
      id,
    ]);

    //Error catch for nonexistent player
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
    }
};


module.exports = { getPlayers, getPlayerById };