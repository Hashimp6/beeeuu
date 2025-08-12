import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Tag as OfferIcon,
  RefreshCw,
  AlertCircle,
  X,
  Percent,
  Eye,
  Calendar,
  DollarSign,
  Upload,
  IndianRupee
} from 'lucide-react';
import { SERVER_URL } from '../../Config';
import { useAuth } from '../../context/UserContext';
import axios from 'axios';
import toast from 'react-hot-toast';

// Add/Edit Offer Form Component
const AddOfferForm = ({ 
    storeId,
    isVisible, 
    onClose, 
    onSubmit, 
    editingOffer = null,
    loading = false
  }) => {
    const [offerData, setOfferData] = useState({
      // Required fields
      image: null,
      title: '',
      description: '',
      discountType: 'percentage',
      category: '',
      startDate: '',
      duration: '24', // Duration in hours
      
      // Optional fields
      discountValue: '',
      originalPrice: '',
      offerPrice: '',
      isActive: true,
      storeId: storeId
    });
  
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
  
    const categories = [
      'Electronics',
      'Fashion', 
      'Home & Garden',
      'Sports',
      'Beauty',
      'Books',
      'Food & Beverages',
      'Travel',
      'Services',
      'Other'
    ];
  
    const durationOptions = [
      { value: '6', label: '6 Hours' },
      { value: '12', label: '12 Hours' },
      { value: '24', label: '1 Day' },
      { value: '48', label: '2 Days' },
      { value: '72', label: '3 Days' },
      { value: '96', label: '4 Days' },
      { value: '120', label: '5 Days' },
      { value: '144', label: '6 Days' },
      { value: '168', label: '7 Days' }
    ];
  
    // Calculate valid to date based on start date and duration
    const calculateValidTo = (startDate, durationHours) => {
      if (!startDate) return '';
      const start = new Date(startDate);
      const validTo = new Date(start.getTime() + (durationHours * 60 * 60 * 1000));
      return validTo.toISOString();
    };
  
    useEffect(() => {
      if (editingOffer) {
        // Calculate duration from existing dates if editing
        let calculatedDuration = '24';
        if (editingOffer.validFrom && editingOffer.validTo) {
          const fromDate = new Date(editingOffer.validFrom);
          const toDate = new Date(editingOffer.validTo);
          const diffHours = Math.round((toDate - fromDate) / (1000 * 60 * 60));
          const matchingOption = durationOptions.find(opt => opt.value === diffHours.toString());
          if (matchingOption) {
            calculatedDuration = matchingOption.value;
          }
        }
  
        setOfferData({
          image: null,
          title: editingOffer.title || '',
          description: editingOffer.description || '',
          discountType: editingOffer.discountType || 'percentage',
          category: editingOffer.category || '',
          startDate: editingOffer.validFrom ? new Date(editingOffer.validFrom).toISOString().slice(0, 16) : '',
          duration: calculatedDuration,
          discountValue: editingOffer.discountValue || '',
          originalPrice: editingOffer.originalPrice || '',
          offerPrice: editingOffer.offerPrice || '',
          isActive: editingOffer.isActive !== undefined ? editingOffer.isActive : true,
          storeId: storeId
        });
        
        if (editingOffer.image) {
          setImagePreview(editingOffer.image);
        }
      } else {
        // Reset form for new offer
        setOfferData({
          image: null,
          title: '',
          description: '',
          discountType: 'percentage',
          category: '',
          startDate: '',
          duration: '24',
          discountValue: '',
          originalPrice: '',
          offerPrice: '',
          isActive: true,
          storeId: storeId
        });
        setImagePreview(null);
      }
      setErrors({});
    }, [editingOffer, isVisible, storeId]);
  
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
          return;
        }
        
        if (!file.type.startsWith('image/')) {
          setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
          return;
        }
  
        setOfferData(prev => ({ ...prev, image: file }));
        
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
        
        setErrors(prev => ({ ...prev, image: '' }));
      }
    };
  
    const removeImage = () => {
      setOfferData(prev => ({ ...prev, image: null }));
      setImagePreview(null);
    };
  
    const validateForm = () => {
      const newErrors = {};
      
      // Required field validations
      if (!editingOffer && !offerData.image) {
        newErrors.image = 'Image is required';
      }
      if (!offerData.title.trim()) {
        newErrors.title = 'Title is required';
      }
      if (!offerData.description.trim()) {
        newErrors.description = 'Description is required';
      }
      if (!offerData.category) {
        newErrors.category = 'Category is required';
      }
      if (!offerData.startDate) {
        newErrors.startDate = 'Start date is required';
      }
      if (!offerData.duration) {
        newErrors.duration = 'Duration is required';
      }
  
      // Optional field validations
      if (offerData.discountValue && offerData.discountValue <= 0) {
        newErrors.discountValue = 'Discount value must be greater than 0';
      }
      if (offerData.discountType === 'percentage' && offerData.discountValue > 100) {
        newErrors.discountValue = 'Percentage discount cannot exceed 100%';
      }
      if (offerData.originalPrice && offerData.originalPrice <= 0) {
        newErrors.originalPrice = 'Original price must be greater than 0';
      }
      if (offerData.offerPrice && offerData.offerPrice <= 0) {
        newErrors.offerPrice = 'Offer price must be greater than 0';
      }
  
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = async () => {
      if (!validateForm()) return;
    
      setSubmitting(true); // Set local loading state
    
      try {
        // Calculate end date
        const validFrom = offerData.startDate;
        const validTo = calculateValidTo(offerData.startDate, parseInt(offerData.duration));
    
        const submissionData = {
          ...offerData,
          validFrom,
          validTo
        };
    
        if (onSubmit) {
          await onSubmit(submissionData); // Wait for the submission to complete
        }
        
        // Only close if submission was successful
        onClose();
      } catch (error) {
        console.error('Submission error:', error);
        setErrors(prev => ({ ...prev, submit: 'Failed to save offer. Please try again.' }));
      } finally {
        setSubmitting(false); // Reset local loading state
      }
    };
    
  
    const handleInputChange = (field, value) => {
      setOfferData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };
  
    if (!isVisible) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="bg-teal-600 text-white p-6 rounded-t-xl">
            <h2 className="text-xl font-bold">
              {editingOffer ? 'Edit Offer' : 'Add New Offer'}
            </h2>
            <p className="text-teal-100 text-sm mt-1">
              Fields marked with * are required
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}
  
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offer Image *
              </label>
              <div className="flex items-center space-x-4">
                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  errors.image ? 'border-red-300' : 'border-gray-300'
                }`}>
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="h-32 w-32 object-cover rounded-lg mx-auto"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="h-32 w-32 mx-auto flex flex-col items-center justify-center">
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Upload Image</p>
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer bg-teal-50 text-teal-700 px-4 py-2 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors"
                  >
                    Choose Image
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Max size: 5MB</p>
                </div>
              </div>
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            </div>
  
            {/* Basic Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              
              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={offerData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter offer title"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>
  
              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={offerData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows="3"
                  placeholder="Enter offer description"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
  
              {/* Category, Start Date and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={offerData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={offerData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offer Duration *
                  </label>
                  <select
                    value={offerData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {durationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
                </div>
              </div>
  
            
            </div>
  
            {/* Discount & Pricing */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-600 mb-4">Discount & Pricing (Optional)</h3>
                {/* Discount Type */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type *
                </label>
                <select
                  value={offerData.discountType}
                  onChange={(e) => handleInputChange('discountType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
             
  
              {/* Pricing Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price
                  </label>
                  <input
                    type="Text"
                    value={offerData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.originalPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="₹"
                    min="0"
                  />
                  {errors.originalPrice && <p className="text-red-500 text-xs mt-1">{errors.originalPrice}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Offer Price
                  </label>
                  <input
                    type="Text"
                    value={offerData.offerPrice}
                    onChange={(e) => handleInputChange('offerPrice', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.offerPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="₹"
                    min="0"
                  />
                  {errors.offerPrice && <p className="text-red-500 text-xs mt-1">{errors.offerPrice}</p>}
                </div>
              </div>
               {/* Discount Value */}
               <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value
                </label>
                <input
                  type="text"
                  value={offerData.discountValue}
                  onChange={(e) => handleInputChange('discountValue', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.discountValue ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={offerData.discountType === 'percentage' ? 'Enter %' : 'Enter amount'}
                  min="0"
                  max={offerData.discountType === 'percentage' ? "100" : undefined}
                />
                {errors.discountValue && <p className="text-red-500 text-xs mt-1">{errors.discountValue}</p>}
              </div>
  
          
             
            </div>
  
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
  onClick={handleSubmit}
  disabled={submitting} // Use local submitting state instead of loading prop
  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50 w-full"
>
  {submitting ? ( // Use local submitting state
    <>
      <svg
        className="w-4 h-4 animate-spin text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      Processing...
    </>
  ) : (
    editingOffer ? "Update Offer" : "Add Offer"
  )}
</button>


            </div>
          </div>
        </div>
      </div>
    );
  };
// Offer View Modal Component
const OfferViewModal = ({ offer, isVisible, onClose }) => {
  if (!isVisible || !offer) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = new Date(offer.validUntil) < new Date();
  const isUpcoming = new Date(offer.validFrom) > new Date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="relative max-w-2xl w-full bg-white rounded-xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-colors z-10"
        >
          <X size={16} />
        </button>
        
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
          <div className="flex items-start gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              {offer.discountType === 'percentage' ? (
                <Percent size={24} />
              ) : (
                <DollarSign size={24} />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
              <p className="text-teal-100 mb-4">{offer.description}</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20">
                {offer.discountType === 'percentage' 
                  ? `${offer.discountValue}% OFF` 
                  : `₹${offer.discountValue} OFF`
                }
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              !offer.isActive ? 'bg-gray-500' :
              isExpired ? 'bg-red-500' :
              isUpcoming ? 'bg-yellow-500' : 'bg-green-500'
            }`}>
              {!offer.isActive ? 'Inactive' :
               isExpired ? 'Expired' :
               isUpcoming ? 'Upcoming' : 'Active'}
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Validity Period */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar size={18} />
              Validity Period
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Valid From</p>
                <p className="font-medium">{formatDate(offer.validFrom)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Valid Until</p>
                <p className="font-medium">{formatDate(offer.validUntil)}</p>
              </div>
            </div>
          </div>

          {/* Purchase Conditions */}
          {(offer.minPurchaseAmount || offer.maxDiscountAmount) && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Purchase Conditions</h4>
              <div className="space-y-2">
                {offer.minPurchaseAmount && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Minimum Purchase:</span> ₹{offer.minPurchaseAmount}
                  </p>
                )}
                {offer.maxDiscountAmount && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Maximum Discount:</span> ₹{offer.maxDiscountAmount}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          {offer.termsAndConditions && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Terms & Conditions</h4>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {offer.termsAndConditions}
              </p>
            </div>
          )}

          {/* Created Date */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Created on {formatDate(offer.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Offer Management Component
const OfferManagement = ({ storeId }) => {
  const { user, token } = useAuth() || {};
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [viewingOffer, setViewingOffer] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive, expired

  // Fetch offers
  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!storeId) {
        throw new Error('Store details not available');
      }

  
      const response = await axios.get(`${SERVER_URL}/offers/store/${storeId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

     setOffers(response.data.data || []);

    } catch (err) {
      console.error('Error fetching offers:', err);
      setError('Failed to load offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle submit (add/edit offer)
  const handleSubmitOffer = async (offerData) => {
    // Remove setLoading(true) from here since we're handling it in the form
    
    try {
      const formData = new FormData();
  
      // Append all fields
      formData.append("title", offerData.title);
      formData.append("description", offerData.description);
      formData.append("discountType", offerData.discountType);
      formData.append("category", offerData.category);
      formData.append("startDate", offerData.startDate);
      formData.append("duration", offerData.duration);
      formData.append("discountValue", offerData.discountValue);
      formData.append("originalPrice", offerData.originalPrice);
      formData.append("offerPrice", offerData.offerPrice);
      formData.append("isActive", offerData.isActive);
      formData.append("storeId", offerData.storeId);
      formData.append("validFrom", offerData.validFrom);
      formData.append("validTo", offerData.validTo);
  
      // Append image only if it's present
      if (offerData.image) {
        formData.append("image", offerData.image);
      }
  
      const offerId = editingOffer?._id;
      const url = editingOffer
        ? `${SERVER_URL}/offers/${offerId}`
        : `${SERVER_URL}/offers`;
  
      const method = editingOffer ? "put" : "post";
  
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      toast.success("Offer saved successfully!");
      await fetchOffers();
      setEditingOffer(null); // Reset editing state
      
      // Return success to indicate completion
      return { success: true };
      
    } catch (err) {
      console.error("Error saving offer:", err);
      toast.error("Failed to save offer");
      
      // Throw error to be caught by form component
      throw new Error("Failed to save offer. Please try again.");
    }
  };
  

  // Handle delete offer
  const handleDeleteOffer = async (offerId) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      setLoading(true);
      
      try {
        const response = await axios.delete(`${SERVER_URL}/offers/${offerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // Remove from local state
        setOffers(prev => prev.filter(offer => offer._id !== offerId));
        
      } catch (err) {
        console.error('Error deleting offer:', err);
        setError('Failed to delete offer. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle edit offer
  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setShowAddForm(true);
  };

  // Handle view offer
  const handleViewOffer = (offer) => {
    setViewingOffer(offer);
  };

  // Filter offers based on search term and status
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const now = new Date();
    const isExpired = new Date(offer.validUntil) < now;
    const isUpcoming = new Date(offer.validFrom) > now;
    const isCurrentlyActive = offer.isActive && !isExpired && !isUpcoming;

    switch (filterStatus) {
      case 'active':
        return isCurrentlyActive;
      case 'inactive':
        return !offer.isActive;
      case 'expired':
        return isExpired;
      default:
        return true;
    }
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const getOfferStatus = (offer) => {
    const now = new Date();
    const isExpired = new Date(offer.validUntil) < now;
    const isUpcoming = new Date(offer.validFrom) > now;

    if (!offer.isActive) return { text: 'Inactive', color: 'bg-gray-500' };
    if (isExpired) return { text: 'Expired', color: 'bg-red-500' };
    if (isUpcoming) return { text: 'Upcoming', color: 'bg-yellow-500' };
    return { text: 'Active', color: 'bg-green-500' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-teal-600 text-white p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Offers & Discounts</h1>
            <p className="text-teal-100">({offers.length} offers)</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-teal-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Offer
          </button>
        </div>
      </div>


      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading && offers.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={32} className="animate-spin text-teal-600" />
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <OfferIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'No offers match your search criteria' 
                : 'Create your first offer to attract more customers'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Add Offer
              </button>
            )}
          </div>
        ) : (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredOffers.map((offer) => {
              const status = getOfferStatus(offer);
              return (
                <div key={offer._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                 
          
                  {/* Offer Info Top */}
                  <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {offer.discountType === 'percentage' ? (
                          <Percent size={24} />
                        ) : (
                          <IndianRupee size={24} />
                        )}
                        <div>
                          <h3 className="font-bold text-lg">{offer.title}</h3>
                          <p className="text-teal-100 text-sm">
                            {offer.discountType === 'percent' 
                              ? `${offer.discountValue}% OFF` 
                              : `₹${offer.discountValue} OFF`}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                  </div>
          
                  {/* Image */}
                  <img src={offer.image} alt={offer.title} className="w-full h-48 object-cover" />
          
                  {/* Details */}
                  <div className="p-4 space-y-2">
                    <p className="text-gray-700 line-clamp-2">{offer.description}</p>
          
                    {/* Prices */}
                    <div className="flex gap-4 text-sm text-gray-700">
                      <span className="line-through text-red-500">₹{offer.originalPrice}</span>
                      <span className="font-semibold text-green-600">₹{offer.offerPrice}</span>
                    </div>
          
                    {/* Dates */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={14} className="mr-2" />
                      {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validTo).toLocaleDateString()}
                    </div>
          
                    {/* Store Contact */}
                    <div className="text-xs text-gray-500">
                      <p>📞 {offer.storeId?.phone}</p>
                    </div>
          
                    {/* Category + Tags */}
                    <div className="text-xs text-gray-500">
                      <p>🗂️ Category: {offer.category}</p>
                      {offer.tags?.length > 0 && (
                        <p>
                          🏷️ Tags: {offer.tags.join(', ')}
                        </p>
                      )}
                    </div>
          
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => handleViewOffer(offer)}
                        className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm"
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditOffer(offer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
        )}
      </div>

      {/* Add/Edit Offer Form Modal */}
      <AddOfferForm
  storeId={storeId}
  isVisible={showAddForm}
  onClose={() => {
    setShowAddForm(false);
    setEditingOffer(null);
  }}
  onSubmit={handleSubmitOffer}
  editingOffer={editingOffer}
  // Remove loading prop - not needed anymore
/>

      {/* View Offer Modal */}
      <OfferViewModal
        offer={viewingOffer}
        isVisible={!!viewingOffer}
        onClose={() => setViewingOffer(null)}
      />
    </div>
  );
};

export default OfferManagement;
