const HighlightModel = require('../models/highlightModel');
const CompetitionModel = require('../models/competitionModel');
const CompStatModel = require('../models/compStatModel');

const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI, getMatchesList } = require('../helpers/dbHelper');
const { getFieldName, getValidCountry, getApiURL } = require('../helpers/helpers');
const { getContextValue } = require('../middlewares/requestContext');
const callAPI = require('../helpers/apiHelper');


exports.info = async(req, res) => {
    try{
        const {competitionId} = req.params;
        const filters = {cid: Number(competitionId)};
        const result = await getFieldByAPI(CompetitionModel, 'competitions_info', filters);
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}

exports.fieldData = async(req, res) => {
    try{
        const {competitionId, resource} = req.params;
        console.log('resource: ', resource);
        const queryParams = req.query;
        const {format} = queryParams;
        const apiName = getContextValue('api_name');
        const fieldName = getFieldName(apiName);
        const filters = {
            cid: Number(competitionId),
        };
        console.log('apiName: ', apiName);
        let result;
        if(resource === 'stats'){
            // Default Stats
            result = await getFieldByAPI(CompStatModel, 'default', filters);
        }else if(resource === 'matches'){
            queryParams.cid = competitionId;
            result = await getMatchesList(queryParams);
        }else if(resource === 'crickettracker'){
            if(format){
                filters.format = format;
            }
            result = await getFieldByAPI(CompStatModel, resource, filters);
        }else if(resource === 'teams'){
            const url = getApiURL(req.originalUrl);
            console.log(url);
            result = await callAPI({url});
        }else{
            result = await getFieldByAPI(CompetitionModel, fieldName, filters);
        }
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}

exports.competitions = async(req, res) => {
    try{
        let {highlight_compilation, country} = req.query;
        let fieldName;
        let result;

        country = getValidCountry(country);
        if(highlight_compilation && country){
            fieldName = `hightlighted_series_${country.toLowerCase()}`;
        }
        if(fieldName){
            result = await getFieldByAPI(HighlightModel, fieldName);
        }
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
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
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}