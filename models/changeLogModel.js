const { default: mongoose } = require("mongoose");

const changeLogSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    title: {type: String, required: true},
    subtitle: {type: String},
    img_url: {type: String},
    description: {type: String},
    created: {type: Number},
});

module.exports = mongoose.model('changeLogs', changeLogSchema, 'app_change_logs');
