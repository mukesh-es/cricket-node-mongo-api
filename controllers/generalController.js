const RankTourModel = require('../models/rankTourModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../helpers/dbHelper');
const { getApiName } = require('../helpers/helpers');
const { getConfigSync } = require('../helpers/configHelper');
const callAPI = require('../helpers/apiHelper');

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

exports.apiCall = async(req, res) => {
    try{
        const result = await callAPI(`${process.env.APPAPI_CDN_BASE}${req.originalUrl}`);
        console.log('result: ', result);
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}