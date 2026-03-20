const express = require('express');
const { requestFailed } = require('./utils/responseHandler');
const apiAuth = require('./middlewares/apiAuth');
const apiLogger = require('./middlewares/apiLogger');
const apiHit = require('./middlewares/apiHitCount');
const apiCache = require('./middlewares/apiCache');
const { errorWithTime } = require('./helpers/loggerHelper');
const { normalizeURL } = require('./helpers/helpers');

const compression = require('compression');

const app = express();
app.use(express.json());

app.use(compression());

// Normalize URL
app.use((req, res, next) => {
    req.url = normalizeURL(req.url);
    next();
});

// Middlewares
app.use((req, res, next) => {
    if (req.method === "POST") return next();
    if (req.path.startsWith('/cron')) return next();
    if (req.path.startsWith('/logs')) return next();

    if (req.path === "/") return next();
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

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
    errorWithTime(err.stack);
    requestFailed({res, err: err.stack});
});

module.exports = app;