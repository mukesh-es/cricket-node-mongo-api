const MatchModel = require('../models/matchesModel');
const HighlightModel = require('../models/highlightModel');
const InningModel = require('../models/inningModel');

const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI, getMatchesList } = require('../helpers/dbHelper');
const { getFieldName, getApiURL, getValidCountry, replacePathSegment, removeQueryParam } = require('../helpers/helpers');
const callAPI = require('../helpers/apiHelper');
const { getContextValue } = require('../middlewares/requestContext');

exports.fieldData = async(req, res) => {
    try{
        const {matchId, resource, latest} = req.params;
        const {iid, pid, pointapi} = req.query;
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
                const url = getApiURL({path: req.originalUrl});
                result = await callAPI({url});
            }
        }else if(resource === 'newpoint2'){
            let url='';
            if(pointapi && pointapi == 1){
                let rewrittenPath = replacePathSegment(req.originalUrl, 'newpoint2', 'point');
                // rewrittenPath = removeQueryParam(rewrittenPath, 'point');
                url = getApiURL({path: rewrittenPath, base: 'appapi'});
            }else{
                url = getApiURL({path: req.originalUrl, base: 'rest', routePrefix: 'appapi'});
            }
            result = await callAPI({url});
        } else{
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