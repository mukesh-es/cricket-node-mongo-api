const { default: mongoose } = require("mongoose");

const teamTrackerSchema = new mongoose.Schema({
    tid: {type: Number, required: true},
    formats: {type: Number, required: true},
    crickettracker: {type: Object},
});

module.exports = mongoose.model('TeamTracker', teamTrackerSchema, 'team_crickettracker');
