const express = require('express');
const router = express.Router();
const generalController = require('../controllers/generalController');
const cache = require('../middlewares/cache');

router.get('/', cache(), generalController.config);
router.get('/changelogs', cache(), generalController.fieldData);

module.exports = router;