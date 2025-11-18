const redis = require('redis');
const { errorWithTime } = require('../helpers/helpers');

const redisEnabled = process.env.REDIS_ENABLED === 'true';
let redisClient = null;

async function connectRedis() {
  if (!redisEnabled) {
    return null;
  }

  if (redisClient) return redisClient; // reuse if already connected

  try {
    redisClient = redis.createClient({ url: process.env.REDIS_URL });

    redisClient.on('error', (err) => errorWithTime('Redis error:', err));
    redisClient.on('connect', () => console.log('Redis connected'));
    redisClient.on('reconnecting', () => console.log('Redis reconnecting...'));

    await redisClient.connect();

    return redisClient;
  } catch (err) {
    errorWithTime('Redis connection failed:', err);
    redisClient = null;
    return null;
  }
}

function getRedisClient() {
  return redisClient;
}

module.exports = { connectRedis, getRedisClient, redisEnabled };
