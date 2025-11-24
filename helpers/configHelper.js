const mongoose = require("mongoose");
const configModel = require("../models/configModel");
const { errorWithTime } = require("./helpers");
const { getRedisClient, redisEnabled } = require("../config/redis");

let cachedConfig = null;

const CONFIG_CACHE_KEY = "app_config";
const CONFIG_TTL_SECONDS = 60; // 1 minute

// ---- Load from DB ----
async function loadConfigFromDB() {
  try {
    const config = await configModel.findOne({});
    return config || { api_version: process.env.API_VERSION };
  } catch (err) {
    errorWithTime("DB error loading config:", err.message);
    return { api_version: process.env.API_VERSION };
  }
}

// ---- Save to Redis + memory ----
async function refreshConfig() {
  const config = await loadConfigFromDB();
  cachedConfig = config;

  try {
    const redisClient = getRedisClient();
    if (redisEnabled && redisClient) {
      await redisClient.setEx(CONFIG_CACHE_KEY, CONFIG_TTL_SECONDS, JSON.stringify(config));
    }
  } catch (err) {
    errorWithTime("Redis error during refresh:", err.message);
  }

  return config;
}

// ---- Init from Redis or DB ----
async function initConfig() {
  try {
    const redisClient = getRedisClient();

    if (redisEnabled && redisClient) {
      const cached = await redisClient.get(CONFIG_CACHE_KEY);

      if (cached) {
        // Redis HIT → Load into memory
        cachedConfig = JSON.parse(cached);
        return;
      }

      // Redis MISS → Refresh from DB (after FLUSH or DEL)
      await refreshConfig();
      return;
    }

    // Redis disabled → direct refresh
    await refreshConfig();
  } catch (err) {
    errorWithTime("Config init error:", err.message);
    await refreshConfig();
  }
}

// ---- Sync Getter ----
function getConfigSync() {
  if (!cachedConfig) {
    // Server just started, config not yet loaded
    return { api_version: process.env.API_VERSION };
  }
  return cachedConfig;
}

// ---- Manual reload ----
async function reloadConfig() {
  return await refreshConfig();
}

// ---- On DB connected ----
mongoose.connection.once("open", () => {
  initConfig();
});

module.exports = { getConfigSync, reloadConfig };




// const { errorWithTime } = require('./helpers');

// let cachedConfig = null;
// let lastLoadedTime = 0;
// const CACHE_TTL = 1 * 60 * 1000;
// // Load config once at startup
// const loadConfig = async (retry = 0) => {
//   try {
//     cachedConfig = await configModel.findOne({});
//     lastLoadedTime = Date.now();
//   } catch (err) {
//     if (retry < 3) {
//       await new Promise(r => setTimeout(r, 3000));
//       return loadConfig(retry + 1);
//     }
//     errorWithTime("Failed to load config after retries:", err);
//   }
// };

// mongoose.connection.once('open', () => {
//   loadConfig();
// });

// // Sync getter
// const getConfigSync = () => {
//   const now = Date.now();

//   if (!cachedConfig || (now - lastLoadedTime > CACHE_TTL)) {
//     loadConfig();
//   }
//   return cachedConfig || { api_version: process.env.API_VERSION };
// }

// // Optional: force reload later
// const reloadConfig = async () => {
//   await loadConfig();
//   return cachedConfig;
// };

// module.exports = { getConfigSync, reloadConfig };
