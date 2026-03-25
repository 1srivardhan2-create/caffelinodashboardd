const mongoose = require("mongoose");

const Cafe_log = new mongoose.Schema(
  {
    Name: { type: String, required: true },
    Cafe_Address: { type: String, required: true },
    cafe_location: { type: String, required: true },
    Cafe_type: { type: [String], required: true },
    Average_Cost: { type: String, required: true },
    AboutCafe: { type: String, minlength: 10 },
    password:{
        type:String,
        required : true,
    },
    opening_hours: {
      monday: {
        open: { type: String, required: true },
        close: { type: String, required: true },
        closed: { type: Boolean, default: false },
      },
      tuesday: { open: String, close: String, closed: Boolean },
      wednesday: { open: String, close: String, closed: Boolean },
      thursday: { open: String, close: String, closed: Boolean },
      friday: { open: String, close: String, closed: Boolean },
      saturday: { open: String, close: String, closed: Boolean },
      sunday: { open: String, close: String, closed: Boolean },
    },

    managerName: { type: String, required: true },
    Phonenumber: { type: String, required: true },
    designation: { type: String },
    AlternateContact: { type: String },

    email_address_manager: {
      type: String,
      unique: true,
      required: true,
    },

    paymentMethods: {
      type: [String],
      required: true,
      validate: v => v.length > 0,
    },

    upiIDs: {
      type: [String],
      validate: {
        validator: v => new Set(v).size === v.length,
        message: "UPI IDs must be unique",
      },
    },

    upi_photo: { type: String, required: false },

    Cafe_photos: {
      type: [String],
      validate: {
        validator: v => v.length >= 4,
        message: "Minimum 4 cafe photos required",
      },
    },

    status: { type: String, enum: ["pending", "approved"], default: "pending" },
    role: { type: String, default: "cafe" },
  },
  
  { timestamps: true }
);

module.exports = mongoose.model("Cafe", Cafe_log, "caves");
