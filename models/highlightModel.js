const mongoose = require('mongoose');

const hightlightSchema = new mongoose.Schema({
    highlight_compilation_in: {type: Object},
    highlight_live_matches_in: {type: Object},
    hightlighted_series_in: {type: Object},
    highlight_compilation_pk: {type: Object},
    highlight_live_matches_pk: {type: Object},
    hightlighted_series_pk: {type: Object},
    highlight_compilation_bd: {type: Object},
    highlight_live_matches_bd: {type: Object},
    hightlighted_series_bd: {type: Object},
});

module.exports = mongoose.model('Highlight', hightlightSchema, 'match_list_and_series_highlight');