const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');

router.get('/', tournamentController.fieldData);
router.get('/:tournamentId/stats/:statType', tournamentController.stats);

module.exports = router;