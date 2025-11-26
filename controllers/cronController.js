const { hitsUpdateCron } = require("../cron");
const { requestSuccess, requestFailed } = require('../utils/responseHandler');

exports.hitsUpdate = async(req, res) => {
    try{
        await hitsUpdateCron();
        requestSuccess({res, message: "Hits updated successfully"});
    } catch(err){
        requestFailed({res, err});
    }
}