const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

//Authentication method paths
router.post("/register", register);
router.post("/login", login);

module.exports = router;
