const mongoose = require('mongoose');

const matchesSchema = new mongoose.Schema({
    match_id: {type: Number, required: true},
    cid: {type: Number, required: true},
    format: {type: Number, required: true},
    status_id: {type: Number, required: true},
    teama: {type: Number, required: true},
    teamb: {type: Number, required: true},
    timestamp_end: {type: Number, required: true},
    timestamp_start: {type: Number, required: true},
    match_info: {type: Object},
    match_info_for_list: {type: Object},
    match_advance: {type: Object},
    match_content: {type: Object},
    match_point: {type: Object},
    match_statistics: {type: Object},
    match_wagons: {type: Object},
    teams_advance: {type: Object},
    match_playervsplayer_tavstb: {type: Object},
    match_playervsplayer_tbvsta: {type: Object},
});

module.exports = mongoose.model('Match', matchesSchema, 'matches');