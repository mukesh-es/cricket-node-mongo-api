const TeamModel = require('../models/teamModel');
const TeamTrackerModel = require('../models/teamTrackerModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI, getMatchesList, getTeamsList } = require('../helpers/dbHelper');
const { getApiName, getFieldName } = require('../helpers/helpers');

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
        const apiName = getApiName(req.originalUrl);
        const fieldName = getFieldName(apiName);
        const filters = {
            tid: Number(teamId),
        };

        if(format && format > 0){
            filters.formats = format;
        }

        let result;
        if(resource === 'matches'){
            queryParams.team_id = teamId;
            result = await getMatchesList(queryParams);
        }else{
            let resourceModel = resource == 'crickettracker' ? TeamTrackerModel : TeamModel;
            result = await getFieldByAPI(resourceModel, fieldName, filters);
        }
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}