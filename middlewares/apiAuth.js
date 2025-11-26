const { verifyToken, normalizeToken } = require('../helpers/cacheHelper');
const { requestFailed, requestSuccess } = require('../utils/responseHandler');
const { getApiName } = require('../helpers/helpers');
const { runWithContext, getContextValue, setContextValue } = require('./requestContext');

const apiAuth = (req, res, next) => {
    runWithContext(req, res, async () => {
        try{
            const { token } = req.query;

            if(!token || !verifyToken(token)){
                return requestFailed({
                    res, 
                    message: "Invalid token",
                });
            }

            const normalizedToken  = normalizeToken(token);

            setContextValue('token', normalizedToken);
            setContextValue('api_name', getApiName(req.originalUrl));

            next();
        }catch(err){
            requestFailed({res, err});
        }
    });
}

module.exports = apiAuth;