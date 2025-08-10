const mongoose = require('mongoose');

const reservationSlotSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  monday: {
    type: [String],  // Array of strings like "08:00"
    default: [],
  },
  tuesday: {
    type: [String],
    default: [],
  },
  wednesday: {
    type: [String],
    default: [],
  },
  thursday: {
    type: [String],
    default: [],
  },
  friday: {
    type: [String],
    default: [],
  },
  saturday: {
    type: [String],
    default: [],
  },
  sunday: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('TimeSlot', reservationSlotSchema);
