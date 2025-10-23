const { verifyToken } = require('../helpers/configHelper');
const { requestFailed, requestSuccess } = require('../utils/responseHandler');

const apiAuth = (req, res, next) => {
    try{
        const { token } = req.query;

        if(!token || !verifyToken(token)){
            return requestFailed({
                res, 
                message: "Invalid token",
            });
        }
        // return requestSuccess({res, result: {
        //     api_name: getApiName(req.originalUrl)
        // }});
        next();
    }catch(err){
        requestFailed({res, err});
    }
}

module.exports = apiAuth;