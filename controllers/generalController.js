const RankTourModel = require('../models/rankTourModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../utils/dbHelper');
const { getApiName } = require('../utils/helpers');
const { getConfigSync } = require('../utils/apiConfigHelper');

exports.config = async(req, res) => {
    try{
        const result = getConfigSync();
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}

exports.fieldData = async(req, res) => {
    try{
        const apiName = getApiName(req.originalUrl);
        let resourceModel;
        if(apiName === 'changelogs'){
            resourceModel = RankTourModel;
        }
        const result = await getFieldByAPI(resourceModel, apiName);
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}