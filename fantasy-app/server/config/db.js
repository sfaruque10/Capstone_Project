const { Pool } = require('pg');

//Connects to PostgreSQL db
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;