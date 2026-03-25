const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
  // Web orders use ObjectId refs; mobile orders use string-based IDs
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },

  cafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cafe",
    required: false
  },

  // Mobile app fields (string-based identifiers)
  cafeId: {
    type: String,
    required: false
  },

  userId: {
    type: String,
    required: false
  },

  userName: {
    type: String,
    required: false
  },

  orderId: {
    type: String,
    required: false
  },

  items: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CafeMenu",
        required: false
      },
      // Mobile app uses name directly
      name: {
        type: String,
        required: false
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],

  subtotal: {
    type: Number,
    default: 0
  },

  cgst: {
    type: Number,
    default: 0
  },

  sgst: {
    type: Number,
    default: 0
  },

  totalAmount: {
    type: Number,
    required: true
  },

  orderStatus: {
    type: String,
    enum: ["PENDING", "PLACED", "ACCEPTED", "PREPARING", "READY", "COMPLETED", "CANCELLED",
           // Mobile app may use lowercase
           "pending", "placed", "accepted", "preparing", "ready", "completed", "cancelled",
           "token_paid"],
    default: "PENDING"
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "pending", "paid", "token_paid"],
    default: "PENDING"
  },

  paymentMethod: {
    type: String
  }

}, { timestamps: true, strict: false });

module.exports = mongoose.model("Order", orderSchema);
