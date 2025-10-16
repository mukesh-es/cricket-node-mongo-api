const RankTourModel = require('../models/rankTourModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getFieldByAPI } = require('../helpers/dbHelper');

exports.fieldData = async(req, res) => {
    try{
        const result = await getFieldByAPI(RankTourModel, 'iccranks');
        requestSuccess({res, result});
    } catch(err){
        requestFailed({res, err});
    }
}