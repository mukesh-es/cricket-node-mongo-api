require('dotenv').config();

const cron = require('node-cron');
const ApiHit = require('../models/apiHitModel');
const {formatDate, getUnixTimestamp} = require('../utils/dateUtils');
const { apiMap } = require('../config/apiMap');
const { getTokenData } = require('../helpers/cacheHelper');
const { DAILY_MIDNIGHT } = require('./cronSchedule');


// Database Connection
const connectMongoDB = require('../db/mongoDB');
const mysqlDB = require('../db/mysqlDB');
connectMongoDB();

async function updateHits(){
  const today = formatDate();
  try{
    const hits = await ApiHit.find({date: today});
    if(hits){
      const currentTimestamp = getUnixTimestamp();
      let subscriptionHits = {};
      for (const item of hits) {
        const apiName = item.api_name;
        const token = item.token;
        const mappedAPI = apiMap[apiName];
        const hitCount = Number(item.count);

        if(!mappedAPI || hitCount <= 0 || !token){
          continue;
        }

        const tokenData = await getTokenData(token);
        const appId = tokenData.app_id??0;
        const subscriptionId = tokenData.subscription_id??0;
        if(subscriptionId > 0){
          if (!subscriptionHits[subscriptionId]) {
            subscriptionHits[subscriptionId] = 0;
          }
          subscriptionHits[subscriptionId] += hitCount;
        }
        
        // mysqlDB.execute(
          //   `INSERT INTO es_user_app_hits 
          //   (api_name, app_id, total_hits, hit_time)
          //   VALUES (?,?,?,?)`, 
          //   [mappedAPI, appId, hitCount, currentTimestamp]
          // );
        }
        if (Object.keys(subscriptionHits).length > 0) {
          for (const [key, value] of Object.entries(subscriptionHits)) {
            const subId = Number(key);
            const hits = Number(value);

            try {
              const [result] = await mysqlDB.execute(
                `UPDATE es_user_subscriptions
                SET hits_used = hits_used + ?
                WHERE subscription_id = ?`,
                [hits, subId]
              );
              console.log(`Subscription ${subId} updated:`, result);
            } catch (err) {
              console.error(`Error updating subscription ${subId}:`, err.message);
            }
          }
        }
    }
  }catch (err) {
    console.error('Error syncing hits:', err);
  }
}

// cron.schedule(DAILY_MIDNIGHT, async () => {
//   await updateHits();
// });
