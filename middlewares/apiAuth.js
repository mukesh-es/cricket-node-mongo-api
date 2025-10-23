const { verifyToken } = require('../helpers/configHelper');
const { requestFailed, requestSuccess } = require('../utils/responseHandler');
const { getApiName } = require('../helpers/helpers');

const apiAuth = (req, res, next) => {
    try{
        const { token, api_name } = req.query;

        if(!token || !verifyToken(token)){
            return requestFailed({
                res, 
                message: "Invalid token",
            });
        }
        if(api_name){
            return requestSuccess({res, result: {
                api_name: getApiName(req.originalUrl)
            }});
        }
        next();
    }catch(err){
        requestFailed({res, err});
    }
}

module.exports = apiAuth;