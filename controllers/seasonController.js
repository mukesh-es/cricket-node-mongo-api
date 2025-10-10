const ReelModel = require('../models/reelModel');
const NewsModel = require('../models/newsModel');
const { requestSuccess, requestFailed } = require('../utils/responseHandler');
const { getOffset } = require('../utils/helpers');

exports.fieldData = async(req, res) => {
    try{
        const {season, resource} = req.params;
        const {per_page, paged} = req.query;
        const offset = getOffset(paged, per_page);
        let resourceModel;
        let orderBy;
        if(resource == 'news'){
            resourceModel = NewsModel;
            orderBy = { created: -1 };
        }else if(resource == 'competitions'){
            resourceModel = ReelModel;
            orderBy = { orderby_time: -1 };
        }
        const result = await resourceModel.find().sort(orderBy).skip(offset).limit(per_page);
        requestSuccess(res, "Data success", result);
    } catch(err){
        requestFailed(res, "Something went wrong");
    }
}