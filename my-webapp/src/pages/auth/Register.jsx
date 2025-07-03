import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { SERVER_URL } from '../../Config';

const RegisterPage = ({ onNavigateToOTP, onNavigateToLogin }) => {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Real-time validation states
  const [showNameError, setShowNameError] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showConfirmPasswordError, setShowConfirmPasswordError] = useState(false);

  // Enhanced validation functions
  const validateName = (name) => {
    const trimmedName = name.trim();
    // Check minimum length and contains only letters and spaces
    return trimmedName.length >= 3 && /^[a-zA-Z\s]+$/.test(trimmedName);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();
    
    // Basic email format validation
    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    
    // Check for common email providers
    const commonProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com'];
    const domain = trimmedEmail.split('@')[1];
    
    if (!commonProviders.includes(domain)) {
      return { isValid: false, error: 'Please use a common email provider (Gmail, Yahoo, Outlook, etc.)' };
    }
    
    return { isValid: true, error: null };
  };

  const validatePassword = (password) => {
    const errors = [];
    
    // Minimum length check
    if (password.length < 6) {
      errors.push('at least 6 characters');
    }
    
    // Contains uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('one uppercase letter');
    }
    
    // Contains lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('one lowercase letter');
    }
    
    // Contains number
    if (!/[0-9]/.test(password)) {
      errors.push('one number');
    }
    
    // Contains special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('one special character (!@#$%^&*(),.?":{}|<>)');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  // Get validation error messages
  const getNameError = (name) => {
    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      return 'Name must be at least 3 characters long';
    }
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      return 'Name should only contain letters and spaces';
    }
    return null;
  };

  const getEmailError = (email) => {
    const validation = validateEmail(email);
    return validation.error;
  };

  const getPasswordError = (password) => {
    const validation = validatePassword(password);
    if (!validation.isValid) {
      return `Password must contain: ${validation.errors.join(', ')}`;
    }
    return null;
  };

  // Toast notification function
  const showToast = (type, title, message) => {
    // You can replace this with your preferred toast library
    if (type === 'error') {
      alert(`${title}: ${message}`);
    } else {
      alert(`${title}: ${message}`);
    }
  };

  // Real-time validation handlers
  const handleNameChange = (text) => {
    setName(text);
    if (text.length > 0) {
      setShowNameError(!validateName(text));
    } else {
      setShowNameError(false);
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (text.length > 0) {
      const validation = validateEmail(text);
      setShowEmailError(!validation.isValid);
    } else {
      setShowEmailError(false);
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (text.length > 0) {
      const validation = validatePassword(text);
      setShowPasswordError(!validation.isValid);
    } else {
      setShowPasswordError(false);
    }
    
    // Also check confirm password if it has value
    if (confirmPassword.length > 0) {
      setShowConfirmPasswordError(text !== confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    if (text.length > 0) {
      setShowConfirmPasswordError(text !== password);
    } else {
      setShowConfirmPasswordError(false);
    }
  };

  const handleRegister = async () => {
    // Enhanced form validation with specific error messages
    if (!name || !email || !password || !confirmPassword) {
      showToast('error', 'Missing Details', 'Please fill in all fields.');
      return;
    }

    // Validate name
    if (!validateName(name)) {
      showToast('error', 'Invalid Name', getNameError(name));
      return;
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      showToast('error', 'Invalid Email', emailValidation.error);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      showToast('error', 'Invalid Password', getPasswordError(password));
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      showToast('error', 'Password Mismatch', 'Passwords do not match.');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("fine");
    
      // Send registration request using axios
      const response = await axios.post(`${SERVER_URL}users/register`, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      });
    
      const data = response.data;
    
      // Check response data structure
      if (response.status === 200 && data.message) {
        console.log("OTP request successful");
        
        showToast('success', 'Registration Successful!', 'Please check your email for OTP verification.');
    
        // Navigate to OTP verification with email
        onNavigateToOTP(email.trim().toLowerCase());
      } else {
        showToast('error', 'Registration Failed', data.message || 'Unexpected response from server.');
      }
    } catch (error) {
      console.error("Registration error:", error);
    
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";
    
      showToast('error', 'Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
    
  };

  // Check if form is valid for button state
  const isFormValid = () => {
    return (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      validateName(name) &&
      validateEmail(email).isValid &&
      validatePassword(password).isValid &&
      password === confirmPassword
    );
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

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Create Account</h1>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Name Input */}
            <div className={`bg-gray-100 rounded-2xl px-5 py-4 border ${
              showNameError ? 'border-red-300' : 'border-gray-200'
            }`}>
              <label className="block text-xs text-gray-500 mb-1.5">Full Name</label>
              <input
                type="text"
                className="w-full text-base text-black font-medium bg-transparent border-none outline-none placeholder-gray-400"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              {showNameError && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {getNameError(name)}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div className={`bg-gray-100 rounded-2xl px-5 py-4 border ${
              showEmailError ? 'border-red-300' : 'border-gray-200'
            }`}>
              <label className="block text-xs text-gray-500 mb-1.5">Email</label>
              <input
                type="email"
                className="w-full text-base text-black font-medium bg-transparent border-none outline-none placeholder-gray-400"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
              />
              {showEmailError && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {getEmailError(email)}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className={`bg-gray-100 rounded-2xl px-5 py-4 border ${
              showPasswordError ? 'border-red-300' : 'border-gray-200'
            }`}>
              <label className="block text-xs text-gray-500 mb-1.5">Password</label>
              <input
                type="password"
                className="w-full text-base text-black font-medium bg-transparent border-none outline-none placeholder-gray-400"
                placeholder="Create a password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
              />
              {showPasswordError && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {getPasswordError(password)}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className={`bg-gray-100 rounded-2xl px-5 py-4 border ${
              showConfirmPasswordError ? 'border-red-300' : 'border-gray-200'
            }`}>
              <label className="block text-xs text-gray-500 mb-1.5">Confirm Password</label>
              <input
                type="password"
                className="w-full text-base text-black font-medium bg-transparent border-none outline-none placeholder-gray-400"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              />
              {showConfirmPasswordError && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Register Button */}
            <button
              className={`w-full font-bold text-base h-14 rounded-2xl flex items-center justify-center mt-6 shadow-lg transition-colors ${
                isFormValid() && !isLoading
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleRegister}
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Footer */}
            <div className="flex justify-center mt-6">
              <span className="text-gray-600 text-sm">
                Already have an account?{" "}
              </span>
              <button
                className="text-black text-sm font-bold ml-1 hover:underline"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;