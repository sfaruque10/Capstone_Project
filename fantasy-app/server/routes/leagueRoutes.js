const express = require('express');
const router = express.Router();
const {createLeague, joinLeague, getLeagues, getLeagueById, getLeagueTeams} = require('../controllers/leagueController');
const authMiddleware = require('../middleware/authMiddleware');

//League method paths
router.post('/', authMiddleware, createLeague);
router.post('/join', authMiddleware, joinLeague);
router.get('/', authMiddleware, getLeagues);
//Keep /: at end of path
router.get('/:id', authMiddleware, getLeagueById);
router.get('/:id/teams', authMiddleware, getLeagueTeams);

module.exports = router;