const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');
const Store = require('../models/storeModel'); // Adjust path as needed

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const SUBSCRIPTION_PLANS = {
  premium: { amount: 240, name: 'Premium Plan', duration: 1 },
  premium_6m: { amount: 1200, name: 'Premium 6-Month Plan', duration: 6 },
  golden: { amount: 480, name: 'Golden Premium Plan', duration: 1 },
  golden_6m: { amount: 2400, name: 'Golden 6-Month Plan', duration: 6 }
};

class PaymentController {
  constructor() {
    // Bind methods so 'this' is correct in routes
    this.createRazorpayOrder = this.createRazorpayOrder.bind(this);
    this.calculateValidTill = this.calculateValidTill.bind(this);
    this.updateStoreSubscription = this.updateStoreSubscription.bind(this);
    this.verifyRazorpayPayment = this.verifyRazorpayPayment.bind(this);
    this.getSubscriptionPlans = this.getSubscriptionPlans.bind(this);
    this.checkSubscriptionStatus = this.checkSubscriptionStatus.bind(this);
  }

  async createRazorpayOrder(req, res) {
    try {
      const { email, phone, name, plan, storeId } = req.body;

      if (!SUBSCRIPTION_PLANS[plan]) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription plan'
        });
      }

      const amount = SUBSCRIPTION_PLANS[plan].amount * 100;
      const options = {
        amount,
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: { email, phone, name, plan, plan_name: SUBSCRIPTION_PLANS[plan].name, storeId }
      };

      const order = await razorpay.orders.create(options);

      res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        customerDetails: { name, email, phone },
        planDetails: { plan, planName: SUBSCRIPTION_PLANS[plan].name, amount: SUBSCRIPTION_PLANS[plan].amount }
      });
    } catch (error) {
      console.error('Razorpay Order Creation Error:', error);
      res.status(500).json({ success: false, message: 'Failed to create payment order' });
    }
  }

  calculateValidTill(currentValidTill, planDuration) {
    const now = new Date();
    const currentDate = new Date(currentValidTill);
    let baseDate = (!currentValidTill || currentDate <= now) ? new Date(now) : new Date(currentDate);
    baseDate.setDate(baseDate.getDate() + planDuration * 30);
    return baseDate;
  }

  async updateStoreSubscription(storeId, plan, paymentDetails) {
    try {
      const store = await Store.findById(storeId);
      if (!store) throw new Error('Store not found');

      const planDetails = SUBSCRIPTION_PLANS[plan];
      if (!planDetails) throw new Error('Invalid plan');

      const baseSubscription = plan.includes('premium') ? 'premium' : 'golden';
      const newValidTill = this.calculateValidTill(store.validTill, planDetails.duration);

      const updatedStore = await Store.findByIdAndUpdate(
        storeId,
        {
          subscription: baseSubscription,
          validTill: newValidTill,
          $push: {
            paymentHistory: {
              paymentId: paymentDetails.paymentId,
              orderId: paymentDetails.orderId,
              plan: baseSubscription,
              planType: plan,
              amount: planDetails.amount,
              duration: planDetails.duration,
              paidAt: new Date(),
              validTill: newValidTill
            }
          }
        },
        { new: true, runValidators: true }
      );

      return updatedStore;
    } catch (error) {
      console.error('Error updating store subscription:', error);
      throw error;
    }
  }

  async verifyRazorpayPayment(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customerDetails, storeId, plan } = req.body;

      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature === expectedSign) {
        let orderStoreId = storeId;
        let orderPlan = plan;

        if (!storeId || !plan) {
          const order = await razorpay.orders.fetch(razorpay_order_id);
          orderStoreId = orderStoreId || order.notes.storeId;
          orderPlan = orderPlan || order.notes.plan;
        }

        if (!orderStoreId || !orderPlan) {
          return res.status(400).json({ success: false, message: 'Missing store ID or plan information' });
        }

        const updatedStore = await this.updateStoreSubscription(orderStoreId, orderPlan, {
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id
        });

        res.json({
          success: true,
          message: 'Payment verified and subscription updated successfully',
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          subscription: {
            plan: updatedStore.subscription,
            validTill: updatedStore.validTill,
            planName: SUBSCRIPTION_PLANS[orderPlan].name
          }
        });
      } else {
        res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
    } catch (error) {
      console.error('Payment Verification Error:', error);
      res.status(500).json({ success: false, message: 'Payment verification failed', error: error.message });
    }
  }

  getSubscriptionPlans(req, res) {
    try {
      res.json({ success: true, plans: SUBSCRIPTION_PLANS });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async checkSubscriptionStatus(req, res) {
    try {
      const { storeId } = req.params;
      const store = await Store.findById(storeId).select('subscription validTill');
      if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

      const now = new Date();
      const isActive = store.validTill && new Date(store.validTill) > now;

      res.json({
        success: true,
        subscription: {
          plan: store.subscription,
          validTill: store.validTill,
          isActive,
          daysRemaining: isActive ? Math.ceil((new Date(store.validTill) - now) / (1000 * 60 * 60 * 24)) : 0
        }
      });
    } catch (error) {
      console.error('Error checking subscription status:', error);
      res.status(500).json({ success: false, message: 'Failed to check subscription status' });
    }
  }
}

module.exports = new PaymentController();
