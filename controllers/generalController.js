const RankTourModel = require('../models/rankTourModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../helpers/dbHelper');
const { getApiName, getApiURL } = require('../helpers/helpers');
const { getConfigSync } = require('../helpers/configHelper');
const callAPI = require('../helpers/apiHelper');

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
        const apiName = getApiName(req.originalUrl);
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
        const result = await callAPI(getApiURL(req.originalUrl));
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}