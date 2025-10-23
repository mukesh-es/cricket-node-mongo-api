require('dotenv').config();
const mysqlDB = require('../db/mysqlDB');

async function testConnection() {
  try {
    const [rows] = await mysqlDB.execute('SELECT 1 + 1 AS result');
    console.log('✅ MySQL Connection Successful. Test Result:', rows[0].result);
    process.exit(0);
  } catch (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
    process.exit(1);
  }
}

testConnection();
