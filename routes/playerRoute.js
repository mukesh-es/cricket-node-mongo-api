const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

router.get('/:matchId/playervsplayer', playerController.playervsplayer);

module.exports = router;