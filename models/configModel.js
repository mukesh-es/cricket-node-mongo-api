const mongoose = require('mongoose');

const configModel = mongoose.connection.collection('api_config');

module.exports = configModel;