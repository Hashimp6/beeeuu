const mongoose = require("mongoose");

// Updated schema with dateString approach
const ticketSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    enum: ['walk-in', 'online'],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  numberOfPeople: {
    type: Number,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paymentAmount: {
    type: Number,
    default: 0,
  },
  ticketNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending','ready', 'completed', 'available'],
    default: 'confirmed',
  },
  // Store date as YYYY-MM-DD string for India timezone consistency
  dateString: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Updated index using dateString
ticketSchema.index({ storeId: 1, dateString: 1, ticketNumber: 1 }, { unique: true });
module.exports = mongoose.model("Ticket", ticketSchema)