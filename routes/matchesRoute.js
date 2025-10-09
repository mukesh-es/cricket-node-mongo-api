const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matchesController');

router.get('/', matchesController.matches);
router.get('/:matchId/:resource', matchesController.matchData);

module.exports = router;