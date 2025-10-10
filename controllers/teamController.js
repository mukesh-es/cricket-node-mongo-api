const TeamModel = require('../models/teamModel');
const TeamTrackerModel = require('../models/teamTrackerModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../utils/dbHelper');
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

exports.fieldData = async(req, res) => {
    try{
        const {teamId, resource} = req.params;
        const apiName = getApiName(req.originalUrl);
        const fieldName = getFieldName(apiName);
        const filters = {
            tid: Number(teamId),
        };
        let resourceModel = resource == 'crickettracker' ? TeamTrackerModel : TeamModel;
        const result = await getFieldByAPI(resourceModel, fieldName, filters);
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}