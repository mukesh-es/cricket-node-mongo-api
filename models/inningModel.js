const { default: mongoose } = require("mongoose");

const inningSchema = new mongoose.Schema({
    iid: {type: Number, required: true},
    inning_number: {type: Number, required: true},
    match_id: {type: Number, default: 0},
    innings_commentary: {type: Object},
    innings_content: {type: String},
});

module.exports = mongoose.model('Inning', inningSchema, 'matches_innings');
