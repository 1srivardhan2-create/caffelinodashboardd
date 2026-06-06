const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const adminController = require("../controllers/admin.controller");

// Admin routes placeholder
router.get("/", (req, res) => {
  res.json({ message: "Admin API" });
});

// GET /api/admin/events/:id/full-details
router.get("/events/:id/full-details", verifyToken, adminController.getEventFullDetails);

module.exports = router;
