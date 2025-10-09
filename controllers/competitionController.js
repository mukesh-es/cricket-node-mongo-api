const HighlightModel = require('../models/highlightModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../utils/dbHelper');

exports.competitions = async(req, res) => {
    try{
        const {highlight_compilation, country} = req.query;
        let fieldName;
        let result;
        if(highlight_compilation && country){
            fieldName = `hightlighted_series_${country.toLowerCase()}`;
        }
        if(fieldName){
            result = await getFieldByAPI(HighlightModel, fieldName);
        }
        const response = {
            status: "ok",
            response: result ? result : []
        }
        requestSuccess(res, "Data success", response);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}