const { default: mongoose } = require("mongoose");

const playerSchema = new mongoose.Schema({
    pid: {type: Number, required: true},
    title: {type: String, required: true},
    players_advancestats: {type: Object},
    players_list: {type: Object},
    players_matches: {type: Object},
    players_stats: {type: Object},
});

module.exports = mongoose.model('Player', playerSchema, 'players');