import mongoose from 'mongoose';

/*---------------------------------------
  Payment Entry Schema (Each transaction)
----------------------------------------*/
const paymentEntrySchema = new mongoose.Schema({
  
  amountPaid: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending','confirmed'],
  },
referenceNumber: { type: String }, 
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  verified: {
    type: Boolean,
    default: false, // Can be used for admin verification
  }
});

const PaymentEntry = mongoose.model('PaymentEntry', paymentEntrySchema);

/*----------------------------
  Main Payment Schema
-----------------------------*/
const paymentSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'itemModel',
    required: true,
  },
  itemModel: {
    type: String,
    enum: ['Product', 'Appointment'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded', 'Paid-advance'],
    default: 'Pending',
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
    default: 0,
  },
  payments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentEntry',
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model('Payment', paymentSchema);

/*---------------------------
  Export Models
----------------------------*/
export { Payment, PaymentEntry };
