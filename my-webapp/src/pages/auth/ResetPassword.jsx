import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { SERVER_URL } from '../../Config';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { token, email } = useParams(); // assuming params like /reset-password/:email/:token

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${SERVER_URL}/users/reset-password`, {
        email,
        token,
        newPassword,
      });

      if (res.data.success) {
        toast.success('Password reset successful!');
        navigate('/login');
      } else {
        toast.error(res.data.message || 'Reset failed');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 space-y-6">
        <div className="text-center">
          <img src="/logo.png" alt="Logo" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
          <p className="text-sm text-gray-500">Enter your new password below</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-gray-50"
              placeholder="Confirm new password"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition duration-200"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 text-sm text-gray-600 hover:underline text-center"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
