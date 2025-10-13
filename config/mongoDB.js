// const mongoose = require('mongoose')
// const databaseURI = process.env.MONGODB_URI;
// mongoose.connect(databaseURI)
//     .then(() => console.log(":white_check_mark: Connected to mongoDB."))
//     .catch((error) => {
//         console.error(":x: MongoDB connection error:", error);
//     });
// const connectMongoDB = mongoose.connection.useDb(process.env.MONGODB);
// module.exports = connectMongoDB;


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