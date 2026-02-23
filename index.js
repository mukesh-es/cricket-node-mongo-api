require('dotenv').config();

const app = require('./app');
const connectMongoDB = require('./db/mongoDB');
const { connectRedis } = require('./config/redis');
const PORT = process.env.PORT;

const startServer = async () => {
  try{
      await connectMongoDB();
      console.log("MongoDB connected");

      await connectRedis();
      
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });

  } catch (err) {
    errorWithTime("Failed to start server:", err.message);
  }
}

startServer();