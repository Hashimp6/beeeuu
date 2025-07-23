// payment.controller.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');
const SUBSCRIPTION_PLANS = {
    premium: {
      name: "Premium",
      amount: 10, // in rupees
      duration: "1 month"
    },
    golden_premium: {
      name: "Golden Premium", 
      amount: 12, // in rupees
      duration: "1 month"
    }
  };

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// // Subscription plans
// const SUBSCRIPTION_PLANS = {
//   premium: { amount: 240, name: 'Premium Plan' },
//   golden: { amount: 480, name: 'Golden Premium Plan' }
// };

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









    async createPhonePePayment(req, res) {
    try {
      const { email, phone, name, plan } = req.body;

      // Validation
      if (!email || !phone || !name || !plan) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      if (!SUBSCRIPTION_PLANS[plan]) {
        return res.status(400).json({ success: false, message: 'Invalid plan selected' });
      }

      // Clean and validate phone number
      const cleanPhone = phone.toString().replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ success: false, message: 'Phone number must be 10 digits' });
      }

      // Amount should be in paisa (multiply by 100)
      const amount = SUBSCRIPTION_PLANS[plan].amount * 100;
      const merchantTransactionId = `MT${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Fixed PhonePe payload structure
      const data = {
        merchantId: process.env.PHONEPE_MERCHANT_ID,
        merchantTransactionId,
        merchantUserId: `USER_${Date.now()}`,
        amount,
        // Use REDIRECT for web applications instead of POST
        redirectUrl: `${process.env.BASE_URL}/payments/phonepe/success`,
        redirectMode: "REDIRECT", // Changed from POST to REDIRECT
        callbackUrl: `${process.env.BASE_URL}/payments/phonepe/callback`,
        mobileNumber: cleanPhone,
        paymentInstrument: {
          type: "PAY_PAGE"
        }
      };

      // Environment validation
      if (!process.env.PHONEPE_MERCHANT_ID || !process.env.PHONEPE_SALT_KEY) {
        return res.status(500).json({ success: false, message: 'PhonePe configuration missing' });
      }

      // Create payload and checksum
      const payload = JSON.stringify(data);
      const payloadMain = Buffer.from(payload).toString('base64');
      const keyIndex = 1;
      const string = payloadMain + '/pg/v1/pay' + process.env.PHONEPE_SALT_KEY; // Use v1 API
      const sha256 = crypto.createHash('sha256').update(string).digest('hex');
      const checksum = sha256 + '###' + keyIndex;

      // Use v1 API endpoint (more stable for basic payments)
      const apiUrl = process.env.PHONEPE_ENV === 'PRODUCTION'
        ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
        : 'https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay';

      const options = {
        method: 'POST',
        url: apiUrl,
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        },
        data: {
          request: payloadMain
        }
      };

      console.log('PhonePe Request Data:', JSON.stringify(data, null, 2));
      console.log('Payload Base64:', payloadMain);
      console.log('Checksum:', checksum);

      const response = await axios.request(options);
      
      console.log('PhonePe Response:', response.data);

      if (response.data?.success && response.data?.data?.instrumentResponse?.redirectInfo?.url) {
        // Store transaction details in database
        // TODO: Save merchantTransactionId, user details, plan info to database
        
        return res.json({
          success: true,
          data: response.data,
          url: response.data.data.instrumentResponse.redirectInfo.url,
          merchantTransactionId
        });
      } else {
        console.error('Payment initiation failed:', response.data);
        return res.status(400).json({
          success: false,
          message: 'Payment initiation failed',
          error: response.data
        });
      }

    } catch (error) {
      console.error('PhonePe Payment Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      return res.status(error.response?.status || 500).json({
        success: false,
        message: 'Payment initiation failed',
        error: error.response?.data || error.message
      });
    }
  }

  // Success page handler (for redirect)
  async phonePeSuccess(req, res) {
    try {
      const { merchantTransactionId } = req.query;
      
      if (merchantTransactionId) {
        // Check payment status
        const status = await this.checkPaymentStatus(merchantTransactionId);
        
        if (status.success && status.code === 'PAYMENT_SUCCESS') {
          // Redirect to success page in frontend
        //   return res.redirect(`${process.env.FRONTEND_URL}/payment/success?txnId=${merchantTransactionId}`);
        return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
        }
      }
      
      // Redirect to failure page
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
      
    } catch (error) {
      console.error('Success handler error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }
  }

  // Callback Handler (for webhook notifications)
  async phonePeCallback(req, res) {
    try {
      console.log('Webhook callback received:', req.body);
      
      const { response } = req.body;
      
      if (!response) {
        return res.status(200).json({ message: 'OK' }); // Always return 200 for webhooks
      }

      // Decode and verify the response
      const decodedResponse = Buffer.from(response, 'base64').toString();
      const responseData = JSON.parse(decodedResponse);
      
      console.log('Decoded PhonePe Callback:', responseData);

      const merchantTransactionId = responseData.data?.merchantTransactionId;
      
      if (merchantTransactionId) {
        // Update database based on payment status
        if (responseData.code === 'PAYMENT_SUCCESS') {
          // TODO: Update user subscription in database
          console.log('Payment successful for transaction:', merchantTransactionId);
        } else {
          console.log('Payment failed/pending for transaction:', merchantTransactionId);
        }
      }

      // Always return success for webhook
      return res.status(200).json({ message: 'OK' });
      
    } catch (error) {
      console.error('Callback processing error:', error);
      return res.status(200).json({ message: 'OK' }); // Still return 200
    }
  }

  // Check Payment Status
  async checkPaymentStatus(merchantTransactionId) {
    try {
      const merchantId = process.env.PHONEPE_MERCHANT_ID;
      const keyIndex = 1;
      const path = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
      const string = path + process.env.PHONEPE_SALT_KEY;
      const sha256 = crypto.createHash('sha256').update(string).digest('hex');
      const checksum = sha256 + '###' + keyIndex;

      const baseUrl = process.env.PHONEPE_ENV === 'PRODUCTION'
        ? 'https://api.phonepe.com/apis/hermes'
        : 'https://api-preprod.phonepe.com/apis/hermes';

      const response = await axios.get(`${baseUrl}${path}`, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        }
      });

      console.log('Status check response:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('Status check error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get Subscription Plans
  async getSubscriptionPlans(req, res) {
    try {
      res.json({ 
        success: true, 
        plans: SUBSCRIPTION_PLANS 
      });
    } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch subscription plans' 
      });
    }
  }
}

module.exports = new PaymentController();
