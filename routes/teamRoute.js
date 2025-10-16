const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const generalController = require('../controllers/generalController');

router.get('/', teamController.teams);
router.get('/:teamId', teamController.info);
router.get('/:team1Id/advance/:team2Id', generalController.apiCall);
router.get('/:teamId/:resource', teamController.fieldData);

module.exports = router;