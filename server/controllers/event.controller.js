const Event = require('../models/Event.model');
const Registration = require('../models/Registration.model');
const Ticket = require('../models/Ticket.model');
const Payment = require('../models/Payment.model');
const Settlement = require('../models/Settlement.model');
const { encrypt, decrypt } = require('../utils/cryptoHelper');
const { deleteFromCloudinary, uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');
const qrcode = require('qrcode');

// Create Event
exports.createEvent = async (req, res) => {
  try {
    const {
      eventName, eventDescription, eventCategory,
      cafeId, cafeName, venueName, address, googleMapsLink, city, state, country, pincode, latitude, longitude,
      eventDate, startTime, endTime, timezone,
      ticketType, ticketPrice, maxSeats, availableSeats,
      organizerName, email, phone, instagramLink, websiteLink, organizerId,
      accountHolderName, bankName, accountNumber, ifscCode, upiId, panNumber, gstNumber
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Event banner is required' });
    }

    // Encrypt sensitive bank details
    const encryptedBankDetails = {
      accountHolderName: encrypt(accountHolderName),
      bankName: encrypt(bankName),
      accountNumber: encrypt(accountNumber),
      ifscCode: encrypt(ifscCode),
      upiId: encrypt(upiId),
      panNumber: encrypt(panNumber),
      gstNumber: encrypt(gstNumber),
    };

    const newEvent = new Event({
      eventName, eventDescription, eventCategory,
      bannerUrl: req.file.path,
      bannerPublicId: req.file.filename,
      cafeId, cafeName, venueName, address, googleMapsLink, city, state, country, pincode, latitude, longitude,
      eventDate, startTime, endTime, timezone,
      ticketType, ticketPrice: ticketType === 'free' ? 0 : ticketPrice,
      maxSeats, availableSeats: maxSeats,
      organizerName, email, phone, instagramLink, websiteLink, organizerId,
      ...encryptedBankDetails,
      status: 'draft'
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

    if (req.file) {
      await deleteFromCloudinary(event.bannerPublicId);
      updateData.bannerUrl = req.file.path;
      updateData.bannerPublicId = req.file.filename;
    }

    // Handle encryption if bank details are updated
    const sensitiveFields = ['accountHolderName', 'bankName', 'accountNumber', 'ifscCode', 'upiId', 'panNumber', 'gstNumber'];
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
    const events = await Event.find().select('-accountHolderName -bankName -accountNumber -ifscCode -upiId -panNumber -gstNumber');
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
    delete eventObj.bankName;
    delete eventObj.accountNumber;
    delete eventObj.ifscCode;
    delete eventObj.upiId;
    delete eventObj.panNumber;
    delete eventObj.gstNumber;

    res.status(200).json({ success: true, event: eventObj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching event', error: error.message });
  }
};

// Publish Event
exports.publishEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.body.id || req.params.id, { status: 'active' }, { new: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.status(200).json({ success: true, message: 'Event published', event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error publishing event', error: error.message });
  }
};

// Cancel Event
exports.cancelEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.body.id || req.params.id, { status: 'cancelled' }, { new: true });
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
      const qrUpload = await uploadBufferToCloudinary(qrBuffer, 'caffelino/qrcodes', `qr_${ticketNumber}`);
      
      ticket.qrCodeUrl = qrUpload.secure_url;
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
      activeEvents: events.filter(e => e.status === 'active').length,
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
