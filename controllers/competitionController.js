const HighlightModel = require('../models/highlightModel');
const CompetitionModel = require('../models/competitionModel');
const CompStatModel = require('../models/compStatModel');
const MatchModel = require('../models/matchesModel');

const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI, getMatchesList } = require('../utils/dbHelper');
const { getApiName, getFieldName } = require('../utils/helpers');


exports.info = async(req, res) => {
    try{
        const {competitionId} = req.params;
        const filters = {cid: Number(competitionId)};
        const result = await getFieldByAPI(CompetitionModel, 'competitions_info', filters);
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}

exports.fieldData = async(req, res) => {
    try{
        const {competitionId, resource} = req.params;
        const queryParams = req.query;
        const apiName = getApiName(req.originalUrl);
        const fieldName = getFieldName(apiName);
        const filters = {
            cid: Number(competitionId),
        };

        let result;
        if(resource === 'stats'){
            // Default Stats
            result = await getFieldByAPI(CompStatModel, 'default', filters);
        }else if(resource === 'matches'){
            queryParams.cid = competitionId;
            result = await getMatchesList(queryParams);
        }else{
            result = await getFieldByAPI(CompetitionModel, fieldName, filters);
        }
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}

exports.competitions = async(req, res) => {
    try{
        const {highlight_compilation, country} = req.query;
        let fieldName;
        let result;
        if(highlight_compilation && country){
            fieldName = `hightlighted_series_${country.toLowerCase()}`;
        }
        if(fieldName){
            result = await getFieldByAPI(HighlightModel, fieldName);
        }
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}

exports.stats = async(req, res) => {
    try{
        const {competitionId, statType} = req.params;
        let fieldName = statType;
        if(!statType){
            fieldName = 'default';
        }
        const filters = {cid: Number(competitionId)};
        const result = await getFieldByAPI(CompStatModel, fieldName, filters);
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}