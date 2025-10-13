const MatchModel = require('../models/matchesModel');
const HighlightModel = require('../models/highlightModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../utils/dbHelper');
const { unixTimestamp } = require('../utils/dateUtils');
const { getApiName, getFieldName, getPagination } = require('../utils/helpers');

exports.fieldData = async(req, res) => {
    try{
        const {matchId} = req.params;
        const apiName = getApiName(req.originalUrl);
        const fieldName = getFieldName(apiName);
        const filters = {match_id: Number(matchId)};
        const result = await getFieldByAPI(MatchModel, fieldName, filters);
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}

exports.matches = async(req, res) => {
    try{
        const {
            highlight_live_matches, 
            highlight_compilation, 
            country,
            status,
            per_page,
            paged,
            date
        } = req.query;
        let fieldName;
        let resourceModel;
        let result;

        let filters  = {};
        
        // Highlight Matches
        if(highlight_live_matches && country){
            fieldName = `highlight_live_matches_${country.toLowerCase()}`;
            resourceModel = HighlightModel;
        }else if(highlight_compilation && country){
            fieldName = `highlight_compilation_${country.toLowerCase()}`;
            resourceModel = HighlightModel;
        }else{
            // Matches
            let orderType = 'DESC';
            if(status == 1){
                orderType = 'ASC';
            }
            if(status > 0){
                filters.status_id = status;
            }
            const pagination = getPagination(paged, per_page);
            result = await MatchModel.find(filters).sort(orderType).skip(pagination.offset).limit(pagination.limit);
        }
        if(fieldName){
            result = await getFieldByAPI(resourceModel, fieldName);
        }
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}