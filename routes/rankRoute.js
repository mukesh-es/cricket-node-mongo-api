const express = require('express');
const router = express.Router();
const rankController = require('../controllers/rankController');

router.get('/', rankController.fieldData);

module.exports = router;