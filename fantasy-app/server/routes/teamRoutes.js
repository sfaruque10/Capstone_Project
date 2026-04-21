const express = require('express');
const router = express.Router();
const { getTeamById, getUserTeams, getTeamPlayers, addPlayerToTeam } = require('../controllers/teamController');
const authMiddleware = require('../middleware/authMiddleware');

//Team method paths
router.get('/my-teams', authMiddleware, getUserTeams);
//Keep /: at end of path
router.get('/:id', authMiddleware, getTeamById);
router.get('/:id/players', authMiddleware, getTeamPlayers);
router.post('/:id/players', authMiddleware, addPlayerToTeam);


module.exports = router;