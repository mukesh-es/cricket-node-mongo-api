// helpers/configHelper.js
const configModel = require('../models/configModel');

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

module.exports = { getConfigSync, reloadConfig, verifyToken };
