import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Save, 
  X,
  Check,
  AlertCircle,
  Settings,
  Bell,
  Shield,
  ChevronRight,
  Calendar,
  FileText,
  LogOut,
  Loader,
  Camera,
  CheckCircle,
  Eye,
  Store
} from 'lucide-react';
import { useAuth } from '../../context/UserContext';
import axios from 'axios';
import { SERVER_URL } from '../../Config';
import { useNavigate } from 'react-router-dom';
const EditModal = ({
    editForm,
    errors,
    handleInputChange,
    handleCancel,
    handleSave,
    isLoading
  }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-transparent"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Edit Profile</h3>
              <p className="text-teal-100 text-sm">Update your contact information</p>
            </div>
            <button
              onClick={handleCancel}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
  
        {/* Form */}
        <div className="p-8 space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}
  
          {/* Phone Field */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-teal-600" />
              Phone Number
            </label>
            <input
              type="tel"
              value={editForm.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500 ${
                errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-teal-500'
              }`}
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <div className="flex items-center gap-2 text-red-600 text-sm animate-in slide-in-from-left duration-300">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.phone}</span>
              </div>
            )}
          </div>
  
          {/* Address Field */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              Address
            </label>
            <textarea
              value={editForm.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={4}
              className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white resize-none text-gray-800 placeholder-gray-500 ${
                errors.address ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-teal-500'
              }`}
              placeholder="Enter your address"
            />
            {errors.address && (
              <div className="flex items-center gap-2 text-red-600 text-sm animate-in slide-in-from-left duration-300">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.address}</span>
              </div>
            )}
          </div>
  
          {/* Info Note */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-blue-800 text-sm">
              Both fields are optional. You can update either one or both fields as needed.
            </p>
          </div>
  
          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
const UserProfileComponent = ({  setHistory }) => {
  const { user, setUser,logout } = useAuth();

  const [localUser, setLocalUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();            // Clear user/token
    navigate('/home');   // Navigate after logout
  };
  useEffect(() => {
    if (user) {
      setLocalUser(user);
    }
  }, [user]);

  // Validation function - only runs on blur and submit
  const validateField = (fieldName, value) => {
    const trimmed = value?.trim() || '';
  
    if (fieldName === 'phone') {
      if (!trimmed) return 'Phone number is required';
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
      if (trimmed.length < 10) return 'Phone must be at least 10 digits';
      if (!phoneRegex.test(trimmed)) return 'Enter a valid phone number';
    }
  
    if (fieldName === 'address') {
      if (!trimmed) return 'Address is required';
      if (trimmed.length < 10) return 'Address must be at least 10 characters';
      if (trimmed.length > 200) return 'Address must be less than 200 characters';
    }
  
    return null; // no error
  };
  

  const handleEdit = () => {
    setEditForm({
      phone: localUser.phone || '',
      address: localUser.address || ''
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleSave = async () => {
    const phoneError = validateField('phone', editForm.phone);
    const addressError = validateField('address', editForm.address);
  
    const newErrors = {};
    if (phoneError) newErrors.phone = phoneError;
    if (addressError) newErrors.address = addressError;
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    setIsLoading(true);
  
    try {
      const updateData = {
        userId: localUser._id || localUser.id,
        phone: editForm.phone.trim(),
        address: editForm.address.trim()
      };
  console.log("updating data",updateData);
  
      const response = await axios.put(`${SERVER_URL}/users/change-address`, updateData, {
        headers: { 'Content-Type': 'application/json' }
      });
  
      const updatedUser = response.data.user;
      setLocalUser(prev => ({ ...prev, ...updatedUser }));
      setUser(prev => ({ ...prev, ...updatedUser }));
  
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({
        general: error.response?.data?.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({});
    setErrors({});
  };

  // Simple input change handler - no validation during typing
  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Validate only on blur (when user leaves the field)
 

  const GlassCard = ({ children, className = "" }) => (
    <div className={`bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      {children}
    </div>
  );

  const ActionButton = ({ icon: Icon, text, onClick, variant = "primary", className = "" }) => {
    const variants = {
      primary: "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg shadow-teal-500/25",
      secondary: "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 shadow-lg shadow-gray-500/25",
      danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25",
      ghost: "bg-white/80 hover:bg-white text-teal-600 border border-teal-200 shadow-lg shadow-teal-500/10"
    };

    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl ${variants[variant]} ${className}`}
      >
        <Icon className="w-5 h-5" />
        {text}
      </button>
    );
  };

 

  const SuccessNotification = () => (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-500 ${showSuccess ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
        <CheckCircle className="w-6 h-6" />
        <div>
          <div className="font-semibold">Profile Updated!</div>
          <div className="text-sm text-green-100">Your changes have been saved successfully.</div>
        </div>
      </div>
    </div>
  );
  if (!user) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-gray-100 to-teal-100 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-5">
          <h2 className="text-xl font-bold text-gray-800">Please Login</h2>
          <p className="text-gray-600 text-sm">You must be logged in to view your profile details.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="h-[90vh] bg-gradient-to-br from-gray-50 via-white to-teal-50 overflow-hidden">
      <SuccessNotification />
      
      {/* Fixed Height Container */}
      <div className="h-full overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-3 min-h-full flex flex-col justify-between space-y-3">

          {/* Top Section */}
          <div className="space-y-3">
            {/* Profile Header */}
            <div className="relative rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white p-5 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-3xl"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-xl font-bold backdrop-blur border border-white/20">
                      {localUser.name?.charAt(0)?.toUpperCase() || localUser.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
                  </div>
                  {/* Name & Username */}
                  <div>
                    <h1 className="text-lg font-bold leading-tight">{localUser.name || localUser.username}</h1>
                    <p className="text-teal-100 text-xs">@{localUser.username}</p>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={handleEdit}
                  className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 transition hover:scale-105"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* User Info Card */}
            <GlassCard className="p-3 space-y-2">
              {[{
                icon: <Mail className="w-4 h-4 text-teal-600" />,
                label: "Email",
                value: localUser.email
              }, {
                icon: <Phone className="w-4 h-4 text-teal-600" />,
                label: "Phone",
                value: localUser.phone || 'Not provided'
              }, {
                icon: <MapPin className="w-4 h-4 text-teal-600" />,
                label: "Address",
                value: localUser.address || 'Not provided'
              }].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-2.5 border border-gray-200/50">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-teal-100">{item.icon}</div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">{item.label}</div>
                    <div className="text-gray-800 font-medium text-sm">{item.value}</div>
                  </div>
                </div>
              ))}
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard className="p-3 space-y-2">
              <ActionButton
                icon={Calendar}
                text="My Appointments"
                onClick={() => setHistory('appointments')}
                variant="primary"
              />
              <ActionButton
                icon={FileText}
                text="My Orders"
                onClick={() => setHistory('orders')}
                variant="secondary"
              />
            </GlassCard>
          </div>

          {/* Bottom Section - Only Logout */}
          <div className="pb-4 space-y-2">
  <ActionButton
    icon={Store}
    text="Be a Seller"
    onClick={() => navigate('/newStore')}
    className="w-full bg-black text-white hover:bg-gray-900 transition-colors"
  />
  
  <ActionButton
    icon={LogOut}
    text="Logout"
    onClick={handleLogout}
    variant="danger"
  />
</div>

        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <EditModal
          editForm={editForm}
          errors={errors}
          handleInputChange={handleInputChange}
          handleCancel={handleCancel}
          handleSave={handleSave}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
export default UserProfileComponent;