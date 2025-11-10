const mongoose = require('mongoose');
const configModel = require('../models/configModel');

let cachedConfig = null;

// Load config once at startup
const loadConfig = async (retry = 0) => {
  try {
    cachedConfig = await configModel.findOne({});
  } catch (err) {
    if (retry < 3) {
      await new Promise(r => setTimeout(r, 3000));
      return loadConfig(retry + 1);
    }
    console.error("Failed to load config after retries:", err);
  }
};

mongoose.connection.once('open', () => {
  loadConfig();
});

// Sync getter
const getConfigSync = () => cachedConfig || { api_version: process.env.API_VERSION };

// Optional: force reload later
const reloadConfig = async () => {
  await loadConfig();
  return cachedConfig;
};

module.exports = { getConfigSync, reloadConfig };
