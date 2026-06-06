const Event = require('../models/Event.model');
const Registration = require('../models/Registration.model');
const Ticket = require('../models/Ticket.model');
const Payment = require('../models/Payment.model');
const Settlement = require('../models/Settlement.model');
const { encrypt, decrypt } = require('../utils/cryptoHelper');
const uploadBuffer = require('../utils/uploadToCloudinary');
const cloudinary = require('../config/cloudinary');
const qrcode = require('qrcode');

// Helper to delete from Cloudinary using existing config
const deleteFromCloudinary = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      console.log(`Deleted image from Cloudinary: ${publicId}`);
    }
  } catch (error) {
    console.error(`Failed to delete image from Cloudinary (${publicId}):`, error);
  }
};

// Upload Banner Endpoint
exports.uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Check file size (5MB limit)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File exceeds 5MB limit' });
    }

    // Upload to existing Cloudinary setup using uploadBuffer from server/utils
    const folder = 'caffelino/events/banners';
    const secureUrl = await uploadBuffer(req.file.buffer, folder);
    
    // Extract publicId roughly from URL (or just save the URL)
    // Cloudinary URL format: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<filename>.<ext>
    const urlParts = secureUrl.split('/');
    const filename = urlParts.pop().split('.')[0];
    const publicId = `${folder}/${filename}`;

    res.status(200).json({
      success: true,
      bannerUrl: secureUrl,
      publicId: publicId
    });
  } catch (error) {
    console.error('Banner Upload Error:', error);
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
};

// Save Draft
exports.saveDraft = async (req, res) => {
  try {
    const { _id, ...eventData } = req.body;
    
    // Encrypt sensitive bank details if present
    const sensitiveFields = ['accountHolderName', 'paymentMobileNumber', 'upiId'];
    sensitiveFields.forEach(field => {
      if (eventData[field]) {
        eventData[field] = encrypt(eventData[field]);
      }
    });

    let draftEvent;
    if (_id) {
      draftEvent = await Event.findByIdAndUpdate(_id, { ...eventData, status: 'draft' }, { new: true, upsert: true });
    } else {
      draftEvent = new Event({ ...eventData, status: 'draft' });
      await draftEvent.save();
    }

    res.status(200).json({ success: true, message: 'Draft saved successfully', event: draftEvent });
  } catch (error) {
    console.error('Save Draft Error:', error);
    res.status(500).json({ success: false, message: 'Error saving draft', error: error.message });
  }
};

// Create Event
exports.createEvent = async (req, res) => {
  try {
    const {
      eventName, eventDescription, eventCategory, tags,
      bannerUrl, bannerPublicId,
      cafeId, cafeName, venueName, address, googleMapsLink, city, state, country, pincode, latitude, longitude,
      eventDate, startTime, endTime, timezone,
      ticketType, ticketPrice, maxSeats, availableSeats,
      organizerName, email, phone, eventInstagramId, organizerId,
      accountHolderName, paymentMobileNumber, upiId
    } = req.body;

    // Encrypt sensitive bank details
    const encryptedBankDetails = {
      accountHolderName: encrypt(accountHolderName),
      paymentMobileNumber: encrypt(paymentMobileNumber),
      upiId: encrypt(upiId)
    };

    const newEvent = new Event({
      eventName, eventDescription, eventCategory, tags,
      bannerUrl, bannerPublicId,
      cafeId, cafeName, venueName, address, googleMapsLink, city, state, country, pincode, latitude, longitude,
      eventDate, startTime, endTime, timezone,
      ticketType, ticketPrice: ticketType === 'free' ? 0 : ticketPrice,
      maxSeats, availableSeats: maxSeats,
      organizerName, email, phone, eventInstagramId, organizerId,
      ...encryptedBankDetails,
      status: 'published'
    });

    await newEvent.save();

    res.status(201).json({ success: true, message: 'Event created successfully', event: newEvent });
  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({ success: false, message: 'Error creating event', error: error.message });
  }
};

// Update Event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Handle encryption if bank details are updated
    const sensitiveFields = ['accountHolderName', 'paymentMobileNumber', 'upiId'];
    sensitiveFields.forEach(field => {
      if (updateData[field]) {
        updateData[field] = encrypt(updateData[field]);
      }
    });

    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ success: true, message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating event', error: error.message });
  }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.bannerPublicId) {
      await deleteFromCloudinary(event.bannerPublicId);
    }

    await Event.findByIdAndDelete(id);
    // Note: We might want to handle registrations/tickets connected to this event as well.
    
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting event', error: error.message });
  }
};

