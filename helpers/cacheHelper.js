
const { redisClient, redisEnabled } = require('../config/redis');
const { getConfigSync } = require("../helpers/configHelper");
const { getContextValue } = require('../middlewares/requestContext');
const mysqlDB = require('../db/mysqlDB');

async function getOrSetCache(cacheKey, fetcher, ttlSeconds = 600) {
  try {
    if (!redisEnabled) {
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
      await redisClient.setEx(cacheKey, ttlSeconds, JSON.stringify(data));
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

async function getTokenCompetitions(){
  const planId = await getTokenPlan();
  if(!planId) return [];

  const cacheKey = `token_competitions:${planId}`;
  return getOrSetCache(cacheKey, async () => {
    
    const [result] = await mysqlDB.execute(
        `SELECT value FROM es_cricket_plan_features WHERE type='competition' AND plan_id=?`, 
        [planId]
    );
    return result && result.length > 0 ? result.map(r => Number(r.value)) : [];
  });
}


module.exports = { verifyToken, getTokenData, getTokenCompetitions, getTokenPlan };
