const express = require('express');
const router = express.Router();
const seasonController = require('../controllers/seasonController');
const generalController = require('../controllers/generalController');

// GET
router.get('/', seasonController.fieldData);
router.get('/:season/:resource', seasonController.fieldData);

// POST
router.post('/', generalController.apiCall);

module.exports = router;