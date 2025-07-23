import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { SERVER_URL } from "../../Config";

const PaymentStatus = () => {
  const [status, setStatus] = useState("loading"); // success, failed, pending
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const txnId = searchParams.get("transactionId");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(
          `${SERVER_URL}/subscription/status/${txnId}`
        );
        if (res.data.status === "success") {
          setStatus("success");
          setMessage("Your subscription is now active! 🎉");
        } else if (res.data.status === "pending") {
          setStatus("pending");
          setMessage("Your payment is still processing. Please wait...");
        } else {
          setStatus("failed");
          setMessage("Payment failed. Please try again.");
        }
      } catch (err) {
        setStatus("failed");
        setMessage("Unable to verify payment. Please contact support.");
      }
    };

    if (txnId) {
      checkStatus();
    } else {
      setStatus("failed");
      setMessage("Missing transaction ID.");
    }
  }, [txnId]);

  const renderIcon = () => {
    if (status === "loading") return <Loader2 className="animate-spin w-12 h-12 text-gray-500" />;
    if (status === "success") return <CheckCircle className="text-green-600 w-14 h-14" />;
    if (status === "failed") return <XCircle className="text-red-600 w-14 h-14" />;
    if (status === "pending") return <Clock className="text-yellow-500 w-14 h-14" />;
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-100 via-white to-teal-100 text-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex justify-center mb-4">{renderIcon()}</div>
        <h2 className="text-2xl font-semibold mb-2">
          {status === "loading" ? "Checking Payment Status..." : status.toUpperCase()}
        </h2>
        <p className="text-gray-700">{message}</p>
        {status === "success" && (
          <a
            href="/dashboard"
            className="mt-6 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-full transition"
          >
            Go to Dashboard
          </a>
        )}
        {status === "failed" && (
          <a
            href="/pricing"
            className="mt-6 inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-full transition"
          >
            Retry Payment
          </a>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
