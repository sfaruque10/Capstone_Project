const express = require('express');
const router = express.Router();
const { getPlayers } = require('../controllers/playerController');

//Path for Player table module call
router.get('/', getPlayers);

module.exports = router;