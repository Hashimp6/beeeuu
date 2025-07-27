const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  active: {
    type: Boolean,
    default: true,
  },
  productName: {
    type: String,
    // required: true
  },
  transactionId: {
    type: String,
    // required: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed",'advance-recieved', "cancelled","completed","not-attended"],
    default: "pending"
  },
  payment: {
    type: String,
    enum: ["none", "advance", "full"],
    default: "none"
  },
  cost: {
    type: Number,
    // required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    // required: true
  },
  time: {
    type: String, 
  },
  address: {
    type: String,
    // required: true
  },
  locationName: { 
    type: String,
    // required: true
  },
  contactNo: {
    type: String,
    // required: true
  }
}, {
  timestamps: true
});

appointmentSchema.index({ location: "2dsphere" }); // For geo queries

module.exports = mongoose.model("Appointment", appointmentSchema);
