const apiHit = require('../models/apiHitModel');
const {formatDate, formatDateTime} = require('../utils/dateUtils');
const { getApiName } = require('../helpers/helpers');

const apiHitBuffer = {};
const BATCH_SIZE = 10;
const BATCH_INTERVAL = 5 * 60 * 1000;

const apiHitCount = async (req, res, next) => {
    try{
        const endpoint = req.path;
        const apiName = getApiName(endpoint);
        console.log('apiName: ', apiName);
        const today = formatDate();
        const bufferKey = `${apiName}|${today}`;

        if (!apiHitBuffer[bufferKey]) {
            apiHitBuffer[bufferKey] = { count: 0, lastSaved: Date.now() };
        }

        apiHitBuffer[bufferKey].count++;

        const bufferItem = apiHitBuffer[bufferKey];
        const timeSinceLastSave = Date.now() - bufferItem.lastSaved;

        if (bufferItem.count >= BATCH_SIZE || timeSinceLastSave >= BATCH_INTERVAL) {
            await flushToMongo(apiName, today, bufferItem);
        }

        // await apiHit.updateOne(
        //     {
        //         api_name: apiName,
        //         date: today
        //     },
        //     {$inc: {count: 1}},
        //     {upsert: true}
        // );
    } catch(err){
        console.error('API tracking error: ', err.message);
    }
    next();
}

setInterval(async () => {
    const entries = Object.entries(apiHitBuffer);
    for (const [key, bufferItem] of entries) {
        const [apiName, date] = key.split('|');
        const timeSinceLastSave = Date.now() - bufferItem.lastSaved;

        if (timeSinceLastSave >= BATCH_INTERVAL && bufferItem.count > 0) {
            await flushToMongo(apiName, date, bufferItem);
        }
    }
}, 60 * 1000);

async function flushToMongo(apiName, today, bufferItem) {
    const { count } = bufferItem;
    if (count <= 0) return;

    try {
        await apiHit.updateOne(
            {
                api_name: apiName,
                date: today
            },
            {
                $inc: {count},
                $set: { last_updated: formatDateTime() }
            },
            {upsert: true}
        );
        // await apiHit.updateOne(
        //     { api_name: apiName, date: today },
        //     { $inc: { count }, $set: { last_updated: new Date() } },
        //     { upsert: true }
        // );
        bufferItem.count = 0;
        bufferItem.lastSaved = Date.now();
    } catch (err) {
        console.error('❌ Mongo sync error:', err.message);
    }
}

module.exports = apiHitCount;