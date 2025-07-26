import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { SERVER_URL } from '../../config';

const RazorpayCheckout = ({ route, navigation }) => {
  const { storeId, plan, name, email, phone } = route.params;
  const [checkoutHtml, setCheckoutHtml] = useState('');

  useEffect(() => {
    const createOrder = async () => {
      try {
        const res = await axios.post(`${SERVER_URL}/payment/razorpay/create-order`, {
          plan,
          storeId,
          name,
          email,
          phone
        });

        const data = res.data;

        if (data.success) {
          const html = `
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
              </head>
              <body>
                <script>
                  var options = {
                    key: "${data.key}",
                    amount: "${data.amount}",
                    currency: "${data.currency}",
                    name: "SerchBy Subscription",
                    description: "${data.planDetails.planName}",
                    order_id: "${data.orderId}",
                    handler: function (response){
                      window.ReactNativeWebView.postMessage(JSON.stringify(response));
                    },
                    prefill: {
                      name: "${data.customerDetails.name}",
                      email: "${data.customerDetails.email}",
                      contact: "${data.customerDetails.phone}"
                    },
                    theme: { color: "#22b6d2" }
                  };
                  var rzp = new Razorpay(options);
                  rzp.open();
                </script>
              </body>
            </html>`;
          setCheckoutHtml(html);
        } else {
          Alert.alert("Error", "Failed to initiate payment");
          navigation.goBack();
        }
      } catch (err) {
        console.error("🚨 Order Creation Error:", err.response?.data || err.message);
        Alert.alert("Server Error", err.response?.data?.message || err.message);
        navigation.goBack();
      }
    };

    createOrder();
  }, []);

  const handlePaymentMessage = async (event) => {
    const data = JSON.parse(event.nativeEvent.data);

    try {
      const res = await axios.post(`${SERVER_URL}/payment/razorpay/verify-payment`, {
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
        customerDetails: { name, email, phone },
        storeId,
        plan
      });

      const result = res.data;

      if (result.success) {
        Alert.alert("Payment Successful", "Subscription activated!");
      } else {
        Alert.alert("Verification Failed", result.message);
      }
    } catch (error) {
      console.error("🚨 Payment Verification Error:", error.response?.data || error.message);
      Alert.alert("Verification Error", error.response?.data?.message || error.message);
    }

    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      {checkoutHtml ? (
        <WebView
          originWhitelist={['*']}
          source={{ html: checkoutHtml }}
          onMessage={handlePaymentMessage}
        />
      ) : (
        <ActivityIndicator size="large" color="#22b6d2" style={{ marginTop: 50 }} />
      )}
    </View>
  );
};

export default RazorpayCheckout;
