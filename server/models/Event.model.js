const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  // STEP 1 - Basic Information
  eventName: { type: String, required: true },
  eventDescription: { type: String, required: true },
  eventCategory: { type: String, required: true },

  // STEP 2 - Event Banner
  bannerUrl: { type: String, required: true },
  bannerPublicId: { type: String, required: true },

  // STEP 3 - Location
  cafeId: { type: String }, // Optional, as it might be an external venue
  cafeName: { type: String },
  venueName: { type: String, required: true },
  address: { type: String, required: true },
  googleMapsLink: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  pincode: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },

  // STEP 4 - Date & Time
  eventDate: { type: Date, required: true },
  startTime: { type: String, required: true }, // Format HH:mm
  endTime: { type: String, required: true },
  timezone: { type: String, default: 'Asia/Kolkata' },

  // STEP 5 - Tickets
  ticketType: { type: String, enum: ['free', 'paid'], required: true },
  ticketPrice: { type: Number, default: 0 },
  maxSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  ticketsSold: { type: Number, default: 0 },

  // STEP 6 - Organizer Information
  organizerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  instagramLink: { type: String },
  websiteLink: { type: String },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // STEP 7 - Payment Settlement (Encrypted fields)
  accountHolderName: { type: String },
  bankName: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
  upiId: { type: String },
  panNumber: { type: String },
  gstNumber: { type: String },

  // EVENT STATUS
  status: { 
    type: String, 
    enum: ['draft', 'active', 'completed', 'cancelled'], 
    default: 'draft' 
  },

  // Additional Fields
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  registrationsCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
