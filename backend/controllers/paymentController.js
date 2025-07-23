// payment.controller.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Subscription plans
const SUBSCRIPTION_PLANS = {
  premium: { amount: 240, name: 'Premium Plan' },
  golden: { amount: 480, name: 'Golden Premium Plan' }
};

class PaymentController {
  
  // Create Razorpay Order
  async createRazorpayOrder(req, res) {
    try {
      const { email, phone, name, plan } = req.body;
      
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
          plan_name: SUBSCRIPTION_PLANS[plan].name
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

  // Verify Razorpay Payment
  async verifyRazorpayPayment(req, res) {
    try {
      const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        customerDetails 
      } = req.body;

      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature === expectedSign) {
        // Payment verified successfully
        // Here you can save the subscription details to your database
        
        res.json({
          success: true,
          message: 'Payment verified successfully',
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id
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
        message: 'Payment verification failed'
      });
    }
  }
// Inside PaymentController class
getSubscriptionPlans(req, res) {
    try {
      res.json({
        success: true,
        plans: SUBSCRIPTION_PLANS
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
}
module.exports = new PaymentController();
