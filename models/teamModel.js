const { default: mongoose } = require("mongoose");

const teamSchema = new mongoose.Schema({
    tid: {type: Number, required: true},
    title: {type: String, required: true},
    abbr: {type: String, required: true},
    country: {type: String},
    teams_info: {type: Object},
    teams_info_for_list: {type: Object},
    teams_player: {type: Object},
    teams_squads: {type: Object},
    teams_stats: {type: Object},
});

module.exports = mongoose.model('Team', teamSchema, 'teams');
