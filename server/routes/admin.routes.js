const express = require("express");
const router = express.Router();

// Admin routes placeholder
router.get("/", (req, res) => {
  res.json({ message: "Admin API" });
});

module.exports = router;