// Get All Events
exports.getAllEvents = async (req, res) => {
  try {
    // Exclude bank details from general query
    const events = await Event.find().select('-accountHolderName -paymentMobileNumber -upiId');
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching events', error: error.message });
  }
};

// Get Event By ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    // We only decrypt bank details if the requester is an admin or the organizer. 
    // For now, we return it without decrypting or just exclude it for general users.
    // Assuming frontend calls this for view: we exclude sensitive info.
    const eventObj = event.toObject();
    delete eventObj.accountHolderName;
    delete eventObj.paymentMobileNumber;
    delete eventObj.upiId;

    res.status(200).json({ success: true, event: eventObj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching event', error: error.message });
  }
};

// Get Event By ID for Edit (decrypts sensitive info)
exports.getEventForEdit = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    // Check if requester is the organizer
    if (event.organizerId.toString() !== req.user?.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const eventObj = event.toObject();
    if (eventObj.accountHolderName) eventObj.accountHolderName = decrypt(eventObj.accountHolderName);
    if (eventObj.paymentMobileNumber) eventObj.paymentMobileNumber = decrypt(eventObj.paymentMobileNumber);
    if (eventObj.upiId) eventObj.upiId = decrypt(eventObj.upiId);

    res.status(200).json({ success: true, event: eventObj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching event for edit', error: error.message });
  }
};

// Publish Event
exports.publishEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    // Strict Validation before publishing
    const requiredFields = [
      'eventName', 'eventDescription', 'eventCategory', 'bannerUrl', 
      'venueName', 'address', 'city', 'state', 'country', 'pincode', 
      'eventDate', 'startTime', 'endTime', 'ticketType', 'maxSeats', 
      'organizerName', 'email', 'phone'
    ];

    const missingFields = requiredFields.filter(field => !event[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot publish. Missing required fields.',
        missingFields 
      });
    }

    event.status = 'published';
    await event.save();

    res.status(200).json({ success: true, message: 'Event published', event });
  } catch (error) {
    console.error('Publish Event Error:', error);
    res.status(500).json({ success: false, message: 'Error publishing event', error: error.message });
  }
};

// Unpublish Event
exports.unpublishEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(id, { status: 'draft' }, { new: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, message: 'Event unpublished', event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error unpublishing event', error: error.message });
  }
};

// Cancel Event
exports.cancelEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, message: 'Event cancelled', event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error cancelling event', error: error.message });
  }
};

