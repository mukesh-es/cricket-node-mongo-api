const mongoose = require('mongoose');
const { errorWithTime } = require('../helpers/loggerHelper');

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 5,        // IMPORTANT
      minPoolSize: 1,        // IMPORTANT
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
    });

    console.log('MongoDB connected');
  } catch (err) {
    errorWithTime('MongoDB connection failed', err);
    process.exit(1); // fail fast
  }
};

module.exports = connectMongoDB;
