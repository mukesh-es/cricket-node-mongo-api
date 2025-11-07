const RankTourModel = require('../models/rankTourModel');
const TourStatModel = require('../models/tourStatModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../helpers/dbHelper');
const { getFieldName, getApiURL } = require('../helpers/helpers');
const callAPI = require('../helpers/apiHelper');
const { getContextValue } = require('../middlewares/requestContext');

exports.fieldData = async(req, res) => {
    try{
        const {tournamentId, resource} = req.params;
        const apiName = getContextValue('api_name');
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
        
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}

exports.stats = async(req, res) => {
    try{
        const {tournamentId, statType} = req.params;
        const {team_id} = req.query;
        let fieldName = statType;
        if(!statType){
            fieldName = 'default';
        }
        const filters = {tournament_id: Number(tournamentId)};
        let result;
        if(team_id){
            result = await callAPI(getApiURL( req.originalUrl));
        }else{
            result = await getFieldByAPI(TourStatModel, fieldName, filters);
        }
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}