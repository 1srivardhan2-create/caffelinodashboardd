const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  ticketCount: { type: Number, required: true, min: 1 },
  amountPaid: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  registrationDate: { type: Date, default: Date.now },
  
  // Attendance & Ticketing
  ticketNumber: { type: String }, // e.g., TKT-58D69D-344390
  checkedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date },
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, collection: 'eventregistrations' });

module.exports = mongoose.model('Registration', RegistrationSchema);
