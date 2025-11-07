const InningModel = require('../models/inningModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../helpers/dbHelper');
const { getFieldName } = require('../helpers/helpers');
const { getContextValue } = require('../middlewares/requestContext');

exports.fieldData = async(req, res) => {
    try{
        let {matchId, inningNumber} = req.params;
        const {order} = req.query;
        const apiName = getContextValue('api_name');
        const fieldName = getFieldName(apiName);
        if(!inningNumber || inningNumber <= 0){
            inningNumber = 1;
        }
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
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}