const { default: mongoose } = require("mongoose");

const venueSchema = new mongoose.Schema({
    venue_id: {type: Number, required: true},
    venues_info: {type: Object},
    venues_stats: {type: Object},
});

module.exports = mongoose.model('Venue', venueSchema, 'venue');
