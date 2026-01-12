const InningModel = require('../models/inningModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../helpers/dbHelper');
const { getFieldName, getOffset } = require('../helpers/helpers');
const { getContextValue } = require('../middlewares/requestContext');

exports.fieldData = async(req, res) => {
    try{
        let {matchId, inningNumber, resource} = req.params;
        let {order, paged, per_page} = req.query;
        const apiName = getContextValue('api_name');
        const fieldName = getFieldName(apiName);
        if(!inningNumber || inningNumber <= 0){
            inningNumber = 1;
        }
        paged = Number(paged) || 1;

        const filters = {
            match_id: Number(matchId),
            inning_number: Number(inningNumber),
        };
        let result = await getFieldByAPI(InningModel, fieldName, filters);
        if (result && resource === 'commentary') {
            const offset = getOffset(paged, per_page);

            const parsedResult =
                typeof result === 'string' ? JSON.parse(result) : result;

            let commentariesArray = Array.isArray(parsedResult?.commentaries)
                ? [...parsedResult.commentaries]
                : [];
            
            if (String(order).toLowerCase() === 'desc') {
                commentariesArray.reverse();
            }

            parsedResult.commentaries =
                per_page > 0
                    ? commentariesArray.slice(offset, offset + per_page)
                    : commentariesArray;

            result = parsedResult;
        }
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}