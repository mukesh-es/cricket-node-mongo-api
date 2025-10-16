const redis = require('redis');
const redisEnabled = process.env.REDIS_ENABLED === 'true';

let redisClient = null;

if(redisEnabled){
    redisClient = redis.createClient({url: process.env.REDIS_URL});
    redisClient.on('error', (err) => console.error("Redis error: ", err));

    (async() => {
        await redisClient.connect();
    })();
}

module.exports = {redisClient, redisEnabled};
