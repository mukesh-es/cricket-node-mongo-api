const mongoose = require('mongoose');

const connectMongoDB = async () => {
    try{
        const DBURI = `${process.env.MONGODB_URI}${process.env.MONGODB}`
        await mongoose.connect(DBURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });
        console.log("MongoDB connected");
    }catch(err){
        console.error('MongoDB connection failed')
    }
}

module.exports = connectMongoDB;