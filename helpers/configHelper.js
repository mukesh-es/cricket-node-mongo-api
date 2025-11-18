const mongoose = require('mongoose');
const configModel = require('../models/configModel');
const { errorWithTime } = require('./helpers');

let cachedConfig = null;
let lastLoadedTime = 0;
const CACHE_TTL = 1 * 60 * 1000;
// Load config once at startup
const loadConfig = async (retry = 0) => {
  try {
    cachedConfig = await configModel.findOne({});
    lastLoadedTime = Date.now();
  } catch (err) {
    if (retry < 3) {
      await new Promise(r => setTimeout(r, 3000));
      return loadConfig(retry + 1);
    }
    errorWithTime("Failed to load config after retries:", err);
  }
};

mongoose.connection.once('open', () => {
  loadConfig();
});

// Sync getter
const getConfigSync = () => {
  const now = Date.now();

  if (!cachedConfig || (now - lastLoadedTime > CACHE_TTL)) {
    loadConfig();
  }
  return cachedConfig || { api_version: process.env.API_VERSION };
}

// Optional: force reload later
const reloadConfig = async () => {
  await loadConfig();
  return cachedConfig;
};

module.exports = { getConfigSync, reloadConfig };
