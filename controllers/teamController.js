const TeamModel = require('../models/teamModel');
const TeamTrackerModel = require('../models/teamTrackerModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI, getTeamsList } = require('../helpers/dbHelper');
const { getFieldName, getApiURL } = require('../helpers/helpers');
const callAPI = require('../helpers/apiHelper');
const { getContextValue } = require('../middlewares/requestContext');

exports.info = async(req, res) => {
    try{
        const {teamId} = req.params;
        const filters = {tid: Number(teamId)};
        const result = await getFieldByAPI(TeamModel, 'teams_info', filters);
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}

exports.teams = async(req, res) => {
    try{
        const queryParams = req.query;
        const result = await getTeamsList(queryParams);
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}

exports.fieldData = async(req, res) => {
    try{
        const {teamId, resource} = req.params;
        const queryParams = req.query;
        const {format} = queryParams;
        const apiName = getContextValue('api_name');
        const fieldName = getFieldName(apiName);
        const filters = {
            tid: Number(teamId),
        };

        if(format && format > 0){
            filters.formats = format;
        }

        let result;
        if(resource === 'matches'){
            result = await callAPI(getApiURL(req.originalUrl));
        }else{
            let resourceModel = resource == 'crickettracker' ? TeamTrackerModel : TeamModel;
            result = await getFieldByAPI(resourceModel, fieldName, filters);
        }
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}