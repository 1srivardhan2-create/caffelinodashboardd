const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
  attendeeName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  eventName: { type: String, required: true },
  checkedIn: { type: Boolean, default: true },
  checkedInAt: { type: Date, default: Date.now },
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
