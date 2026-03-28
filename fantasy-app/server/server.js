require('dotenv').config();
const express = require('express');
const pool = require('./config/db');
const playerRoutes = require('./routes/playerRoutes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

app.get('/test-db', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  res.json(result.rows);
});

app.use('/players', playerRoutes);

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

