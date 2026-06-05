const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketNumber: { type: String, required: true, unique: true }, // e.g., CAF-EVT-2026-00125
  qrCodeUrl: { type: String }, // Cloudinary URL for the QR code image
  status: { type: String, enum: ['active', 'used', 'cancelled'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);
