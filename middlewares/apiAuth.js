const { verifyToken, getConfigToken } = require('../helpers/cacheHelper');
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

            const configToken  = getConfigToken();

            setContextValue('token', configToken);
            setContextValue('api_name', getApiName(req.originalUrl));

            next();
        }catch(err){
            requestFailed({res, err});
        }
    });
}

module.exports = apiAuth;