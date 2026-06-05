const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const upload = require('../middlewares/upload');

// Upload Banner
router.post('/upload-banner', upload.single('banner'), eventController.uploadBanner);

// Create Event
router.post('/create', eventController.createEvent);

// Update Event (with optional image upload)
router.post('/update/:id', upload.single('banner'), eventController.updateEvent);

// Delete Event
router.delete('/delete/:id', eventController.deleteEvent);

// Get All Events
router.get('/all', eventController.getAllEvents);

// Get My Events
router.get('/my-events', eventController.getMyEvents);

// Get Dashboard Stats
router.get('/dashboard', eventController.getDashboardStats);

// Get Earnings Stats
router.get('/earnings', eventController.getEarningsStats);

// Analytics API
router.get('/analytics/:eventId', eventController.getEventAnalytics);

// Get Registrations for an Event
router.get('/:eventId/registrations', eventController.getEventRegistrations);

// Export Registrations
router.get('/:eventId/export', eventController.exportEventRegistrations);

// Get Event by ID
router.get('/:id', eventController.getEventById);

// Save Draft
router.post('/save-draft', eventController.saveDraft);

// Publish Event
router.post('/publish/:id', eventController.publishEvent);

// Unpublish Event
router.post('/unpublish/:id', eventController.unpublishEvent);

// Cancel Event
router.post('/cancel/:id', eventController.cancelEvent);

// Register Event
router.post('/register', eventController.registerEvent);

// Verify Ticket
router.post('/verify-ticket', eventController.verifyTicket);

module.exports = router;
