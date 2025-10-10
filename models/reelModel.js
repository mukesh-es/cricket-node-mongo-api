const { default: mongoose } = require("mongoose");

const reelSchema = new mongoose.Schema({
    reel_id: {type: Number, required: true},
    title: {type: String},
    category: {type: Number, required: true, default: 0},
    clink: {type: String, required: true},
    connectId: {type: Number, default: 0},
    connectfrom: {type: Number, default: 0},
    country: {type: String},
    credit_title: {type: String},
    credit_url: {type: String},
    ctype: {type: String},
    logo_url: {type: String},
    media_platform: {type: String},
    news_cat: {type: Number},
    orderby_time: {type: String},
    scheduled: {type: String},
    subtitle: {type: String},
    thumbnail: {type: String},
    timestamp: {type: String},
    updated: {type: String},
});

module.exports = mongoose.model('Reel', reelSchema, 'app_reels_data');
