const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  transactionId: { type: String, required: true }, // Razorpay payment ID or similar
  paymentMethod: { type: String }, // e.g., 'upi', 'card', 'netbanking'
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
