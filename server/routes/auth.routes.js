const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Google OAuth Login
router.post('/google', authController.googleLogin);

module.exports = router;
