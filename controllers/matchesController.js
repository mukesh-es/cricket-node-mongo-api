const MatchModel = require('../models/matchesModel');
const HighlightModel = require('../models/highlightModel');
const InningModel = require('../models/inningModel');

const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI, getMatchesList } = require('../helpers/dbHelper');
const { getApiName, getFieldName, getApiURL, getValidCountry } = require('../helpers/helpers');
const callAPI = require('../helpers/apiHelper');

exports.fieldData = async(req, res) => {
    try{
        const {matchId, resource} = req.params;
        const {iid, pid} = req.query;
        const apiName = getApiName(req.originalUrl);
        const fieldName = getFieldName(apiName);
        let result;
        let resourceModel;
        let filters = {match_id: Number(matchId)};
        const apiURL = getApiURL(req.originalUrl);
        if(iid && resource === 'playerwagon'){
            if(pid == 'all'){
                filters.iid = Number(iid);
                resourceModel = InningModel;
            }else{
                result = await callAPI(apiURL);
            }
        }else if(resource === 'newpoint2'){
            result = await callAPI(apiURL);
        }else{
            resourceModel = MatchModel;
        }
        if(resourceModel && fieldName){
            result = await getFieldByAPI(resourceModel, fieldName, filters);
        }
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}

exports.matches = async(req, res) => {
    try{
        const queryParams = req.query;
        queryParams.api_name = getApiName(req.originalUrl);
        let {
            highlight_live_matches, 
            highlight_compilation, 
            country
        } = queryParams;
        let fieldName;
        let resourceModel;
        let result;
        
        // Highlight Matches
        country = getValidCountry(country);
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
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}