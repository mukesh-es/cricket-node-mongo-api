const RankTourModel = require('../models/rankTourModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../helpers/dbHelper');
const { getApiURL } = require('../helpers/helpers');
const { getConfigSync } = require('../helpers/configHelper');
const callAPI = require('../helpers/apiHelper');
const { getContextValue } = require('../middlewares/requestContext');

exports.config = async(req, res) => {
    try{
        const result = getConfigSync();
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}

exports.fieldData = async(req, res) => {
    try{
        const apiName = getContextValue('api_name');
        let resourceModel;
        if(apiName === 'changelogs'){
            resourceModel = RankTourModel;
        }
        const result = await getFieldByAPI(resourceModel, apiName);
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}

exports.apiCall = async(req, res) => {
    try{
        const url = getApiURL(req.originalUrl);
        const result = await callAPI({url, method: req.method});
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}