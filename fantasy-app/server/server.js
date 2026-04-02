require('dotenv').config();
const express = require('express');
const pool = require('./config/db');
const playerRoutes = require('./routes/playerRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

//Test call to display from a test-db
app.get('/test-db', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  res.json(result.rows);
});

//Method call from Player db table
app.use('/players', playerRoutes);

//Method call for authentication
app.use('/auth', authRoutes);

//Test call for middleware functionality
app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'You are authenticated', user: req.user });
});

const PORT = 5001;

//Run server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

