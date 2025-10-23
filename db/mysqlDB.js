const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_DASH_HOST,
  user: process.env.MYSQL_DASH_USER,
  password: process.env.MYSQL_DASH_PASSWORD,
  database: process.env.MYSQL_DASH_DB,
  port: process.env.MYSQL_DASH_PORT,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
