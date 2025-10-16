const { redisClient, redisEnabled } = require('../config/redis');
const { getApiName } = require('../utils/helpers');


const cache = ({cacheKey, ttl = process.env.REDIS_DEFAULT_TTL}={}) => {
    return async(req, res, next) => {
        if(!redisEnabled) return next();
        
        if(!cacheKey){
            cacheKey = getApiName(req.originalUrl);
        }

        const key = `mongo_${cacheKey}:${req.originalUrl}`;
        try{
            const cachedData = await redisClient.get(key);
            if(cachedData) return requestSuccess(res, "Datch fetched from cache", cachedData);

            const originalJson = res.json.bind(res);
            res.json = async (body) => {
                await redisClient.setEx(key, parseInt(ttl), JSON.stringify(body));
                originalJson(body);
            };
            next();
        } catch(err){
            console.error('Redis cache error:', err);
            next();
        }
    }
}
module.exports = cache;