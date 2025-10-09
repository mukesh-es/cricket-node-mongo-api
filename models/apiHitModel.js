const { default: mongoose } = require("mongoose");

const apiHitSchema = new mongoose.Schema({
    api_name: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('apiHit', apiHitSchema, 'api_hits');
