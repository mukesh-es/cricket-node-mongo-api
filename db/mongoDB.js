const mongoose = require('mongoose');
const { errorWithTime } = require('../helpers/loggerHelper');

const connectMongoDB = async () => {
    try{
        const DBURI = `${process.env.MONGODB_URI}`
        await mongoose.connect(DBURI, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });
    }catch(err){
        errorWithTime('MongoDB connection failed', err)
    }
}

module.exports = connectMongoDB;