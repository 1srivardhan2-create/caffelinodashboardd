const mongoose=require("mongoose")

const collectionSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },

  expectedAmount: {
    type: Number,
    required: true
  },

  collectedAmount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["PENDING", "PARTIAL", "COLLECTED"],
    default: "PENDING"
  },

  collectedAt: {
    type: Date,
    default: Date.now
  },
  Mode:{
    type:String,
    enum:["CASH","UPI"]
  },
  cafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cafe",
    required: true
  }
});

module.exports = mongoose.model("CashCollection", collectionSchema);
