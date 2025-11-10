
const { getRedisClient, redisEnabled } = require('../config/redis');
const { getConfigSync } = require("../helpers/configHelper");
const { getContextValue } = require('../middlewares/requestContext');
const mysqlDB = require('../db/mysqlDB');

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
    console.error(`Cache error for key ${cacheKey}:`, err.message);
    // Fail-safe: always fall back to DB
    return await fetcher();
  }
}

function verifyToken(token){
    const apiConfig = getConfigSync();
    if(apiConfig && apiConfig.token === token){
        return true;
    }
    return false;
}

async function getTokenData(token) {
  const cacheKey = `token_data:${token}`;
  return getOrSetCache(cacheKey, async () => {
    const [rows] = await mysqlDB.execute(
      `SELECT app_id, subscription_id FROM es_user_apps WHERE token=? LIMIT 1`,
      [token]
    );
    return rows.length > 0 ? rows[0] : null;
  });
}

async function getTokenPlan(){
  const token  = getContextValue('token');
  const cacheKey = `token_plan:${token}`;
  return getOrSetCache(cacheKey, async () => {
    const [result] = await mysqlDB.execute(`
          SELECT sub.plan_id
          FROM es_user_apps as apps
          JOIN es_user_subscriptions as sub
          ON apps.subscription_id=sub.subscription_id
          WHERE token=?
        `, [token]
      );
      return result && result.length > 0 ? result[0].plan_id : null;
  });
}

async function getTokenFeatures(type) {
  const planId = await getTokenPlan();
  if (!planId) return [];

  const cacheKey = `token_${type}:${planId}`;
  
  return getOrSetCache(cacheKey, async () => {
    const [result] = await mysqlDB.execute(
      `SELECT value FROM es_cricket_plan_features WHERE type=? AND plan_id=?`,
      [type, planId]
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

const crypto = require('crypto');

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

module.exports = { verifyToken, getTokenData, getTokenFeatures, getTokenPlan, getApiCacheTime, getCacheKey };
