const express = require('express');
const router = express.Router();
const generalController = require('../controllers/generalController');
const apiCache = require('../middlewares/apiCache');

router.get('/', apiCache(), generalController.config);
router.get('/changelogs', apiCache(), generalController.fieldData);

module.exports = router;