const { default: mongoose } = require("mongoose");

const newsSchema = new mongoose.Schema({
    news_id: {type: Number, required: true},
    title: {type: String},
    category: {type: String},
    connected_id: {type: Number, required: true, default: 0},
    connected_to: {type: Number, required: true},
    country: {type: String, default: 0},
    created: {type: Number, default: 0},
    credit: {type: String},
    media_type: {type: Number},
    media_url: {type: String},
    news_body: {type: String},
    news_cat: {type: Number},
    news_url: {type: String},
    redirect: {type: Number},
});

module.exports = mongoose.model('News', newsSchema, 'app_news_data');
