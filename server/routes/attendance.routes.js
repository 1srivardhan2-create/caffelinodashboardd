const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Apply verifyToken to all routes
router.use(verifyToken);

router.get('/verify', attendanceController.verifyTicket);
router.post('/scan', attendanceController.scanTicket);
router.get('/list', attendanceController.getAttendanceList);
router.get('/stats', attendanceController.getAttendanceStats);

module.exports = router;
