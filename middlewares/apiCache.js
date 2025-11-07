const { HTTP_CODE } = require('../config/constants');
const { redisClient, redisEnabled } = require('../config/redis');
const { sendResponse } = require('../utils/responseHandler');
const { getContextValue } = require('../middlewares/requestContext');
const { getApiCacheTime, getCacheKey } = require('../helpers/cacheHelper');
const { apiMap } = require('../config/apiMap');

const apiCache = ({cacheKey, ttl = 0}={}) => {

    return async(req, res, next) => {
        if(!redisEnabled) return next();
        
        const apiName = getContextValue('api_name');
        if(!cacheKey){
            cacheKey = apiName;
        }

        const mappedAPI = apiMap[apiName];
        const cacheTime = ttl <= 0 ? getApiCacheTime(mappedAPI) : ttl;

        const key = getCacheKey(req, cacheKey);
        try{
            const cachedData = await redisClient.get(key);
            if(cachedData) return sendResponse(res, HTTP_CODE.SUCCESS, cachedData);

            const originalJson = res.json.bind(res);
            res.json = async (body) => {
                redisClient.setEx(key, parseInt(cacheTime), JSON.stringify(body))
                .catch(err => console.error('Cache write error:', err));

                originalJson(body);
            };
            next();
        } catch(err){
            console.error('Redis cache error:', err);
            next();
        }
    }
}
module.exports = apiCache;