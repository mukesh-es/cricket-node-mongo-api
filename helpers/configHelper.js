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

module.exports = { getConfigSync, reloadConfig };
