import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SERVER_URL } from '../../Config';
import toast from 'react-hot-toast';

// inside OtpVerificationPage.jsx
const OtpVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      alert("Email is missing. Redirecting to registration...");
      navigate('/registration'); // fallback redirect
    } else {
      console.log("OTP Verification for:", email);
    }
  }, [email, navigate]);

  // Toast notification function
  const showToast = (type, title, message) => {
    // You can replace this with your preferred toast library
    if (type === 'error') {
      alert(`${title}: ${message}`);
    } else {
      alert(`${title}: ${message}`);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      showToast("error", "Error", "Please enter the OTP code");
      return;
    }
  
    try {
      setIsLoading(true);
  
      const response = await axios.post(
        `${SERVER_URL}/users/verify-otp-register`,
        {
          email,
          otp,
        }
      );
  
      const data = response.data;
  
      toast.success("Account verified successfully!");
      
      // Trigger success callback with user data
      navigate("/login"); 
    } catch (error) {
      console.error("OTP verification error:", error);
      
      if (error.response && error.response.data?.message) {
        const errorMsg = error.response?.data?.message || "Verification failed. Please try again.";
    toast.error(errorMsg);
      } else {
        showToast("error", "Error", "Verification failed. Please try again.");
      }
  
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleResendOtp = async () => {
    if (!email) {
      showToast("error", "Error", "Email information is missing");
      return;
    }
  
    try {
      setResendLoading(true);
  
      const response = await axios.post( `${SERVER_URL}/users/resend-otp`, {
        email
      });
  
      if (response.data.success) {
        showToast("success", "Success", "OTP has been resent to your email");
      } else {
        showToast("error", "Error", response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      const errorMsg = error.response?.data?.message || "Failed to resend OTP. Please try again.";
      showToast("error", "Error", errorMsg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <img 
              src="/logo.png"
              alt="Logo"
              className="w-60 h-20 object-contain"
            />
          </div>

          {/* Content */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black mb-4">Verify Your Email</h1>
            <p className="text-base text-gray-600 mb-8 leading-6">
              Please enter the 6-digit code sent to<br/>
              <span className="font-bold text-black">{email}</span>
            </p>

            {/* OTP Input */}
            <div className="bg-gray-100 rounded-2xl px-5 py-4 border border-gray-200 mb-8">
              <input
                type="text"
                className="w-full text-base text-black font-medium bg-transparent border-none outline-none placeholder-gray-400 text-center"
                placeholder="Enter OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            {/* Verify Button */}
            <button
              className="w-full bg-black text-white font-bold text-base h-14 rounded-2xl flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleVerifyOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Verify"
              )}
            </button>

            {/* Resend Section */}
            <div className="flex justify-center items-center mt-6">
              <span className="text-gray-600 text-sm">Didn't receive the code? </span>
              <button
                className="text-black text-sm font-bold ml-1 hover:underline disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
                onClick={handleResendOtp}
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Resend"
                )}
              </button>
            </div>

            {/* Back Button */}
            <div className="flex justify-center mt-6">
              <button
                className="text-gray-600 text-sm hover:text-gray-800 transition-colors"
                onClick={() => navigate('/registration')}
              >
                ← Back to Registration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationPage;