// payment.controller.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');
// Import Store model
const Store = require('../models/storeModel'); // Adjust path as needed

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Subscription plans
const SUBSCRIPTION_PLANS = {
  premium: { amount: 240, name: 'Premium Plan', duration: 1 }, // 1 month
  premium_6m: { amount: 1200, name: 'Premium 6-Month Plan', duration: 6 }, // 6 months
  golden: { amount: 480, name: 'Golden Premium Plan', duration: 1 }, // 1 month
  golden_6m: { amount: 2400, name: 'Golden 6-Month Plan', duration: 6 } // 6 months
};

class PaymentController {
  
  // Create Razorpay Order
  async createRazorpayOrder(req, res) {
    try {
      const { email, phone, name, plan, storeId } = req.body; // Changed userId to storeId
      
      // Validate plan
      if (!SUBSCRIPTION_PLANS[plan]) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription plan'
        });
      }

      const amount = SUBSCRIPTION_PLANS[plan].amount * 100; // Convert to paise
      
      const options = {
        amount: amount,
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        notes: {
          email,
          phone,
          name,
          plan,
          plan_name: SUBSCRIPTION_PLANS[plan].name,
          storeId // Store storeId in notes for later reference
        }
      };

      const order = await razorpay.orders.create(options);

      res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        customerDetails: {
          name,
          email,
          phone
        },
        planDetails: {
          plan,
          planName: SUBSCRIPTION_PLANS[plan].name,
          amount: SUBSCRIPTION_PLANS[plan].amount
        }
      });
    } catch (error) {
      console.error('Razorpay Order Creation Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment order'
      });
    }
  }

  calculateValidTill(currentValidTill, planDuration) {
    const now = new Date();
    const currentDate = new Date(currentValidTill);
    
    let baseDate;
    if (!currentValidTill || currentDate <= now) {
      baseDate = new Date(now);
    } else {
      baseDate = new Date(currentDate);
    }
    
    // Better approach: Add days instead of months to avoid month-end issues
    const daysToAdd = planDuration * 30; // Approximate 30 days per month
    baseDate.setDate(baseDate.getDate() + daysToAdd);
    
    return baseDate;
  }

  // Update store subscription
  async updateStoreSubscription(storeId, plan, paymentDetails) {
    try {
      // Find the store
      const store = await Store.findById(storeId);
      if (!store) {
        throw new Error('Store not found');
      }

      const planDetails = SUBSCRIPTION_PLANS[plan];
      if (!planDetails) {
        throw new Error('Invalid plan');
      }

      // Determine the base subscription type (premium or golden)
      const baseSubscription = plan.includes('premium') ? 'premium' : 'golden';

      // Calculate new validTill date based on plan duration
      const newValidTill = this.calculateValidTill(store.validTill, planDetails.duration);

      // Update subscription details
      const updatedStore = await Store.findByIdAndUpdate(
        storeId,
        {
          subscription: baseSubscription, // 'premium' or 'golden'
          validTill: newValidTill,
          // Optional: Store payment history
          $push: {
            paymentHistory: {
              paymentId: paymentDetails.paymentId,
              orderId: paymentDetails.orderId,
              plan: baseSubscription,
              planType: plan, // Store the full plan type (premium_6m, etc.)
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

  // Verify Razorpay Payment
  async verifyRazorpayPayment(req, res) {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        customerDetails,
        storeId, // Changed from userId to storeId
        plan     // Make sure to send plan from frontend
      } = req.body;

      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature === expectedSign) {
        // Payment verified successfully
        
        // Get order details to extract store info if not provided
        let orderStoreId = storeId;
        let orderPlan = plan;
        
        if (!storeId || !plan) {
          const order = await razorpay.orders.fetch(razorpay_order_id);
          orderStoreId = orderStoreId || order.notes.storeId;
          orderPlan = orderPlan || order.notes.plan;
        }

        if (!orderStoreId || !orderPlan) {
          return res.status(400).json({
            success: false,
            message: 'Missing store ID or plan information'
          });
        }

        // Update store subscription
        const updatedStore = await this.updateStoreSubscription(
          orderStoreId, 
          orderPlan,
          {
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id
          }
        );

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
        res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }
    } catch (error) {
      console.error('Payment Verification Error:', error);
      res.status(500).json({
        success: false,
        message: 'Payment verification failed',
        error: error.message
      });
    }
  }

  // Get subscription plans
  getSubscriptionPlans(req, res) {
    try {
      res.json({
        success: true,
        plans: SUBSCRIPTION_PLANS
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // Check subscription status
  async checkSubscriptionStatus(req, res) {
    try {
      const { storeId } = req.params;
      
      const store = await Store.findById(storeId).select('subscription validTill');
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }

      const now = new Date();
      const isActive = store.validTill && new Date(store.validTill) > now;

      res.json({
        success: true,
        subscription: {
          plan: store.subscription,
          validTill: store.validTill,
          isActive: isActive,
          daysRemaining: isActive ? 
            Math.ceil((new Date(store.validTill) - now) / (1000 * 60 * 60 * 24)) : 0
        }
      });
    } catch (error) {
      console.error('Error checking subscription status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check subscription status'
      });
    }
  }
}

module.exports = new PaymentController();