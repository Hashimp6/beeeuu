import React, { useState, useEffect } from 'react';
import { Camera, X, ChevronDown, MapPin, Check, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { SERVER_URL } from '../Config';

const NewStore = () => {
  // Mock route params - in real app, you'd get these from router
  const editMode = false;
  const storeData = {};

  // Form state - Initialize with existing data if in edit mode
  const [storeName, setStoreName] = useState(storeData.storeName || storeData.name || '');
  const [description, setDescription] = useState(storeData.description || '');
  const [imageUri, setImageUri] = useState(storeData.profileImage || '');
  const [imageFile, setImageFile] = useState(null);
  const [place, setPlace] = useState(storeData.place || '');
  const [phone, setPhone] = useState(storeData.phone || '');
  const [whatsapp, setWhatsapp] = useState(storeData.socialMedia?.whatsapp || '');
  const [instagram, setInstagram] = useState(storeData.socialMedia?.instagram || '');
  const [facebook, setFacebook] = useState(storeData.socialMedia?.facebook || '');
  const [website, setWebsite] = useState(storeData.socialMedia?.website || '');
  const [category, setCategory] = useState(storeData.category || '');
  const [storeNameAvailable, setStoreNameAvailable] = useState(null);
  const [checkingName, setCheckingName] = useState(false);

  // Validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // UI state
  const [loading, setLoading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const categories = [
    'Restaurant', 
    'Retail', 
    'Electronics', 
    'Fashion', 
    'Grocery', 
    'Services', 
    'Beauty', 
    'Health', 
    'Home & Decor',
    'Books & Stationery',
    'Sports & Fitness',
    'Entertainment',
    'Other'
  ];

  
  // Location API configuration
  const LOCATION_API_KEY = 'AIzaSyAWdpzsOIeDYSG76s3OncbRHmm5pBwiG24';
  const LOCATION_API_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

  // Validation functions
  const validateStoreName = (name) => {
    if (!name || name.trim().length === 0) {
      return 'Store name is required';
    }
    if (name.trim().length < 3) {
      return 'Store name must be at least 3 characters long';
    }
    if (name.trim().length > 50) {
      return 'Store name must be less than 50 characters';
    }
    if (!/^[a-zA-Z0-9\s&.-]+$/.test(name)) {
      return 'Store name can only contain letters, numbers, spaces, &, ., and -';
    }
    return null;
  };

  const validatePhone = (phoneNumber) => {
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      return 'Phone number is required';
    }
    
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      return 'Phone number must be at least 10 digits';
    }
    if (cleanPhone.length > 15) {
      return 'Phone number must be less than 15 digits';
    }
    
    const indianPhonePattern = /^[6-9]\d{9}$|^[+]?91[6-9]\d{9}$/;
    if (!indianPhonePattern.test(cleanPhone) && cleanPhone.length === 10) {
      return 'Please enter a valid Indian phone number';
    }
    
    return null;
  };

  const validateWhatsApp = (whatsappNumber) => {
    if (!whatsappNumber || whatsappNumber.trim().length === 0) {
      return null;
    }
    
    const cleanWhatsApp = whatsappNumber.replace(/\D/g, '');
    
    if (cleanWhatsApp.length < 10) {
      return 'WhatsApp number must be at least 10 digits';
    }
    if (cleanWhatsApp.length > 15) {
      return 'WhatsApp number must be less than 15 digits';
    }
    
    return null;
  };

  const validateURL = (url, fieldName) => {
    if (!url || url.trim().length === 0) {
      return null;
    }
    
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      return `Please enter a valid ${fieldName} URL`;
    }
    
    return null;
  };

  const validateInstagram = (url) => {
    if (!url || url.trim().length === 0) {
      return null;
    }
    
    const instagramPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/;
    if (!instagramPattern.test(url)) {
      return 'Please enter a valid Instagram URL (e.g., https://instagram.com/username)';
    }
    
    return null;
  };

  const validateFacebook = (url) => {
    if (!url || url.trim().length === 0) {
      return null;
    }
    
    const facebookPattern = /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9._]+\/?$/;
    if (!facebookPattern.test(url)) {
      return 'Please enter a valid Facebook URL (e.g., https://facebook.com/page)';
    }
    
    return null;
  };

  const validateDescription = (desc) => {
    if (desc && desc.length > 500) {
      return 'Description must be less than 500 characters';
    }
    return null;
  };

  const validatePlace = (location) => {
    if (location && location.length > 100) {
      return 'Location must be less than 100 characters';
    }
    return null;
  };

  const validateField = (fieldName, value) => {
    let error = null;
    
    switch (fieldName) {
      case 'storeName':
        error = validateStoreName(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'whatsapp':
        error = validateWhatsApp(value);
        break;
      case 'instagram':
        error = validateInstagram(value);
        break;
      case 'facebook':
        error = validateFacebook(value);
        break;
      case 'website':
        error = validateURL(value, 'website');
        break;
      case 'description':
        error = validateDescription(value);
        break;
      case 'place':
        error = validatePlace(value);
        break;
      case 'category':
        if (!value) {
          error = 'Please select a category';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleFieldChange = (fieldName, value) => {
    const setters = {
      storeName: setStoreName,
      phone: setPhone,
      whatsapp: setWhatsapp,
      instagram: setInstagram,
      facebook: setFacebook,
      website: setWebsite,
      description: setDescription,
      place: setPlace,
    };

    if (setters[fieldName]) {
      setters[fieldName](value);
    }

    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleFieldBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  // Store name availability check
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (storeName.trim().length > 2 && !editMode) {
        checkStoreNameAvailability();
      } else {
        setStoreNameAvailable(null);
        setCheckingName(false);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [storeName, editMode]);

  // Location suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (place.length > 2) {
        fetchLocationSuggestions();
      } else {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [place]);

 
  const fetchLocationSuggestions = async () => {
    if (!window.google) return;
    
    const service = new window.google.maps.places.AutocompleteService();
    const request = {
      input: place,
      types: ['geocode']
    };
    
    service.getPlacePredictions(request, (predictions, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        setLocationSuggestions(predictions);
        setShowSuggestions(true);
      }
    });
  };
  const selectLocation = (description) => {
    setPlace(description);
    setShowSuggestions(false);
    const error = validateField('place', description);
    setErrors(prev => ({ ...prev, place: error }));
  };

  const selectCategory = (selectedCategory) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
    setErrors(prev => ({ ...prev, category: null }));
  };

  const checkStoreNameAvailability = async () => {
    setCheckingName(true);
    setStoreNameAvailable(null);
    
    try {
      const response = await axios.get(`${SERVER_URL}/search/checkName`, {
        params: { name: storeName.trim() }
      });
      
      setStoreNameAvailable(response.data.available);
    } catch (error) {
      console.error('Error checking store name:', error);
      setStoreNameAvailable(null);
    } finally {
      setCheckingName(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImageUri(e.target.result);
        };
        reader.readAsDataURL(file);
        setErrors(prev => ({ ...prev, image: null }));
      } else {
        alert('Please select a valid image file');
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    newErrors.storeName = validateStoreName(storeName);
    newErrors.phone = validatePhone(phone);
    newErrors.whatsapp = validateWhatsApp(whatsapp);
    newErrors.instagram = validateInstagram(instagram);
    newErrors.facebook = validateFacebook(facebook);
    newErrors.website = validateURL(website, 'website');
    newErrors.description = validateDescription(description);
    newErrors.place = validatePlace(place);
    
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!imageUri) {
      newErrors.image = 'Please upload a store logo';
    }
    
    if (!editMode && storeNameAvailable === false) {
      newErrors.storeName = 'Store name is already taken. Please choose a different name.';
    }
    
    const filteredErrors = Object.keys(newErrors).reduce((acc, key) => {
      if (newErrors[key]) {
        acc[key] = newErrors[key];
      }
      return acc;
    }, {});
    
    setErrors(filteredErrors);
    
    setTouched({
      storeName: true,
      phone: true,
      whatsapp: true,
      instagram: true,
      facebook: true,
      website: true,
      description: true,
      place: true,
      category: true,
      image: true
    });
    
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fill all required fields correctly before submitting');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      if (imageFile) {
        formData.append('profileImage', imageFile);
      }

      formData.append('storeName', storeName);
      formData.append('description', description);
      formData.append('place', place);
      formData.append('phone', phone);
      formData.append('category', category);

      const socialMedia = {
        whatsapp: whatsapp || "",
        instagram: instagram || "",
        facebook: facebook || "",
        website: website || "",
      };

      formData.append('socialMedia', JSON.stringify(socialMedia));

      const storeId = storeData._id;
      const endpoint = editMode 
        ? `${SERVER_URL}/stores/${storeId}` 
        : `${SERVER_URL}/stores/register`;
      
      const method = editMode ? 'put' : 'post';

      const response = await axios[method](endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data) {
        alert(editMode ? 'Store updated successfully!' : 'Store registered successfully!');
        // In a real app, you'd navigate to a success page or profile
        console.log('Success:', response.data);
      }

    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      alert(`Failed to ${editMode ? 'update' : 'register'} store`);
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const hasError = errors[fieldName] && touched[fieldName];
    const isValid = !errors[fieldName] && touched[fieldName] && 
                   ((fieldName === 'storeName' && storeName.trim().length > 0) ||
                    (fieldName === 'phone' && phone.trim().length > 0) ||
                    (fieldName === 'whatsapp' && whatsapp.trim().length > 0) ||
                    (fieldName === 'instagram' && instagram.trim().length > 0) ||
                    (fieldName === 'facebook' && facebook.trim().length > 0) ||
                    (fieldName === 'website' && website.trim().length > 0) ||
                    (fieldName === 'description' && description.trim().length > 0) ||
                    (fieldName === 'place' && place.trim().length > 0));

    let className = 'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors';
    
    if (hasError) {
      className += ' border-red-500 bg-red-50';
    } else if (isValid) {
      className += ' border-green-500 bg-green-50';
    } else {
      className += ' border-gray-300 bg-gray-50';
    }

    return className;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-6 px-4 rounded-b-lg">
        <h1 className="text-2xl font-bold text-center">
          {editMode ? 'Edit Your Store' : 'Register Your Store'}
        </h1>
        <p className="text-gray-300 text-center mt-2">
          {editMode ? 'Update your store details' : 'Fill in the details to start selling'}
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="text-center">
            <div className="relative inline-block">
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="imageUpload"
                className="cursor-pointer block w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {imageUri ? (
                  <img src={imageUri} alt="Store logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <Camera className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Upload</span>
                  </div>
                )}
              </label>
            </div>
            {imageUri && (
              <p className="text-green-600 text-sm mt-2">
                {editMode && !imageFile ? 'Current image' : 'Image selected'}
              </p>
            )}
            {errors.image && touched.image && (
              <p className="text-red-500 text-sm mt-2">{errors.image}</p>
            )}
          </div>

          {/* Store Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Store Information</h2>
            
            {/* Store Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name*
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => handleFieldChange('storeName', e.target.value)}
                  onBlur={() => handleFieldBlur('storeName')}
                  placeholder="Enter your store name"
                  className={getInputClassName('storeName')}
                />
                {!editMode && checkingName && (
                  <Loader2 className="absolute right-3 top-3 w-5 h-5 text-gray-400 animate-spin" />
                )}
                {!editMode && !checkingName && storeNameAvailable === true && (
                  <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                )}
                {!editMode && !checkingName && storeNameAvailable === false && (
                  <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
                )}
              </div>
              {errors.storeName && touched.storeName && (
                <p className="text-red-500 text-sm mt-1">{errors.storeName}</p>
              )}
              {!editMode && storeNameAvailable === true && (
                <p className="text-green-600 text-sm mt-1">Store name is available</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                onBlur={() => handleFieldBlur('description')}
                placeholder="Describe your store and what you sell"
                maxLength={500}
                rows={4}
                className={getInputClassName('description')}
              />
              <p className="text-sm text-gray-500 mt-1">{description.length}/500</p>
              {errors.description && touched.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category*
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className={`w-full px-4 py-3 border rounded-lg text-left flex justify-between items-center ${
                  errors.category && touched.category ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                } hover:bg-gray-100 transition-colors`}
              >
                <span className={category ? 'text-black' : 'text-gray-500'}>
                  {category || "Select a category"}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
              {errors.category && touched.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Location */}
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={place}
                onChange={(e) => handleFieldChange('place', e.target.value)}
                onBlur={() => handleFieldBlur('place')}
                placeholder="Enter store location"
                maxLength={100}
                className={getInputClassName('place')}
              />
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {locationSuggestions.map((item) => (
                    <button
                      key={item.place_id}
                      type="button"
                      onClick={() => selectLocation(item.description)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{item.description}</span>
                    </button>
                  ))}
                </div>
              )}
              {errors.place && touched.place && (
                <p className="text-red-500 text-sm mt-1">{errors.place}</p>
              )}
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number*
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                onBlur={() => handleFieldBlur('phone')}
                placeholder="Enter 10-digit phone number"
                maxLength={15}
                className={getInputClassName('phone')}
              />
              {errors.phone && touched.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Social Media</h2>
            
            {/* WhatsApp */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => handleFieldChange('whatsapp', e.target.value)}
                onBlur={() => handleFieldBlur('whatsapp')}
                placeholder="WhatsApp number (optional)"
                maxLength={15}
                className={getInputClassName('whatsapp')}
              />
              {errors.whatsapp && touched.whatsapp && (
                <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>
              )}
            </div>

            {/* Instagram */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={instagram}
                onChange={(e) => handleFieldChange('instagram', e.target.value)}
                onBlur={() => handleFieldBlur('instagram')}
                placeholder="https://instagram.com/username"
                className={getInputClassName('instagram')}
              />
              {errors.instagram && touched.instagram && (
                <p className="text-red-500 text-sm mt-1">{errors.instagram}</p>
              )}
            </div>

            {/* Facebook */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={facebook}
                onChange={(e) => handleFieldChange('facebook', e.target.value)}
                onBlur={() => handleFieldBlur('facebook')}
                placeholder="https://facebook.com/page"
                className={getInputClassName('facebook')}
              />
              {errors.facebook && touched.facebook && (
                <p className="text-red-500 text-sm mt-1">{errors.facebook}</p>
              )}
            </div>

            {/* Website */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => handleFieldChange('website', e.target.value)}
                onBlur={() => handleFieldBlur('website')}
                placeholder="https://www.yourwebsite.com"
                className={getInputClassName('website')}
              />
              {errors.website && touched.website && (
                <p className="text-red-500 text-sm mt-1">{errors.website}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>{editMode ? 'Update Store' : 'Register Store'}</span>
            )}
          </button>
        </form>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-lg max-h-96 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Select Category</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-80">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => selectCategory(item)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 flex justify-between items-center ${
                    category === item ? 'bg-black text-white' : ''
                  }`}
                >
                  <span>{item}</span>
                  {category === item && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewStore;