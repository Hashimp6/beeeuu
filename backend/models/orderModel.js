const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  otp: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true
  },  
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  
  // Seller Information
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  sellerName: {
    type: String,
  },
  
  // Buyer Information
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  orderType:{
    type: String,
  },
  // Order Details
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalItems: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Transaction ID
  transactionId: {
    type: String,
    required: function() {
      return this.paymentMethod && this.paymentMethod !== 'cod';
    }
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['cod', 'gpay', 'phonepe', 'paytm', 'upi','razorpay'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'confirmed',"completed", 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  
  // Timestamps
  orderDate: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  
  // Additional Information
  notes: {
    type: String,
    maxlength: 500
  },
  trackingNumber: {
    type: String
  },
  estimatedDeliveryDate: {
    type: Date
  },
  
  orderId: {
    type: String,
    unique: false // let us manage uniqueness manually later
  },
  
}, {
  timestamps: true
});

// // Pre-save middleware to generate order ID
// orderSchema.pre('save', async function(next) {
//   if (!this.orderId) {
//     const year = new Date().getFullYear();
//     const count = await mongoose.model('Order').countDocuments();
//     this.orderId = `ORD-${year}-${String(count + 1).padStart(6, '0')}`;
//   }
//   next();
// });


// Pre-save middleware to calculate totals and validate products
orderSchema.pre('save', function(next) {
  if (this.isModified('products')) {
    // Calculate total amount and total items
    let totalAmount = 0;
    let totalItems = 0;
    
    this.products.forEach(product => {
      // Calculate total price for each product
      product.totalPrice = product.quantity * product.unitPrice;
      totalAmount += product.totalPrice;
      totalItems += product.quantity;
    });
    
    this.totalAmount = totalAmount;
    this.totalItems = totalItems;
  }
  next();
});

// Update timestamps based on status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    switch (this.status) {
      case 'confirmed':
        if (!this.confirmedAt) this.confirmedAt = now;
        break;
      case 'shipped':
        if (!this.shippedAt) this.shippedAt = now;
        break;
      case 'delivered':
        if (!this.deliveredAt) this.deliveredAt = now;
        if (this.paymentMethod === 'cod') {
          this.paymentStatus = 'completed';
        }
        break;
      case 'cancelled':
        if (!this.cancelledAt) this.cancelledAt = now;
        break;
    }
  }
  next();
});

// Indexes for better query performance
orderSchema.index({ buyerId: 1, orderDate: -1 });
orderSchema.index({ sellerId: 1, orderDate: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'products.productId': 1 });

module.exports = mongoose.model('Order', orderSchema);