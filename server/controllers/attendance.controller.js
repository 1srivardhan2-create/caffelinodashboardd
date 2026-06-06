const Attendance = require('../models/Attendance.model');
const Ticket = require('../models/Ticket.model');
const Event = require('../models/Event.model');
const Registration = require('../models/Registration.model');
const mongoose = require('mongoose');

// Verify Ticket before Check-In
exports.verifyTicket = async (req, res) => {
  try {
    let { ticketNumber } = req.query;
    const organizerId = req.user.userId;

    console.log(`[Verify Ticket] Received raw ticketNumber: '${ticketNumber}', organizerId: ${organizerId}`);

    if (!ticketNumber) {
      return res.status(400).json({ success: false, message: 'Ticket number is required' });
    }

    // Sanitize string (remove accidental quotes or whitespace)
    ticketNumber = String(ticketNumber).replace(/['"]/g, '').trim();

    // Find the Registration
    let registration = await Registration.findOne({ ticketNumber }).populate('eventId');
    
    // Fallback: If it's a valid MongoDB ObjectId
    if (!registration && mongoose.Types.ObjectId.isValid(ticketNumber)) {
      registration = await Registration.findById(ticketNumber).populate('eventId');
    }

    if (!registration) {
      return res.status(404).json({ success: false, message: `Invalid Ticket: Not found (${ticketNumber})` });
    }

    const event = registration.eventId;

    // Verify the organizer owns this event
    if (event.organizerId.toString() !== organizerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to scan for this event' });
    }

    // Check if attendance already recorded
    if (registration.checkedIn) {
      return res.status(400).json({ 
        success: false, 
        message: '❌ Already Checked In',
        data: {
          attendeeName: registration.userName,
          eventName: event.eventName,
          checkedInAt: registration.checkedInAt
        }
      });
    }

    // Return the ticket details for verification
    res.status(200).json({ 
      success: true, 
      data: {
        attendeeName: registration.userName,
        email: registration.email,
        phone: registration.phone,
        ticketNumber: registration.ticketNumber || ticketNumber,
        eventName: event.eventName,
        registrationDate: registration.registrationDate
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying ticket', error: error.message });
  }
};

// Scan Ticket & Record Attendance
exports.scanTicket = async (req, res) => {
  try {
    let { ticketNumber } = req.body;
    const organizerId = req.user.userId;

    if (!ticketNumber) {
      return res.status(400).json({ success: false, message: 'Ticket number is required' });
    }

    // Sanitize
    ticketNumber = String(ticketNumber).replace(/['"]/g, '').trim();

    // Find the Registration
    let registration = await Registration.findOne({ ticketNumber }).populate('eventId');
    if (!registration && mongoose.Types.ObjectId.isValid(ticketNumber)) {
      registration = await Registration.findById(ticketNumber).populate('eventId');
    }

    if (!registration) {
      return res.status(404).json({ success: false, message: `Invalid Ticket: Not found (${ticketNumber})` });
    }

    const event = registration.eventId;

    // Verify the organizer owns this event
    if (event.organizerId.toString() !== organizerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to scan for this event' });
    }

    // Check if attendance already recorded
    if (registration.checkedIn) {
      return res.status(400).json({ 
        success: false, 
        message: '❌ Already Checked In',
        data: {
          attendeeName: registration.userName,
          eventName: event.eventName,
          checkedInAt: registration.checkedInAt
        }
      });
    }

    // Update Registration to Checked-In
    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    registration.checkedInBy = organizerId;
    
    await registration.save();

    res.status(200).json({ 
      success: true, 
      message: 'Check-in successful', 
      attendance: registration 
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

    // Fetch all checked-in registrations
    const attendanceRecords = await Registration.find({ 
      eventId: { $in: eventIds }, 
      checkedIn: true 
    })
    .populate('eventId', 'eventName')
    .sort({ checkedInAt: -1 });

    // Map to expected format for the frontend
    const mappedList = attendanceRecords.map(a => ({
      _id: a._id,
      attendeeName: a.userName,
      email: a.email,
      phone: a.phone,
      ticketNumber: a.ticketNumber || a._id.toString(),
      eventName: a.eventId?.eventName || 'Unknown Event',
      checkedInAt: a.checkedInAt
    }));

    res.status(200).json({ success: true, attendance: mappedList });
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

    // Total Registrations
    const registrations = await Registration.find({ eventId: { $in: eventIds } });
    const totalRegistrations = registrations.reduce((acc, curr) => acc + curr.ticketCount, 0);

    // Total Checked In
    const checkedInCount = await Registration.countDocuments({ eventId: { $in: eventIds }, checkedIn: true });

    // Today's Check-Ins
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const todaysCheckIns = await Registration.countDocuments({
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
