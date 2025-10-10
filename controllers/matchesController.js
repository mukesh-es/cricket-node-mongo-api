const MatchModel = require('../models/matchesModel');
const HighlightModel = require('../models/highlightModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../utils/dbHelper');
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
        const {highlight_live_matches, highlight_compilation, country} = req.query;
        let fieldName;
        let result;
        if(highlight_live_matches && country){
            fieldName = `highlight_live_matches_${country.toLowerCase()}`;
        }
        if(highlight_compilation && country){
            fieldName = `highlight_compilation_${country.toLowerCase()}`;
        }
        if(fieldName){
            result = await getFieldByAPI(HighlightModel, fieldName);
        }
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}