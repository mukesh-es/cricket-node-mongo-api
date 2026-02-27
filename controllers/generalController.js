const ChangeLogModel = require('../models/changeLogModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI, itemsResponse } = require('../helpers/dbHelper');
const { getApiURL, isValidId, getPagination } = require('../helpers/helpers');
const { getConfigSync, reloadConfig } = require('../helpers/configHelper');
const callAPI = require('../helpers/apiHelper');
const { getContextValue } = require('../middlewares/requestContext');
const { formatChangeLogList, formatChangeLogInfo } = require('../helpers/formatHelper');

exports.config = async(req, res) => {
    try{
        const {app_default_urls, reload} = req.query;
        if(reload){
            reloadConfig();
        }

        let result = {};
        if(app_default_urls){
            result = getConfigSync();
    
            result.default_urls.token = process.env.FALSE_TOKEN;
            result.token = process.env.FALSE_TOKEN;
            delete result.other_allowed_tokens;
        }

        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}

exports.fieldData = async(req, res) => {
    try{
        const {id, paged, per_page} = req.query;
        const apiName = getContextValue('api_name');
        let resourceModel;
        let filters = {};
        let result;
        if(apiName === 'changelogs'){
            const validId = isValidId(id);
            let descriptionStatus = false;
            if(validId){
                filters.id = Number(id);
                descriptionStatus = true;
            }
            const totalItems = await ChangeLogModel.countDocuments(filters);
            const pagination = getPagination(paged, per_page);
            logsResult = await ChangeLogModel.find(filters);
            const items = logsResult.map(r =>
                validId ? formatChangeLogInfo(r) : formatChangeLogList(r)
            );
            const totalItemsCount = Number(totalItems);
            result = itemsResponse(items, totalItemsCount, pagination.limit);
            if(validId && totalItemsCount > 0){
                result.items = result.items[0];
            }
        }

        if(resourceModel){
            result = await getFieldByAPI(resourceModel, apiName);
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
        const url = getApiURL({path: req.originalUrl});
        const result = await callAPI({req, url, method: req.method});
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}