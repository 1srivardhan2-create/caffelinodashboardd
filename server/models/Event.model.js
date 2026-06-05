const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  // STEP 1 - Basic Information
  eventName: { type: String, required: true },
  eventDescription: { type: String, required: true },
  eventCategory: { type: String, required: true },
  tags: [{ type: String }],

  // STEP 2 - Event Banner
  bannerUrl: { type: String },
  bannerPublicId: { type: String },

  // STEP 3 - Location
  cafeId: { type: String },
  cafeName: { type: String },
  venueName: { type: String },
  address: { type: String },
  googleMapsLink: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  pincode: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },

  // STEP 4 - Date & Time
  eventDate: { type: Date },
  startTime: { type: String },
  endTime: { type: String },
  timezone: { type: String, default: 'Asia/Kolkata' },

  // STEP 5 - Tickets
  ticketType: { type: String, enum: ['free', 'paid'] },
  ticketPrice: { type: Number, default: 0 },
  maxSeats: { type: Number },
  availableSeats: { type: Number },
  ticketsSold: { type: Number, default: 0 },

  // STEP 6 - Organizer Information
  organizerName: { type: String },
  email: { type: String },
  phone: { type: String },
  eventInstagramId: { type: String },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // STEP 7 - Bank Details
  accountHolderName: { type: String },
  bankName: { type: String },
  accountNumber: { type: String },
  ifscCode: { type: String },
  upiId: { type: String },

  // EVENT STATUS
  status: { 
    type: String, 
    enum: ['draft', 'published', 'completed', 'cancelled'], 
    default: 'draft' 
  },

  // Analytics
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  registrations: { type: Number, default: 0 },

  // Featured
  isFeatured: { type: Boolean, default: false },

  // Additional Fields
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
