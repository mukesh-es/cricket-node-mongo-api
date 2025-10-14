const { default: mongoose } = require("mongoose");

const tourStatSchema = new mongoose.Schema({
    tournament_id: {type: Number, required: true},
}, { strict: false });

module.exports = mongoose.model('TournamentStat', tourStatSchema, 'tournaments_stats');
