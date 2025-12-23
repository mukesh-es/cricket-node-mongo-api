const { HTTP_CODE } = require('../config/constants');
const { getRedisClient, redisEnabled } = require('../config/redis');
const { sendResponse } = require('../utils/responseHandler');
const { getContextValue } = require('../middlewares/requestContext');
const { getApiCacheTime, getCacheKey } = require('../helpers/cacheHelper');
const { apiMap } = require('../config/apiMap');
const { errorWithTime } = require('../helpers/loggerHelper');

const apiCache = ({cacheKey, ttl = 0}={}) => {

    return async(req, res, next) => {
        if(!redisEnabled) return next();

        const redisClient = getRedisClient();
        if (!redisClient) return next();
        
        const apiName = getContextValue('api_name');
        if(!cacheKey){
            cacheKey = apiName;
        }

        const mappedAPI = apiMap[apiName];
        const cacheTime = ttl <= 0 ? getApiCacheTime(mappedAPI) : ttl;

        const key = getCacheKey(req, cacheKey);
        try{

            const cachedData = await redisClient.get(key);
            if (cachedData) {
                try {
                    const parsedData = JSON.parse(cachedData);
                    return sendResponse(res, HTTP_CODE.SUCCESS, parsedData);
                } catch {
                    errorWithTime("Invalid cached data");
                }
            }

            const originalJson = res.json.bind(res);
            res.json = async (body) => {
                if (body && typeof body === 'object') {
                    redisClient.setEx(key, parseInt(cacheTime), JSON.stringify(body))
                    .catch(err => errorWithTime('Cache write error:', err));
                }
                return originalJson(body);
            };
            next();
        } catch(err){
            errorWithTime('Redis cache error:', err);
            next();
        }
    }
}
module.exports = apiCache;