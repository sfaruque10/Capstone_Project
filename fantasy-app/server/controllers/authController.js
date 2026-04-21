const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//Method to create New User
const register = async (req, res) => {
    //Gather New User details from request
    const { username, email, password } = req.body;
    
    //Hash password and enter user info into User db
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
        [username, email, hashedPassword]
        );

        res.json(result.rows[0]);
    //Error catch
    } catch (err) {
    console.error(err);
    res.status(500).send('Error registering user');
    }
};

//Method to authenticate user login
const login = async (req, res) => {
    //Info from request
    const { identifier, password } = req.body;

    try {
        //Check if username/email entered is registered
        const result = await pool.query(
          'SELECT * FROM users WHERE email = $1 OR username = $1',
          [identifier]
        );

        const user = result.rows[0];

        //Error if no user exists
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        //Check if password matches user password
        const validPassword = await bcrypt.compare(password, user.password);

        //Error if wrong password
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        //Login token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token });
    //General Error Catch
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in');
    }
};

const getCurrentUser = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, getCurrentUser };


