const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/competitionController');
const validateParam = require('../middlewares/validateParam');

router.get('/', competitionController.competitions);
router.get('/:competitionId', validateParam('competitionId'), competitionController.info);
router.get('/:competitionId/stats/:statType', validateParam('competitionId'), competitionController.stats); // Keep this route above to  /:competitionId/:resource
router.get('/:competitionId/:resource', validateParam('competitionId'), competitionController.fieldData);

module.exports = router;