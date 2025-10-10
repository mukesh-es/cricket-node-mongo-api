const mongoose = require('mongoose');

const connectMongoDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });
        mongoose.connection.useDb(process.env.MONGODB);
        console.log("MongoDB connected");
    }catch(err){
        console.error('MongoDB connection failed')
    }
}

module.exports = connectMongoDB;
