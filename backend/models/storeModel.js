const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  storeName: { type: String, required: true },
   description: { type: String },
   profileImage: { type: String },
   place: { type: String },
  category: { type: String },
  subscription: {
    type: String,
    enum: ['basic', 'premium', 'golden'],
    default: 'basic'
  },
  validTill: {
    type: Date,
    default: null
  },
  location: {
    type: { type: String, enum: ['Point'], default: "Point" },
    coordinates: [Number]
  },
  averageRating: {
    type: Number,
    default: 0
  },
  numberOfRatings: {
    type: Number,
    default: 0
  },
  upi: { type: String },
  phone: { type: String },
  socialMedia: {
     whatsapp: { type: String },
     instagram: { type: String },
     facebook: { type: String },
     website: { type: String },
   },
   paymentHistory: [{
    paymentId: String,
    orderId: String,
    plan: {
      type: String,
      enum: ['premium', 'golden']
    },
    planType: String, // To store premium_6m, golden_6m, etc.
    amount: Number,
    duration: Number, // Duration in months (1 or 6)
    paidAt: {
      type: Date,
      default: Date.now
    },
    validTill: Date
  }],
  createdAt: { type: Date, default: Date.now }
});

storeSchema.methods.isSubscriptionActive = function() {
  if (!this.validTill) return false;
  return new Date(this.validTill) > new Date();
};

// Method to get days remaining
storeSchema.methods.getDaysRemaining = function() {
  if (!this.validTill) return 0;
  const now = new Date();
  const validTill = new Date(this.validTill);
  if (validTill <= now) return 0;
  
  return Math.ceil((validTill - now) / (1000 * 60 * 60 * 24));
};

// Add geospatial index on the location field
storeSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Store", storeSchema);