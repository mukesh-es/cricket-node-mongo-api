const { default: mongoose } = require("mongoose");

const compStatSchema = new mongoose.Schema({
    cid: {type: Number, required: true},
    format: {type: String, required: true},
}, { strict: false });

module.exports = mongoose.model('CompetitionStat', compStatSchema, 'competitions_stats');
