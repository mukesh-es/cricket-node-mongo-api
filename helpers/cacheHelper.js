
const { getRedisClient, redisEnabled } = require('../config/redis');
const { getConfigSync } = require("../helpers/configHelper");
const { getContextValue } = require('../middlewares/requestContext');
const mysqlDB = require('../db/mysqlDB');
const crypto = require('crypto');
const { errorWithTime } = require('./helpers');

async function getOrSetCache(cacheKey, fetcher, ttlSeconds = 600) {
  try {
    const redisClient = getRedisClient();
    if (!redisEnabled || !redisClient) {
      // Redis disabled → query directly
      return await fetcher();
    }

    // 1️⃣ Try Redis cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2️⃣ Fetch from DB
    const data = await fetcher();

    // 3️⃣ Save to cache for ttlSeconds (10 min)
    if (data !== undefined && data !== null) {
      if (data && typeof data === 'object') {
        await redisClient.setEx(cacheKey, ttlSeconds, JSON.stringify(data));
      }
    }

    return data;
  } catch (err) {
    errorWithTime(`Cache error for key ${cacheKey}:`, err.message);
    return await fetcher();
  }
}

function verifyToken(token){
    const apiConfig = getConfigSync();

    // No config data
    if (!apiConfig) return false;

    // Token matched with token
    const { token: mainToken, other_allowed_tokens = [] } = apiConfig;

    return (
        token === mainToken ||
        other_allowed_tokens.includes(token)
    );
}

function normalizeToken(token) {
    const apiConfig = getConfigSync();
    if (!apiConfig) return null;

    return apiConfig.token; // always return main token
}

async function getTokenData() {
  const token = getContextValue('token');
  const cacheKey = `token_data:${token}`;
  return getOrSetCache(cacheKey, async () => {
    const [rows] = await mysqlDB.execute(
      `SELECT 
        apps.app_id,
        apps.subscription_id,
        sub.plan_id
      FROM es_user_apps AS apps
      LEFT JOIN es_user_subscriptions AS sub
        ON apps.subscription_id = sub.subscription_id
      WHERE apps.token = ?
      LIMIT 1`,
      [token]
    );

    return rows.length > 0 ? rows[0] : null;
  });
}

async function getTokenFeatures(type) {
  const token = getContextValue('token');
  const tokenData = await getTokenData();
  if (!tokenData) return [];

  const planId = tokenData.plan_id;
  const subscriptionId = tokenData.subscription_id;

  const cacheKey = `token_features_${type}:${token}`;
  
  
  return getOrSetCache(cacheKey, async () => {
    const [result] = await mysqlDB.execute(
      `
        SELECT value FROM es_cricket_plan_features WHERE type=? AND plan_id=?
        UNION
        SELECT value FROM subscription_features WHERE subscription_id=? AND type=?
      `,
      [type, planId, subscriptionId, type]
    );

    if (!result || result.length === 0) return [];

    return result.map(r => {
      if(r.value && r.value != ''){
        if (type === 'competition') return Number(r.value);
        if (type === 'season') return String(r.value);  
        return r.value;
      }
    });
  });
}

function getCacheKey(req, cacheKey = '') {
  const baseKey = `mongo_${cacheKey || 'api'}`;

  const query = req.query && Object.keys(req.query).length > 0
    ? JSON.stringify(Object.keys(req.query).sort().reduce((obj, key) => {
        obj[key] = req.query[key];
        return obj;
      }, {}))
    : '';

  const hash = crypto
    .createHash('md5')
    .update(`${req.originalUrl}-${query}`)
    .digest('hex');

  return `${baseKey}:${hash}`;
}


function getApiCacheTime(apiName, options = {}) {
  const cacheMap = {
    // 200 seconds
    200: [
      'competitions', 'competition_overview', 'competition_squads',
      'competition_standings', 'competition_stats', 'competition_teams',
      'competition_team_ranks', 'iccranks', 'players', 'player_profile',
      'player_stats', 'round_matches', 'round_teams', 'teams',
      'team_domestic_competitions', 'team_matches', 'team_players',
      'team_profile', 'competition_cricket_tracker', 'tournaments',
      'tournament_competitions', 'tournament_tournament_stats',
      'tournament_tournament_playerstats'
    ],

    // 5 seconds
    5: [
      'match_info', 'match_innings_info', 'match_live', 'match_scorecard',
      'matches', 'match_inning_commentary', 'match_inning_scorecard',
      'match_squads', 'season_competitions', 'season_news'
    ],

    // 600 seconds
    600: ['season_app_ads', 'seasons_all', 'seasons', 'match_squads_stats'],

    // 60 seconds
    60: [
      'competition_matches', 'match_statistics', 'match_summary',
      'match_wagons', 'competition_squads_match', 'matchcenter_info',
      'team_team_player'
    ],

    // 120 seconds
    120: [
      'match_point', 'match_new_point', 'match_new_point2',
      'match_advanced_stats', 'match_player_advanced_stats',
      'player_advancestats', 'player_player_matches',
      'player_player_vs_player_stats'
    ]
  };

  if (apiName === 'matchmatch_picks' && !options.picked_team) {
    return 1200;
  }

  for (const [time, apis] of Object.entries(cacheMap)) {
    if (apis.includes(apiName)) {
      return Number(time);
    }
  }

  return 20;
}

module.exports = { 
  verifyToken, 
  normalizeToken, 
  getTokenData, 
  getTokenFeatures, 
  getApiCacheTime, 
  getCacheKey 
};
