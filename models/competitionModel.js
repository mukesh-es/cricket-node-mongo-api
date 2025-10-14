const { default: mongoose } = require("mongoose");

const competitionSchema = new mongoose.Schema({
    cid: {type: Number, required: true},
    title: {type: String, required: true},
    season: {type: String, required: true},
    country: {type: String},
    datestart: {type: Object},
    competitions_info: {type: Object},
    competitions_squads: {type: Object},
    competitions_standings: {type: Object},
});

module.exports = mongoose.model('Competition', competitionSchema, 'competitions');
