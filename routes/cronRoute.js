const express = require('express');
const router = express.Router();
const cronController = require('../controllers/cronController');

router.get('/hits-update', cronController.hitsUpdate);

module.exports = router;