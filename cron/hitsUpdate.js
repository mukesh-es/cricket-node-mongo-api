const cron = require('node-cron');
const mongoose = require('mongoose');
const apiHit = require('../models/apiHit');
const mysqlDB = require('../db/mysqlDB');

// Connect Mongo
mongoose.connect(process.env.MONGO_URI);

// Daily cron at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Daily sync started:', new Date().toLocaleString());

  const today = new Date().toISOString().split('T')[0];

  try {
    const hits = await apiHit.find({ date: today });

    for (const hit of hits) {
      const { api_name, count } = hit;

      await mysqlDB.execute(
        `INSERT INTO api_stats (api_name, total_hits) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE total_hits = total_hits + VALUES(total_hits)`,
        [api_name, count]
      );
    }

    console.log('✅ Daily sync completed');

    // Optional: reset Mongo counts
    await apiHit.deleteMany({ date: today });
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
  }
});
