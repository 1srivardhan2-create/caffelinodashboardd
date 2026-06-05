const express = require('express');
const router = express.Router();
const mobileEventController = require('../controllers/mobile.event.controller');

// GET /api/mobile/events/featured
router.get('/featured', mobileEventController.getFeaturedMobileEvents);

// GET /api/mobile/events/search?q=keyword
router.get('/search', mobileEventController.searchMobileEvents);

// GET /api/mobile/events/:id
router.get('/:id', mobileEventController.getMobileEventById);

// GET /api/mobile/events
router.get('/', mobileEventController.getAllMobileEvents);

module.exports = router;
