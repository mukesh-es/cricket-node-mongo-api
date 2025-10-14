const RankTourModel = require('../models/rankTourModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../utils/dbHelper');
const { getApiName, getFieldName } = require('../utils/helpers');

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