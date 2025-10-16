require('dotenv').config();
const { requestFailed } = require('./utils/responseHandler');
const apiLogger = require('./middlewares/apiLogger');
const apiHit = require('./middlewares/apiHitCount');

const express = require('express');
const app = express();
const connectMongoDB = require('./db/mongoDB');
connectMongoDB();

app.use(express.json());

const PORT = process.env.PORT;
const startServer = async () => {
  try{
      await connectMongoDB();
      console.log("MongoDB connected");

      app.use(apiLogger);
      app.use(apiHit);
      
      // Routes
      app.use('/matches', require('./routes/matchesRoute'));
      app.use('/competitions', require('./routes/competitionRoute'));
      app.use('/players', require('./routes/playerRoute'));
      app.use('/iccranks', require('./routes/rankRoute'));
      app.use('/venues', require('./routes/venueRoute'));
      app.use(['/team', '/teams'], require('./routes/teamRoute'));
      app.use(['/season', '/seasons'], require('./routes/seasonRoute'));
      app.use(['/tournament', '/tournaments'], require('./routes/tournamentRoute'));
      app.use('/', require('./routes/generalRoute'));

      app.use((err, req, res, next) => {
          console.error(err.stack);
          requestFailed({res, err: err.stack});
      });

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });

  } catch (err) {
    console.error("Failed to start server:", err.message);
  }
}

startServer();