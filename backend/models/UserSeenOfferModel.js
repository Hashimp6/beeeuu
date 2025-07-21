const mongoose = require("mongoose");

const userSeenOfferSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  seenOffers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer"
  }]
}, {
  timestamps: true
});

userSeenOfferSchema.index({ userId: 1 });

module.exports = mongoose.model("UserSeenOffer", userSeenOfferSchema);