const { default: mongoose } = require("mongoose");

const rankTourSchema = new mongoose.Schema({
    iccranks: {type: Object},
    tournaments_list: {type: Object},
});

module.exports = mongoose.model('RankTour', rankTourSchema, 'iccranks_tournaments');
