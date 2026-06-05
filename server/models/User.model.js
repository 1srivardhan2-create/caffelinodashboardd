const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePicture: { type: String },
  role: { type: String, enum: ['user', 'organizer', 'admin'], default: 'organizer' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
