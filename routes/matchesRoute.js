const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matchesController');
const inningController = require('../controllers/inningController');
const validateParam = require('../middlewares/validateParam');

router.get('/', matchesController.matches);
router.get('/:matchId/:resource', validateParam('matchId'), matchesController.fieldData);
router.get('/:matchId/innings/:inningNumber/:resource', validateParam(['matchId', 'inningNumber']), inningController.fieldData);

module.exports = router;