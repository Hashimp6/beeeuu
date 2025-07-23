// import React, { useState } from "react";
// import { CheckCircle, BadgeCheck, Loader2 } from "lucide-react";
// import axios from "axios";
// import { ServerUrl } from "../config"; // <-- Import Server URL

// const plans = [
//   {
//     name: "Premium",
//     price: 10,
//     backendPlanKey: "premium", // key used by backend
//     features: ["Ad-Free", "Basic Support", "Unlimited Access"],
//     color: "bg-blue-600",
//     highlight: false,
//   },
//   {
//     name: "Golden Premium",
//     price: 12,
//     backendPlanKey: "golden_premium",
//     features: ["Ad-Free", "Priority Support", "Exclusive Features"],
//     color: "bg-yellow-400",
//     highlight: true,
//   },
// ];

// const SubscriptionPlans = () => {
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubscribe = async (plan) => {
//     setLoading(true);
//     setSelectedPlan(plan.name);

//     try {
//       const res = await axios.post(`${ServerUrl}/payment/phonepe/create-payment`, {
//         name: "Hashim Husain", // replace with dynamic user if available
//         email: "hashim@example.com",
//         phone: "9876543210",
//         plan: plan.backendPlanKey,
//       });

//       if (res.data.success && res.data.url) {
//         window.location.href = res.data.url; // Redirect to PhonePe pay page
//       } else {
//         alert("Failed to initiate payment.");
//       }
//     } catch (error) {
//       console.error("Payment error:", error);
//       alert("Something went wrong while initiating the payment.");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-black via-gray-900 to-black text-white py-12 px-4">
//       <h1 className="text-4xl font-bold text-center mb-10">Choose Your Plan</h1>

//       <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
//         {plans.map((plan) => (
//           <div
//             key={plan.name}
//             className={`rounded-2xl shadow-lg p-8 relative transition-transform hover:scale-105 border-2 ${
//               selectedPlan === plan.name
//                 ? "border-green-400"
//                 : "border-gray-700"
//             } ${plan.color}`}
//           >
//             {plan.highlight && (
//               <div className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded-full text-sm font-semibold">
//                 Most Popular
//               </div>
//             )}

//             <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
//               {plan.name}
//               <BadgeCheck className="w-6 h-6" />
//             </h2>

//             <p className="text-4xl font-extrabold mb-6">₹{plan.price}</p>

//             <ul className="space-y-3 mb-6">
//               {plan.features.map((feature, index) => (
//                 <li key={index} className="flex items-center gap-2">
//                   <CheckCircle className="text-green-300" />
//                   <span>{feature}</span>
//                 </li>
//               ))}
//             </ul>

//             <button
//               onClick={() => handleSubscribe(plan)}
//               disabled={loading}
//               className="w-full py-2 rounded-xl font-semibold bg-black hover:bg-opacity-80 transition-colors flex justify-center items-center"
//             >
//               {loading && selectedPlan === plan.name ? (
//                 <Loader2 className="animate-spin w-5 h-5 mr-2" />
//               ) : null}
//               {selectedPlan === plan.name && loading
//                 ? "Redirecting..."
//                 : "Subscribe"}
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SubscriptionPlans;



import React, { useState, useEffect } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { SERVER_URL } from "../../Config";
import { useAuth } from "../../context/UserContext";

const plans = [
  {
    name: "Basic",
    price: "Free",
    features: ["Limited access", "Community support", "Browse only"],
    color: "bg-white text-black",
    border: "border border-purple-500",
  },
  {
    name: "Premium",
    price: "₹240",
    features: ["All Basic features", "Priority support", "Premium content"],
    color: "bg-purple-600 text-white",
    border: "border-2 border-black",
    planId: "premium",
    duration: 30,
  },
  {
    name: "Golden Premium",
    price: "₹480",
    features: ["All Premium features", "1-on-1 support", "Exclusive offers"],
    color: "bg-black text-purple-300",
    border: "border-2 border-purple-500",
    planId: "golden",
    duration: 30,
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
          phone: user.phone || "", // Add phone if available in user context
          name: user.name || user.email, // Use name or email as fallback
          plan: plan.planId,
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
        name: "Your App Name", // Replace with your app name
        description: `Subscribe to ${orderData.planDetails.planName}`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.customerDetails.name,
          email: orderData.customerDetails.email,
          contact: orderData.customerDetails.phone,
        },
        theme: {
          color: "#9333EA", // Purple theme to match your design
        },
        modal: {
          ondismiss: () => {
            setLoading((prev) => ({ ...prev, [plan.name]: false }));
          },
        },
        handler: async (response) => {
          // Verify payment on successful payment
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
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              alert("Payment successful! Your subscription has been activated.");
              // You can redirect or update UI here
              // window.location.reload(); // Optional: refresh to update subscription status
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Subscription Plan
          </h1>
          <p className="text-lg text-gray-600">
            Secure payments powered by Razorpay
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-6 shadow-xl hover:scale-105 transform transition-all duration-300 ${plan.color} ${plan.border}`}
            >
              {/* Badge */}
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <div className="text-3xl font-bold mb-1">{plan.price}</div>
                {plan.duration && (
                  <p className="text-sm opacity-80">per {plan.duration} days</p>
                )}
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading[plan.name]}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  plan.name === "Basic"
                    ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
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