// Register Event
exports.registerEvent = async (req, res) => {
  try {
    const { eventId, userId, userName, email, phone, ticketCount, amountPaid, transactionId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.availableSeats < ticketCount) {
      return res.status(400).json({ success: false, message: 'Not enough seats available' });
    }

    // Create Registration
    const registration = new Registration({
      eventId, userId, userName, email, phone, ticketCount, amountPaid, paymentStatus: 'completed'
    });
    await registration.save();

    // Create Payment Record
    if (amountPaid > 0) {
      const payment = new Payment({
        registrationId: registration._id,
        eventId, userId, amount: amountPaid, transactionId, status: 'completed'
      });
      await payment.save();
    }

    // Update Event counts
    event.availableSeats -= ticketCount;
    event.ticketsSold += ticketCount;
    event.registrationsCount += 1;
    await event.save();

    // Generate Tickets
    const generatedTickets = [];
    for (let i = 0; i < ticketCount; i++) {
      const ticketNumber = `CAF-EVT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      
      const ticket = new Ticket({
        eventId,
        registrationId: registration._id,
        userId,
        ticketNumber,
        status: 'active'
      });

      // Generate QR Code containing Ticket Verification Data
      const qrData = JSON.stringify({
        ticketId: ticket._id,
        ticketNumber,
        eventId,
        userId
      });

      const qrBuffer = await qrcode.toBuffer(qrData, { type: 'png', width: 300 });
      
      // Upload QR Code to Cloudinary
      const secureUrl = await uploadBuffer(qrBuffer, 'caffelino/events/qrcodes');
      
      ticket.qrCodeUrl = secureUrl;
      await ticket.save();

      generatedTickets.push(ticket);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful', 
      registration, 
      tickets: generatedTickets 
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Error in registration', error: error.message });
  }
};

// Verify Ticket API
exports.verifyTicket = async (req, res) => {
  try {
    const { ticketNumber, eventId } = req.body;
    
    const ticket = await Ticket.findOne({ ticketNumber, eventId }).populate('registrationId');
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    
    if (ticket.status !== 'active') {
      return res.status(400).json({ success: false, message: `Ticket is already ${ticket.status}` });
    }
    
    // Mark as used
    ticket.status = 'used';
    await ticket.save();
    
    res.status(200).json({ success: true, message: 'Ticket verified and marked as used', ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying ticket', error: error.message });
  }
};

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const organizerId = req.query.organizerId; // optional filter
    const query = organizerId ? { organizerId } : {};

    const events = await Event.find(query);
    const registrations = await Registration.find(organizerId ? { /* maybe filter by events */ } : {}); // Simplified for now

    const stats = {
      totalEvents: events.length,
      activeEvents: events.filter(e => e.status === 'published').length,
      upcomingEvents: events.filter(e => new Date(e.eventDate) > new Date()).length,
      completedEvents: events.filter(e => e.status === 'completed').length,
      cancelledEvents: events.filter(e => e.status === 'cancelled').length,
      totalTicketsSold: events.reduce((acc, curr) => acc + curr.ticketsSold, 0),
      totalRegistrations: events.reduce((acc, curr) => acc + curr.registrationsCount, 0),
      totalRevenue: events.reduce((acc, curr) => acc + (curr.ticketsSold * curr.ticketPrice), 0)
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
};

// Earnings Stats
exports.getEarningsStats = async (req, res) => {
  try {
    const organizerId = req.query.organizerId; // optional filter
    const query = organizerId ? { organizerId } : {};

    const events = await Event.find(query);
    const settlements = await Settlement.find(query);

    const totalRevenue = events.reduce((acc, curr) => acc + (curr.ticketsSold * curr.ticketPrice), 0);
    const completedSettlements = settlements.filter(s => s.status === 'completed').reduce((acc, curr) => acc + curr.settlementAmount, 0);
    const pendingSettlements = settlements.filter(s => s.status === 'pending' || s.status === 'processing').reduce((acc, curr) => acc + curr.settlementAmount, 0);

    const stats = {
      totalRevenue,
      pendingSettlements,
      completedSettlements,
      totalTicketsSold: events.reduce((acc, curr) => acc + curr.ticketsSold, 0)
    };

    res.status(200).json({ success: true, stats, settlements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching earnings stats', error: error.message });
  }
};

// Get My Events
exports.getMyEvents = async (req, res) => {
  try {
    const organizerId = req.query.organizerId || req.user?.userId; // Needs auth middleware protecting this route
    if (!organizerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const events = await Event.find({ organizerId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching my events', error: error.message });
  }
};

// Analytics API
exports.getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    const analytics = {
      views: event.views,
      likes: event.likes,
      shares: event.shares,
      registrations: event.registrations,
      ticketsSold: event.ticketsSold,
      revenue: event.ticketsSold * event.ticketPrice
    };
    
    res.status(200).json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching analytics', error: error.message });
  }
};

// Get Registrations for an Event
exports.getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await Registration.find({ eventId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching registrations', error: error.message });
  }
};

// Export Registrations (CSV mock)
exports.exportEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await Registration.find({ eventId });
    res.status(200).json({ success: true, message: 'Export successful', data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error exporting registrations', error: error.message });
  }
};

// Get All Tickets for an Organizer
exports.getMyTickets = async (req, res) => {
  try {
    const organizerId = req.query.organizerId || req.user?.userId;
    if (!organizerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Find all events belonging to this organizer
    const events = await Event.find({ organizerId }).select('_id');
    const eventIds = events.map(e => e._id);

    // Find all tickets for these events
    const tickets = await Ticket.find({ eventId: { $in: eventIds } })
      .populate('eventId', 'eventName cafeName')
      .populate('registrationId', 'userName email phone amountPaid')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching tickets', error: error.message });
  }
};
