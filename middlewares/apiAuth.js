const { verifyToken } = require('../helpers/cacheHelper');
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
            if(req.query.api_name){
                const apiName = getContextValue('api_name');
                return requestSuccess({res, result: {
                    api_name: apiName
                }});
            }

            setContextValue('token', token);
            setContextValue('api_name', getApiName(req.originalUrl));

            next();
        }catch(err){
            requestFailed({res, err});
        }
    });
}

module.exports = apiAuth;