const InningModel = require('../models/inningModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../utils/dbHelper');
const { getApiName, getFieldName } = require('../utils/helpers');

exports.fieldData = async(req, res) => {
    try{
        const {matchId, inningNumber} = req.params;
        const {order} = req.query;
        const apiName = getApiName(req.originalUrl);
        const fieldName = getFieldName(apiName);
        const filters = {
            match_id: Number(matchId),
            inning_number: Number(inningNumber),
        };
        let result = await getFieldByAPI(InningModel, fieldName, filters);
        // if(result){
        //     result = JSON.parse(result);
        //     if (order && order.toLowerCase() === 'desc' && Array.isArray(result.commentaries)) {
        //         result.commentaries = [...result.commentaries].reverse();
        //     }
        // }
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}