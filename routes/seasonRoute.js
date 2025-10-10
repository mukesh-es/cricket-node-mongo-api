const express = require('express');
const router = express.Router();
const seasonController = require('../controllers/seasonController');

router.get('/:season/:resource', seasonController.fieldData);

module.exports = router;