const MatchModel = require('../models/matchesModel');
const HighlightModel = require('../models/highlightModel');
const InningModel = require('../models/inningModel');

const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI, getMatchesList } = require('../helpers/dbHelper');
const { getFieldName, getApiURL, getValidCountry } = require('../helpers/helpers');
const callAPI = require('../helpers/apiHelper');
const { getContextValue } = require('../middlewares/requestContext');

exports.fieldData = async(req, res) => {
    try{
        const {matchId, resource} = req.params;
        const {iid, pid} = req.query;
        const apiName = getContextValue('api_name');
        const fieldName = getFieldName(apiName);
        let result;
        let resourceModel;
        let filters = {match_id: Number(matchId)};
        if(iid && resource === 'playerwagon'){
            if(pid == 'all'){
                filters.iid = Number(iid);
                resourceModel = InningModel;
            }else{
                const url = getApiURL(req.originalUrl);
                result = await callAPI({url});
            }
        }else if(resource === 'newpoint2'){
            const url = getApiURL(req.originalUrl, 'rest');
            result = await callAPI({url});
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