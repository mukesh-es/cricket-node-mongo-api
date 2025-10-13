const { default: mongoose } = require("mongoose");

const rankTourSchema = new mongoose.Schema({
    iccranks: {type: Object},
    tournaments_list: {type: Object},
    seasons_list: {type: Object},
    changelogs: {type: Object},
});

module.exports = mongoose.model('RankTour', rankTourSchema, 'iccranks_tournaments');
