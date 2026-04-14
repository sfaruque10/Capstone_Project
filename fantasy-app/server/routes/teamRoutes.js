const express = require('express');
const router = express.Router();
const { getTeamById, getUserTeams } = require('../controllers/teamController');
const authMiddleware = require('../middleware/authMiddleware');

//Team method paths
router.get('/my-teams', authMiddleware, getUserTeams);
//Keep /: at end of path
router.get('/:id', authMiddleware, getTeamById);


module.exports = router;