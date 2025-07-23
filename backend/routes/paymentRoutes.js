const express = require('express');
const paymentController = require('../controllers/paymentController');
const router = express.Router();




// Routes
router.get('/plans', paymentController.getSubscriptionPlans);

// Razorpay routes
router.post('/razorpay/create-order', paymentController.createRazorpayOrder);
router.post('/razorpay/verify-payment', paymentController.verifyRazorpayPayment);

// PhonePe routes

module.exports = router;
