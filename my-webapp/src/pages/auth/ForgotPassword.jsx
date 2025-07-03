import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { SERVER_URL } from '../../Config';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
        console.log("email",email,SERVER_URL);
        
      const response = await axios.post(`${SERVER_URL}/users/forgot-password`, {
        email,
      });

      const data = response.data;

      if (data.success) {
        toast.success(' a reset link has been sent.');
       
      } else {
        toast.error(data.message || 'Something went wrong.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <Toaster />
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Logo" className="h-20 object-contain" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-2">Forgot Password?</h1>
          <p className="text-gray-600 text-sm">
            Enter your email address and we’ll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              className="mt-2 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            onClick={handleForgotPassword}
            disabled={loading}
            className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-black text-sm font-bold hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
