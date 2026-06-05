const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { upload } = require('../utils/cloudinaryUpload');

// Create Event (with image upload)
router.post('/create', upload.single('banner'), eventController.createEvent);

// Update Event (with optional image upload)
router.put('/update/:id', upload.single('banner'), eventController.updateEvent);

// Delete Event
router.delete('/delete/:id', eventController.deleteEvent);

// Get All Events
router.get('/all', eventController.getAllEvents);

// Get Dashboard Stats
router.get('/dashboard', eventController.getDashboardStats);

// Get Earnings Stats
router.get('/earnings', eventController.getEarningsStats);

// Get Event by ID
router.get('/:id', eventController.getEventById);

// Publish Event
router.post('/publish', eventController.publishEvent);

// Cancel Event
router.post('/cancel', eventController.cancelEvent);

// Register Event
router.post('/register', eventController.registerEvent);

// Verify Ticket
router.post('/verify-ticket', eventController.verifyTicket);

module.exports = router;
