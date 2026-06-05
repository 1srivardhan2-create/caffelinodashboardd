const mongoose = require('mongoose');

const SettlementSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalAmount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  settlementAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  settlementDate: { type: Date },
  transactionReference: { type: String } // Bank reference number after settlement
}, { timestamps: true });

module.exports = mongoose.model('Settlement', SettlementSchema);
