const express = require('express');
const router = express.Router();
const generalController = require('../controllers/generalController');

router.get('/changelogs', generalController.fieldData);

module.exports = router;