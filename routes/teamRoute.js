const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const generalController = require('../controllers/generalController');
const validateParam = require('../middlewares/validateParam');

router.get('/', teamController.teams);
router.get('/:teamId', validateParam('teamId'), teamController.info);
router.get('/:team1Id/advance/:team2Id', validateParam(['team1Id', 'team2Id']), generalController.apiCall);
router.get('/:teamId/:resource', validateParam('teamId'), teamController.fieldData);

module.exports = router;