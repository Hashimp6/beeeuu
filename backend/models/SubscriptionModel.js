// models/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  planType: {
    type: String,
    required: true,
    enum: ['premium_monthly', 'golden_premium_monthly']
  },
  planName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true // Amount in paise
  },
  duration: {
    type: Number,
    required: true // Duration in days
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  paymentId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'ACTIVE', 'FAILED', 'CANCELLED', 'EXPIRED'],
    default: 'PENDING'
  },
  paidAt: {
    type: Date,
    default: null
  },
  expiryDate: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  webhookData: {
    type: Object,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'subscriptions'
});

// Index for efficient queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ expiryDate: 1 });
subscriptionSchema.index({ transactionId: 1 });

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'ACTIVE' && 
         this.expiryDate && 
         this.expiryDate > new Date();
};

// Static method to find active subscription for user
subscriptionSchema.statics.findActiveForUser = function(userId) {
  return this.findOne({
    userId,
    status: 'ACTIVE',
    expiryDate: { $gt: new Date() }
  }).sort({ createdAt: -1 });
};

// Pre-save hook to update the updatedAt field
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);