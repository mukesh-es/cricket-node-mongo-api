const RankTourModel = require('../models/rankTourModel');
const TourStatModel = require('../models/tourStatModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../utils/dbHelper');
const { getApiName, getFieldName } = require('../utils/helpers');

exports.fieldData = async(req, res) => {
    try{
        const {tournamentId, resource} = req.params;
        const apiName = getApiName(req.originalUrl);
        const fieldName = getFieldName(apiName);
        const filters = {
            tournament_id: Number(tournamentId),
        };
        
        let result;
        if(resource === 'stats'){
            // Default Stats
            result = await getFieldByAPI(TourStatModel, 'default', filters);
        }else if(fieldName == 'tournaments'){
            result = await getFieldByAPI(RankTourModel, 'tournaments_list');
        }else{
            result  = await getFieldByAPI(TourStatModel, fieldName, filters);
        }
        
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}

exports.stats = async(req, res) => {
    try{
        const {tournamentId, statType} = req.params;
        let fieldName = statType;
        if(!statType){
            fieldName = 'default';
        }
        const filters = {tournament_id: Number(tournamentId)};
        const result = await getFieldByAPI(TourStatModel, fieldName, filters);
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}