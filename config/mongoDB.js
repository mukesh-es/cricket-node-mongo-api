const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    const DBuser = process.env.DBUSER;
    const DBpass = process.env.DBPASS;
    const DBhost = process.env.DBHOST;
    const DBport = process.env.DBPORT;
    const DBname = process.env.DBNAME;

    // Build connection string (without DB name)
    const databaseURI = `mongodb://${DBuser}:${DBpass}@${DBhost}:${DBport}/?authMechanism=DEFAULT`;

    console.log("🔌 Connecting to:", databaseURI);

    // Connect to the MongoDB server (no DB yet)
    await mongoose.connect(databaseURI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Explicitly select the target DB
    const DB = mongoose.connection.useDb(DBname);

    console.log("✅ MongoDB connected successfully to DB:", DBname);

    return DB;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
};

module.exports = connectMongoDB;
