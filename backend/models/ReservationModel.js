const mongoose = require("mongoose");

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
    unique: true,
  },

  status: {
    type: String,
    enum: ['confirmed', 'pending','ready', 'completed', 'available'],
    default: 'confirmed',
  },

  date: {
    type: Date,
    default: () => new Date().setHours(0, 0, 0, 0), // store only date
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

module.exports = mongoose.model("Ticket", ticketSchema);
