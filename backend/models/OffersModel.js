const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  description: {
    type: String,
    trim: true,
    maxLength: 500
  },
  image: {
    type: String // Cloudinary URL
  },
  discountType: {
    type: String,
  },
  discountValue: {
    type: String,
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  tags: [String], // For better search
  isPremium: {
    type: Boolean,
  },
  isActive: {
    type: Boolean,
  },
  originalPrice: {
    type: Number,
  },
  offerPrice: {
    type: Number,
  },  
  place: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],
      required: true // [longitude, latitude]
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
offerSchema.index({ location: "2dsphere" });
offerSchema.index({ validTo: 1, isActive: 1 });
offerSchema.index({ category: 1 });
offerSchema.index({ storeId: 1, isActive: 1 });

// Check if offer is expired
offerSchema.virtual('isExpired').get(function() {
  return this.validTo < new Date();
});

module.exports = mongoose.model("Offer", offerSchema);