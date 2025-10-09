const mongoose = require('mongoose');

const matchesSchema = new mongoose.Schema({
    match_id: {
        type: Number,
        required: true
    },
    matches_info: {type: Object}
});

module.exports = mongoose.model('Match', matchesSchema, 'matches');