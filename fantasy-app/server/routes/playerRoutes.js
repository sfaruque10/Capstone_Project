const express = require('express');
const router = express.Router();
const { getPlayers, getPlayerById } = require('../controllers/playerController');
const authMiddleware = require('../middleware/authMiddleware');

//Path for Player table module call
router.get('/', authMiddleware, getPlayers);
router.get('/:id', authMiddleware, getPlayerById);

module.exports = router;