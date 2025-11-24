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
        const {id} = req.query;
        const apiName = getContextValue('api_name');
        let resourceModel;
        $isChangeLogs = apiName === 'changelogs';
        if($isChangeLogs){
            resourceModel = RankTourModel;
        }
        let result = await getFieldByAPI(resourceModel, apiName);
        if($isChangeLogs){
            let items = result?.items || [];
            if (id) {
                const filteredItem = items.find(item => Number(item.id) === Number(id)) || null;
                if(result){
                    result = {
                        items: filteredItem,
                        total_items: 1,
                        total_pages: 1,
                    }
                }
            }
        }
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