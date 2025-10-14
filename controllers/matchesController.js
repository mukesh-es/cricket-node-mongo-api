const MatchModel = require('../models/matchesModel');
const HighlightModel = require('../models/highlightModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI, getMatchesList } = require('../utils/dbHelper');
const { getApiName, getFieldName } = require('../utils/helpers');

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
        const queryParams = req.query;
        const {
            highlight_live_matches, 
            highlight_compilation, 
            country
        } = queryParams;
        let fieldName;
        let resourceModel;
        let result;
        
        // Highlight Matches
        if(highlight_live_matches && country){
            fieldName = `highlight_live_matches_${country.toLowerCase()}`;
            resourceModel = HighlightModel;
        }else if(highlight_compilation && country){
            fieldName = `highlight_compilation_${country.toLowerCase()}`;
            resourceModel = HighlightModel;
        }else{
            // Matches
            result = await getMatchesList(queryParams);
        }
        if(fieldName){
            result = await getFieldByAPI(resourceModel, fieldName);
        }
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}