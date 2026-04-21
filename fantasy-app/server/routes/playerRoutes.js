const express = require('express');
const router = express.Router();
const { getPlayers, getPlayerById } = require('../controllers/playerController');

//Path for Player table module call
router.get('/', getPlayers);
router.get('/:id', getPlayerById);

module.exports = router;