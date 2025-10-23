const mongoose = require('mongoose');
const {formatDateTime} = require('../utils/dateUtils');

const apiHitSchema = new mongoose.Schema({
  api_name: String,
  app_id: Number,
  token: String,
  date: String, // 'YYYY-MM-DD'
  count: { type: Number, default: 0 },
  last_updated: { type: String, default: formatDateTime() }
});

module.exports = mongoose.model('ApiHit', apiHitSchema, 'api_hits');
