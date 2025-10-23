const mysql = require('mysql2/promise');

// Create a reusable MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_DASH_HOST,
  user: process.env.MYSQL_DASH_USER,
  password: process.env.MYSQL_DASH_PASSWORD,
  database: process.env.MYSQL_DASH_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
