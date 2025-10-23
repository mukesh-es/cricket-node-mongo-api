// helpers/configHelper.js
const configModel = require('../models/configModel');
const mysqlDB = require('../db/mysqlDB');

let cachedConfig = null;

// Load config once at startup
const loadConfig = async () => {
  try {
    cachedConfig = await configModel.findOne({});
  } catch (err) {
    console.error("Failed to load config:", err);
  }
};
loadConfig(); // call at startup

// Sync getter
const getConfigSync = () => cachedConfig;

// Optional: force reload later
const reloadConfig = async () => {
  await loadConfig();
  return cachedConfig;
};


function verifyToken(token){
    const apiConfig = cachedConfig ? cachedConfig :  getConfigSync();
    if(apiConfig && apiConfig.token === token){
        return true;
    }
    return false;
}

async function getTokenData(token) {
  try {
    const [rows] = await mysqlDB.execute(
      `SELECT app_id, subscription_id FROM es_user_apps WHERE token=? LIMIT 1`,
      [token]
    );

    if (rows.length > 0) {
      return rows[0];
    } else {
      return null;
    }
  } catch (err) {
    console.error('DB Error:', err);
    throw err;
  } 
}

module.exports = { getConfigSync, reloadConfig, verifyToken, getTokenData };
