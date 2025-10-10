const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matchesController');
const inningController = require('../controllers/inningController');

router.get('/', matchesController.matches);
router.get('/:matchId/:resource', matchesController.fieldData);
router.get('/:matchId/innings/:inningNumber/:resource', inningController.fieldData);

module.exports = router;