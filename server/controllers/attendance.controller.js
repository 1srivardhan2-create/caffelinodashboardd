const Attendance = require('../models/Attendance.model');
const Ticket = require('../models/Ticket.model');
const Event = require('../models/Event.model');
const Registration = require('../models/Registration.model');

// Scan Ticket & Record Attendance
exports.scanTicket = async (req, res) => {
  try {
    const { ticketNumber } = req.body;
    const organizerId = req.user.userId;

    if (!ticketNumber) {
      return res.status(400).json({ success: false, message: 'Ticket number is required' });
    }

    // Check if attendance already recorded
    const existingAttendance = await Attendance.findOne({ ticketNumber });
    if (existingAttendance) {
      return res.status(400).json({ 
        success: false, 
        message: '❌ Already Checked In',
        data: {
          attendeeName: existingAttendance.attendeeName,
          eventName: existingAttendance.eventName,
          checkedInAt: existingAttendance.checkedInAt
        }
      });
    }

    // Find the Ticket
    const ticket = await Ticket.findOne({ ticketNumber }).populate('eventId').populate('registrationId');
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Invalid Ticket' });
    }

    const event = ticket.eventId;
    const registration = ticket.registrationId;

    // Verify the organizer owns this event
    if (event.organizerId.toString() !== organizerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to scan for this event' });
    }

    // Mark ticket as used (optional based on your Ticket schema, but good practice)
    ticket.status = 'used';
    await ticket.save();

    // Create Attendance Record
    const attendance = new Attendance({
      ticketNumber,
      eventId: event._id,
      registrationId: registration._id,
      attendeeName: registration.userName,
      email: registration.email,
      phone: registration.phone,
      eventName: event.eventName,
      checkedIn: true,
      checkedInAt: new Date(),
      checkedInBy: organizerId
    });

    await attendance.save();

    res.status(200).json({ 
      success: true, 
      message: 'Check-in successful', 
      attendance 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing scan', error: error.message });
  }
};

// Get Attendance List
exports.getAttendanceList = async (req, res) => {
  try {
    const organizerId = req.user.userId;
    const { eventId } = req.query;

    // First find all events by this organizer
    const query = { organizerId };
    if (eventId) query._id = eventId;
    
    const events = await Event.find(query).select('_id eventName');
    const eventIds = events.map(e => e._id);

    const attendanceRecords = await Attendance.find({ eventId: { $in: eventIds } }).sort({ checkedInAt: -1 });

    res.status(200).json({ success: true, attendance: attendanceRecords });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching attendance', error: error.message });
  }
};

// Get Dashboard Stats for Attendance
exports.getAttendanceStats = async (req, res) => {
  try {
    const organizerId = req.user.userId;

    const events = await Event.find({ organizerId }).select('_id');
    const eventIds = events.map(e => e._id);

    // Total Registrations (payment completed)
    const registrations = await Registration.find({ eventId: { $in: eventIds }, paymentStatus: 'completed' });
    const totalRegistrations = registrations.reduce((acc, curr) => acc + curr.ticketCount, 0);

    // Total Checked In
    const checkedInCount = await Attendance.countDocuments({ eventId: { $in: eventIds }, checkedIn: true });

    // Today's Check-Ins
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const todaysCheckIns = await Attendance.countDocuments({
      eventId: { $in: eventIds },
      checkedIn: true,
      checkedInAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const attendancePercentage = totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalRegistrations,
        totalCheckedIn: checkedInCount,
        todaysCheckIns,
        attendancePercentage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
};
