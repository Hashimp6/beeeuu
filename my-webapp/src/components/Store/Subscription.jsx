import React, { useState, useEffect } from "react";
import { CheckCircle, Loader2, Star, Clock } from "lucide-react";
import { SERVER_URL } from "../../Config";
import { useAuth } from "../../context/UserContext";

const plans = [
  {
    name: "Basic",
    price: "Free",
    features: ["Limited access","1 offer in a week","limited product/service Add", "limited post in gallery", "No chat ,Order Management,Appointment Management feature"],
    color: "bg-white text-black",
    border: "border border-purple-500",
  },
  {
    name: "Premium",
    price: "₹240",
    originalPrice: null,
    features: ["1 offer per day", "Priority support", "Chat, Order Management , Appointment Management","Limited Products, Appointment , Gallery Access"],
    color: "bg-purple-600 text-white",
    border: "border-2 border-black",
    planId: "premium",
    duration: 30,
    durationType: "1 month",
  },
  {
    name: "Premium 6M",
    price: "₹1,200",
    originalPrice: "₹1,440",
    discount: "17% OFF",
    features: ["All Premium features", "6 months validity", "Priority support", "Save ₹240"],
    color: "bg-gradient-to-br from-purple-600 to-purple-700 text-white",
    border: "border-2 border-purple-400",
    planId: "premium_6m",
    duration: 180,
    durationType: "6 months",
    badge: "Best Value",
  },
  {
    name: "Golden Premium",
    price: "₹480",
    originalPrice: null,
    features: ["Unlimited Offers Posting", "1-on-1 support", "Unlimited Product ,Appointment , Gallery Access"],
    color: "bg-black text-amber-400",
border: "border-2 border-amber-500",
    planId: "golden",
    duration: 30,
    durationType: "1 month",
  },
  {
    name: "Golden 6M",
    price: "₹2,400",
    originalPrice: "₹2,880",
    discount: "17% OFF",
    features: ["All Golden features", "6 months validity", "VIP support", "Save ₹480"],
    color: "bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 text-white",
    border: "border-2 border-yellow-400",
    planId: "golden_6m",
    duration: 180,
    durationType: "6 months",
    badge: "Premium Value",
  },
];

const SubscriptionController = ({ store }) => {
  console.log("Store data:", store);
  const { user } = useAuth();
  const [loading, setLoading] = useState({});
  const [userEmail] = useState(user.email);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handleSubscribe = async (plan) => {
    if (plan.price === "Free") return;

    setLoading((prev) => ({ ...prev, [plan.name]: true }));

    try {
      // Create Razorpay order
      const orderResponse = await fetch(`${SERVER_URL}/payment/razorpay/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          // Authorization: `Bearer ${yourToken}`
        },
        body: JSON.stringify({
          email: userEmail,
          phone: user.phone || "",
          name: user.name || user.email,
          plan: plan.planId,
          storeId: store._id,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        alert("Error creating payment order. Please try again.");
        return;
      }

      // Configure Razorpay payment options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SerchBy",
        description: `Subscribe to ${orderData.planDetails.planName}`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.customerDetails.name,
          email: orderData.customerDetails.email,
          contact: orderData.customerDetails.phone,
        },
        theme: {
          color: "#9333EA",
        },
        modal: {
          ondismiss: () => {
            setLoading((prev) => ({ ...prev, [plan.name]: false }));
          },
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch(`${SERVER_URL}/payment/razorpay/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customerDetails: orderData.customerDetails,
                storeId: store._id,
                plan: plan.planId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              alert("Payment successful! Your subscription has been activated.");
              // Optional: refresh to update subscription status
              // window.location.reload();
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            alert("Payment verification failed. Please contact support.");
          }
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong. Try again later.");
    } finally {
      setLoading((prev) => ({ ...prev, [plan.name]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Subscription Plan
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Secure payments powered by Razorpay
          </p>
          <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
            <Star className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              Save up to 17% with 6-month plans
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-6 shadow-xl hover:scale-105 transform transition-all duration-300 ${plan.color} ${plan.border} ${
                plan.badge ? 'ring-2 ring-green-400 ring-opacity-50' : ''
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Discount Badge */}
              {plan.discount && (
                <div className="absolute -top-2 -right-2">
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {plan.discount}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
                
                {/* Price section */}
                <div className="mb-2">
                  {plan.originalPrice && (
                    <div className="text-sm opacity-60 line-through">
                      {plan.originalPrice}
                    </div>
                  )}
                  <div className="text-2xl font-bold mb-1">{plan.price}</div>
                </div>
                
                {plan.durationType && (
                  <div className="flex items-center justify-center gap-1 text-sm opacity-80">
                    <Clock className="w-3 h-3" />
                    <span>per {plan.durationType}</span>
                  </div>
                )}
              </div>

              <ul className="mb-8 space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading[plan.name]}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm ${
                  plan.name === "Basic"
                    ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    : plan.badge
                    ? "bg-white text-green-600 hover:bg-green-50 shadow-lg ring-2 ring-green-500"
                    : "bg-white text-purple-600 hover:bg-purple-50 shadow-lg"
                }`}
              >
                {loading[plan.name] ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : plan.price === "Free" ? (
                  "Current Plan"
                ) : (
                  "Subscribe Now"
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
            Why Choose 6-Month Plans?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Better Value</h3>
              <p className="text-gray-600 text-sm">Save up to 17% compared to monthly subscriptions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Uninterrupted Service</h3>
              <p className="text-gray-600 text-sm">Enjoy 6 months of premium features without renewal hassles</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Extended Benefits</h3>
              <p className="text-gray-600 text-sm">Longer validity period with all premium features included</p>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-purple-800">
              Secure payments with industry-standard encryption
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionController;