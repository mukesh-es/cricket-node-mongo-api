const apiHit = require('../models/apiHitModel');
const {formatDate} = require('../utils/dateUtils');
const { getApiName } = require('../utils/helpers');

const apiHitCount = async (req, res, next) => {
    try{
        const endpoint = req.path;
        const apiName = getApiName(endpoint);

        const today = formatDate();

        await apiHit.updateOne(
            {
                api_name: apiName,
                date: today
            },
            {$inc: {count: 1}},
            {upsert: true}
        );
        console.log(`API hit recorded: ${apiName} on ${today}`);
    } catch(err){
        console.error('API tracking error: ', err.message);
    }
    next();
}

module.exports = apiHitCount;