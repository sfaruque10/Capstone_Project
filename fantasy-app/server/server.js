require("dotenv").config();
const express = require("express");
const pool = require("./config/db");
const playerRoutes = require("./routes/playerRoutes");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const leagueRoutes = require("./routes/leagueRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

//Test call to display from a test-db
app.get("/test-db", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows);
});

//Route to check players
app.use("/players", playerRoutes);

//Route for authentication pages
app.use("/auth", authRoutes);

//Route for league creation and joining pages
app.use("/leagues", leagueRoutes);

//Test call for middleware functionality
app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "You are authenticated", user: req.user });
});

const PORT = 5001;

//Run server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
