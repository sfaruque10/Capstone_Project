const express = require("express");
const router = express.Router();
const {
  createLeague,
  joinLeague,
  getLeagues,
  getLeagueById,
  getLeagueTeams,
  getLeagueDraftedPlayers,
} = require("../controllers/leagueController");
const authMiddleware = require("../middleware/authMiddleware");

//League method paths
router.post("/", authMiddleware, createLeague);
router.post("/join", authMiddleware, joinLeague);
router.get("/", authMiddleware, getLeagues);
//Keep /: at end of path
router.get("/:id", authMiddleware, getLeagueById);
router.get("/:id/teams", authMiddleware, getLeagueTeams);
router.get("/:id/drafted-players", authMiddleware, getLeagueDraftedPlayers);
module.exports = router;
