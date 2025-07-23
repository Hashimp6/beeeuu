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






  


  async createPhonePePayment(req, res) {
    try {
      const { email, phone, name, plan } = req.body;
      
      // Validate required fields
      if (!email || !phone || !name || !plan) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: email, phone, name, plan'
        });
      }

      // Validate plan
      if (!SUBSCRIPTION_PLANS[plan]) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription plan'
        });
      }

      // Validate phone number format (should be 10 digits)
      const cleanPhone = phone.toString().replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must be 10 digits'
        });
      }

      const amount = SUBSCRIPTION_PLANS[plan].amount * 100; // Convert to paise
      const merchantTransactionId = `MT${Date.now()}`; // Changed prefix to MT
      
      // V2 API payload structure - All parameters must be strings except amount
      const data = {
        merchantId: process.env.PHONEPE_MERCHANT_ID.toString(),
        merchantTransactionId: merchantTransactionId.toString(),
        merchantUserId: `USER_${Date.now()}`,
        amount: amount, // This should be integer (in paise)
        redirectUrl: `${process.env.BASE_URL}/payments/phonepe/callback`,
        redirectMode: "POST", 
        callbackUrl: `${process.env.BASE_URL}/payments/phonepe/callback`,
        mobileNumber: cleanPhone, // Use cleaned phone number
        paymentInstrument: {
          type: "PAY_PAGE"
        }
      };

      // Validate merchant ID
      if (!process.env.PHONEPE_MERCHANT_ID || !process.env.PHONEPE_SALT_KEY) {
        return res.status(500).json({
          success: false,
          message: 'PhonePe configuration missing'
        });
      }

      // Create payload and checksum for V2 API
      const payload = JSON.stringify(data);
      const payloadMain = Buffer.from(payload).toString('base64');
      const keyIndex = 1;
      
      // Updated string format for V2 API
      const string = payloadMain + '/pg/v2/pay' + process.env.PHONEPE_SALT_KEY;
      const sha256 = crypto.createHash('sha256').update(string).digest('hex');
      const checksum = sha256 + '###' + keyIndex;

      // V2 API endpoint and headers
      const options = {
        method: 'POST',
        url: process.env.PHONEPE_ENV === 'PRODUCTION' 
          ? 'https://api.phonepe.com/apis/hermes/pg/v2/pay'
          : 'https://api-preprod.phonepe.com/apis/hermes/pg/v2/pay',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': checksum
        },
        data: {
          request: payloadMain
        }
      };

      console.log('PhonePe Request URL:', options.url);
      console.log('PhonePe Request Headers:', options.headers);
      console.log('PhonePe Payload (decoded):', JSON.stringify(data, null, 2));

      const response = await axios.request(options);
      
      // Check if response is successful
      if (response.data && response.data.success) {
        res.json({
          success: true,
          data: response.data,
          url: response.data.data?.instrumentResponse?.redirectInfo?.url
        });
      } else {
        console.error('PhonePe API Error Response:', response.data);
        res.status(400).json({
          success: false,
          message: 'Payment initiation failed',
          error: response.data
        });
      }
      
    } catch (error) {
      console.error('PhonePe Payment Error:', error.response?.data || error.message);
      
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        const statusCode = error.response.status;
        const errorData = error.response.data;
        
        res.status(statusCode).json({
          success: false,
          message: 'PhonePe API Error',
          error: errorData,
          statusCode: statusCode
        });
      } else if (error.request) {
        // The request was made but no response was received
        res.status(500).json({
          success: false,
          message: 'No response from PhonePe API'
        });
      } else {
        // Something happened in setting up the request
        res.status(500).json({
          success: false,
          message: 'Failed to create PhonePe payment',
          error: error.message
        });
      }
    }
  }

  // PhonePe Payment Callback for V2 API
  async phonePeCallback(req, res) {
    try {
      const { response } = req.body;
      
      if (!response) {
        return res.status(400).json({
          success: false,
          message: 'No response data received'
        });
      }

      // Decode the response
      const decodedResponse = Buffer.from(response, 'base64').toString();
      const responseData = JSON.parse(decodedResponse);

      console.log('PhonePe Callback Response:', responseData);

      // Verify the checksum (recommended for security)
      const merchantTransactionId = responseData.data?.merchantTransactionId;
      if (merchantTransactionId) {
        // Verify payment status by calling check status API
        const statusResponse = await this.checkPaymentStatus(merchantTransactionId);
        
        if (statusResponse.success && statusResponse.code === 'PAYMENT_SUCCESS') {
          // Payment successful - save to database
          // Add your database logic here
          
          res.json({
            success: true,
            message: 'Payment successful',
            data: statusResponse
          });
        } else {
          res.status(400).json({
            success: false,
            message: 'Payment failed or pending',
            data: statusResponse
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid callback data'
        });
      }
      
    } catch (error) {
      console.error('PhonePe Callback Error:', error);
      res.status(500).json({
        success: false,
        message: 'Callback processing failed',
        error: error.message
      });
    }
  }

  // Check payment status (V2 API)
  async checkPaymentStatus(merchantTransactionId) {
    try {
      const merchantId = process.env.PHONEPE_MERCHANT_ID;
      const keyIndex = 1;
      const string = `/pg/v2/status/${merchantId}/${merchantTransactionId}` + process.env.PHONEPE_SALT_KEY;
      const sha256 = crypto.createHash('sha256').update(string).digest('hex');
      const checksum = sha256 + '###' + keyIndex;

      const options = {
        method: 'GET',
        url: process.env.PHONEPE_ENV === 'PRODUCTION'
          ? `https://api.phonepe.com/apis/hermes/pg/v2/status/${merchantId}/${merchantTransactionId}`
          : `https://api-preprod.phonepe.com/apis/hermes/pg/v2/status/${merchantId}/${merchantTransactionId}`,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': merchantId
        }
      };

      const response = await axios.request(options);
      return response.data;
      
    } catch (error) {
      console.error('Payment Status Check Error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get subscription plans
  async getSubscriptionPlans(req, res) {
    try {
      res.json({
        success: true,
        plans: SUBSCRIPTION_PLANS
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch plans'
      });
    }
  }
}

module.exports = new PaymentController();
