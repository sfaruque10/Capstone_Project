const express = require('express');
const router = express.Router();
const {createLeague, joinLeague, getLeagues} = require('../controllers/leagueController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createLeague);
router.post('/join', authMiddleware, joinLeague);
router.get('/', authMiddleware, getLeagues);

module.exports = router;