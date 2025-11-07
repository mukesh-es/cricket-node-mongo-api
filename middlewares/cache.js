const { HTTP_CODE } = require('../config/constants');
const { redisClient, redisEnabled } = require('../config/redis');
const { sendResponse } = require('../utils/responseHandler');
const { getContextValue } = require('../middlewares/requestContext');

const cache = ({cacheKey, ttl = process.env.REDIS_DEFAULT_TTL}={}) => {
    return async(req, res, next) => {
        if(!redisEnabled) return next();
        
        if(!cacheKey){
            cacheKey = getContextValue('api_name');
        }

        const key = `mongo_${cacheKey}:${req.originalUrl}`;
        try{
            const cachedData = await redisClient.get(key);
            if(cachedData) return sendResponse(res, HTTP_CODE.SUCCESS, cachedData);

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