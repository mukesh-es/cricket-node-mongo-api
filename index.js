require('dotenv').config();
const { requestFailed } = require('./utils/responseHandler');
const apiHit = require('./middlewares/apiHitCount');

const express = require('express');
const app = express();
const connectDB = require('./config/db');
connectDB();

const matchesRoutes = require('./routes/matchesRoute');
const competitionsRoutes = require('./routes/competitionRoute');

app.use(express.json());
app.use(apiHit);

// Routes
app.use('/matches', matchesRoutes);
app.use('/competitions', competitionsRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    requestFailed(res, 'Something went wrong');
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
