const VenueModel = require('../models/venueModel');
const MatchModel = require('../models/matchesModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../helpers/dbHelper');
const { getApiName, getFieldName, getPagination } = require('../helpers/helpers');

exports.info = async(req, res) => {
    try{
        const {venueId} = req.params;
        const filters = {venue_id: Number(venueId)};
        const result = await getFieldByAPI(VenueModel, 'venues_info', filters);
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}

exports.fieldData = async(req, res) => {
    try{
        const {venueId, resource} = req.params;
        const {paged, per_page} = req.query;
        const apiName = getApiName(req.originalUrl);
        const fieldName = getFieldName(apiName);
        const filters = {
            venue_id: Number(venueId),
        };

        let result;
        if(fieldName == "venues_matches"){
            const pagination = getPagination(paged, per_page);
            result = await MatchModel.find(filters).skip(pagination.offset).limit(pagination.limit);
        }else{
            result = await getFieldByAPI(VenueModel, fieldName, filters);
        }
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}