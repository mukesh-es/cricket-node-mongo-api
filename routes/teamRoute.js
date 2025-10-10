const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.get('/:teamId', teamController.info);
router.get('/:teamId/:resource', teamController.fieldData);

module.exports = router;