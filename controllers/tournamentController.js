const RankTourModel = require('../models/rankTourModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../utils/dbHelper');
const { getOffset } = require('../utils/helpers');

exports.fieldData = async(req, res) => {
    try{
        const result = await getFieldByAPI(RankTourModel, 'tournaments_list');
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}

exports.stats = async(req, res) => {
    try{
        const {tournamentId, statType} = req.params;
        // const {per_page, paged} = req.query;
        // const offset = getOffset(paged, per_page);
        const apiName = getApiName(req.originalUrl);
        const fieldName = getFieldName(apiName);

        const result = await getFieldByAPI(RankTourModel, 'tournaments_list');
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}