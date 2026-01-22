require('dotenv').config();
const { requestFailed } = require('./utils/responseHandler');
const apiAuth = require('./middlewares/apiAuth');
const apiLogger = require('./middlewares/apiLogger');
const apiHit = require('./middlewares/apiHitCount');
const apiCache = require('./middlewares/apiCache');

const { connectRedis } = require('./config/redis');


const express = require('express');
const app = express();
const connectMongoDB = require('./db/mongoDB');
const { errorWithTime } = require('./helpers/loggerHelper');
const { normalizeURL } = require('./helpers/helpers');

app.use(express.json());

const PORT = process.env.PORT;
const startServer = async () => {
  try{
      await connectMongoDB();
      console.log("MongoDB connected");

      await connectRedis();

      // Normalize URL
      app.use((req, res, next) => {
        req.url = normalizeURL(req.url);
        next();
      });

      // Middlewares
      app.use((req, res, next) => {
        // Skip apiAuth for all POST requests
        if (req.method === "POST") {
          return next();
        }

        // Skip for /cron and all children
        if (req.path.startsWith('/cron')) {
          return next();
        }

        // Skip apiAuth for GET /
        if (req.path === "/") {
          return next();
        }

        // Apply apiAuth for all other GET routes
        return apiAuth(req, res, next);
      });

      app.use(apiLogger);
      app.use(apiHit);
      app.use(apiCache());
      
      // Routes
      app.use('/matches', require('./routes/matchesRoute'));
      app.use('/competitions', require('./routes/competitionRoute'));
      app.use('/players', require('./routes/playerRoute'));
      app.use('/iccranks', require('./routes/rankRoute'));
      app.use('/venues', require('./routes/venueRoute'));
      app.use(['/team', '/teams'], require('./routes/teamRoute'));
      app.use(['/season', '/seasons'], require('./routes/seasonRoute'));
      app.use(['/tournament', '/tournaments'], require('./routes/tournamentRoute'));
      app.use('/cron', require('./routes/cronRoute'));
      app.use('/', require('./routes/generalRoute'));

      app.use((err, req, res, next) => {
          errorWithTime(err.stack);
          requestFailed({res, err: err.stack});
      });

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });

  } catch (err) {
    errorWithTime("Failed to start server:", err.message);
  }
}

startServer();