const VenueModel = require('../models/venueModel');
const MatchModel = require('../models/matchesModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI, getMatchesList } = require('../helpers/dbHelper');
const { getApiName, getFieldName, getPagination } = require('../helpers/helpers');

exports.info = async(req, res) => {
    try{
        const {venueId} = req.params;
        const filters = {venue_id: Number(venueId)};
        const result = await getFieldByAPI(VenueModel, 'venues_info', filters);
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}

exports.fieldData = async(req, res) => {
    try{
        const {venueId, resource} = req.params;
        const queryParams = req.query;
        const apiName = getApiName(req.originalUrl);
        const fieldName = getFieldName(apiName);
        const filters = {
            venue_id: Number(venueId),
        };

        let result;
        if(resource === 'matches'){
            queryParams.venue_id = venueId;
            result = await getMatchesList(queryParams);
        }else{
            result = await getFieldByAPI(VenueModel, fieldName, filters);
        }
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}