const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');

router.get('/:venueId', venueController.info);
router.get('/:venueId/:resource', venueController.fieldData);

module.exports = router;