const express = require('express');
const paymentController = require('../controllers/paymentController');
const router = express.Router();




// Routes
router.get('/plans', paymentController.getSubscriptionPlans);

// Razorpay routes
router.post('/razorpay/create-order', paymentController.createRazorpayOrder);
router.post('/razorpay/verify-payment', paymentController.verifyRazorpayPayment);

// PhonePe routes

// Create payment
router.post('/phonepe/create-payment', paymentController.createPhonePePayment);

// Success redirect (user lands here after payment)
router.get('/phonepe/success', paymentController.phonePeSuccess);

// Webhook callback (PhonePe sends notifications here)
router.post('/phonepe/callback', paymentController.phonePeCallback);

// Check payment status
router.get('/phonepe/status/:merchantTransactionId', async (req, res) => {
  try {
    const status = await paymentController.checkPaymentStatus(req.params.merchantTransactionId);
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
module.exports = router;
