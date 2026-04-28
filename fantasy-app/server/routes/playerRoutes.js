const express = require("express");
const router = express.Router();
const {
  getPlayers,
  getPlayerById,
  createPlayer,
  searchPlayers,
} = require("../controllers/playerController");

//Path for Player table module call
router.get("/", getPlayers);
router.get("/search", searchPlayers);
router.get("/:id", getPlayerById);
router.post("/", createPlayer);
module.exports = router;
