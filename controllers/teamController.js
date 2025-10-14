const TeamModel = require('../models/teamModel');
const TeamTrackerModel = require('../models/teamTrackerModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI, getMatchesList, getTeamsList } = require('../utils/dbHelper');
const { getApiName, getFieldName } = require('../utils/helpers');

exports.info = async(req, res) => {
    try{
        const {teamId} = req.params;
        const filters = {tid: Number(teamId)};
        const result = await getFieldByAPI(TeamModel, 'teams_info', filters);
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}

exports.teams = async(req, res) => {
    try{
        const queryParams = req.query;
        const result = await getTeamsList(queryParams);
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}

exports.fieldData = async(req, res) => {
    try{
        const {teamId, resource} = req.params;
        const queryParams = req.query;
        const apiName = getApiName(req.originalUrl);
        const fieldName = getFieldName(apiName);
        const filters = {
            tid: Number(teamId),
        };

        let result;
        if(resource === 'matches'){
            queryParams.team_id = teamId;
            result = await getMatchesList(queryParams);
        }else{
            let resourceModel = resource == 'crickettracker' ? TeamTrackerModel : TeamModel;
            result = await getFieldByAPI(resourceModel, fieldName, filters);
        }
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}