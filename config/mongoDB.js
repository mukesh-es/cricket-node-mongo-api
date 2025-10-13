const mongoose = require('mongoose');

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
        console.error('MongoDB connection failed', err)
    }
}

module.exports = connectMongoDB;