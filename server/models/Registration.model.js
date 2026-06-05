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
  registrationDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
