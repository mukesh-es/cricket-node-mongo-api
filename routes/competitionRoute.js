const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/competitionController');

router.get('/', competitionController.competitions);
router.get('/:competitionId', competitionController.info);
router.get('/:competitionId/stats/:statType', competitionController.stats); // Keep this route above to  /:competitionId/:resource
router.get('/:competitionId/:resource', competitionController.fieldData);

module.exports = router;