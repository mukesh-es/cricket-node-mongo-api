const { verifyToken } = require('../helpers/configHelper');
const { requestFailed } = require('../utils/responseHandler');

const apiAuth = (req, res, next) => {
    try{
        const { token } = req.query;

        if(!token || !verifyToken(token)){
            return requestFailed({
                res, 
                message: "Invalid token",
            });
        }
        next();
    }catch(err){
        requestFailed({res, err});
    }
}

module.exports = apiAuth;