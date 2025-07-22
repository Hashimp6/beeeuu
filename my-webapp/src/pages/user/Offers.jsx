import React, { useState, useEffect, useRef } from 'react';
import { Heart, MapPin, Clock, Share2, Bookmark, ChevronUp, ChevronDown, Star, Phone, Eye, Zap, X, Tag, Search } from 'lucide-react';
import { useAuth } from '../../context/UserContext';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { SERVER_URL } from '../../Config';

const OfferReelPage = () => {
  const { location, user } = useAuth();
  
  // Add null checks for location
  const coords = location?.location?.coordinates || null;
  console.log("loc", coords);
  
  const [currentOffer, setCurrentOffer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [locationError, setLocationError] = useState(false);
  const containerRef = useRef(null);
  
  const [offers, setOffers] = useState([{
    "location": {
        "type": "Point",
        "coordinates": [76.8604367, 8.8977417]
    },
    "_id": "687caa0a4efb59579514dad1",
    "storeId": {
        "_id": "682cdf764acd2732dbbe90d7",
        "storeName": "Dianaas Henna",
        "profileImage": "https://res.cloudinary.com/dhed9kuow/image/upload/v1752042211/store_profiles/xthuo1cbj2vi0sq9jmd2.png",
        "place": "Ayoor, Kerala, India",
        "phone": "6485970539",
        "averageRating": 4.2,
        "rating": 4.2,
        "address": "123 Main Street, Ayoor"
    },
    "title": "Big Sale on Burger",
    "description": "Up to 50% off branded shoes and delicious burgers",
    "image": "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/chicken-food-ads-design-template-41c5a162667a95621944cc49edf5c058_screen.jpg?ts=1695355301",
    "discountType": "percent",
    "discountValue": "50",
    "validFrom": "2025-07-19T00:00:00.000Z",
    "validTo": "2025-07-30T00:00:00.000Z",
    "category": "Food",
    "tags": ["food", "burger", "offer"],
    "isPremium": false,
    "isActive": true,
    "originalPrice": 2000,
    "offerPrice": 1000,
    "place": "Ayoor, Kerala, India",
    "distance": 250,
    "createdAt": "2025-07-20T08:34:18.916Z",
    "updatedAt": "2025-07-20T08:34:18.916Z",
    "__v": 0
  }]);
  
  const [filteredOffers, setFilteredOffers] = useState(offers);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchNearbyOffers = async (lat, lng, category = '') => {
    const { type, id } = getUserIdentifier();
    try {
      const response = await axios.get(`${SERVER_URL}/offers/nearby`, {
        params: {
          lat,
          lng,
          category,
          [type === 'temp' ? 'tempUserId' : 'userId']: id
        },
      });
  
      if (response.data.success && response.data.data) {
        console.log("offers array:", response.data.data);
        return response.data.data;
      } else {
        console.warn('No offers found:', response.data.message);
        return [];
      }
    } catch (err) {
      console.error('Error fetching nearby offers:', err);
      return [];
    }
  };

  const getUserIdentifier = () => {
    if (user && user._id) {
      return { type: 'user', id: user._id };
    }

    let tempId = localStorage.getItem("tempUserId");
    if (!tempId) {
      tempId = uuidv4();
      localStorage.setItem("tempUserId", tempId);
    }

    return { type: 'temp', id: tempId };
  };

  // Function to request location permission for guest users
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Create a mock location object similar to what useAuth provides
          const mockLocation = {
            location: {
              coordinates: [longitude, latitude]
            }
          };
          // You might want to update this in your context or handle it locally
          fetchOffersWithCoords(latitude, longitude);
          setLocationError(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError(true);
          // Use default location or show error
        }
      );
    } else {
      setLocationError(true);
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const fetchOffersWithCoords = async (lat, lng) => {
    const nearbyOffers = await fetchNearbyOffers(lat, lng, selectedCategory !== 'all' ? selectedCategory : '');
    
    if (nearbyOffers && nearbyOffers.length > 0) {
      setOffers(nearbyOffers);
      setFilteredOffers(nearbyOffers);
      setCurrentIndex(0);
    } else {
      setOffers([]);
      setFilteredOffers([]);
    }
  };

  useEffect(() => {
    const fetchOffers = async () => {
      // Check if we have coordinates from the auth context
      if (coords && coords.length === 2) {
        const [lng, lat] = coords;
        await fetchOffersWithCoords(lat, lng);
      } else {
        // For guest users or when location is not available, request permission
        requestLocationPermission();
      }
    };

    fetchOffers();
  }, [coords, selectedCategory]);

  const categories = [
    { id: 'all', name: 'All Categories', color: 'from-orange-500 to-red-500' },
    { id: 'Food', name: 'Food & Dining', color: 'from-yellow-500 to-orange-500' },
    { id: 'Fashion', name: 'Fashion', color: 'from-purple-500 to-pink-500' },
    { id: 'Electronics', name: 'Electronics', color: 'from-blue-500 to-cyan-500' },
    { id: 'Beauty', name: 'Beauty & Wellness', color: 'from-pink-500 to-rose-500' },
    { id: 'Automotive', name: 'Automotive', color: 'from-gray-500 to-slate-600' },
    { id: 'Home', name: 'Home & Garden', color: 'from-green-500 to-emerald-500' },
    { id: 'Sports', name: 'Sports & Fitness', color: 'from-teal-500 to-green-500' },
    { id: 'Entertainment', name: 'Entertainment', color: 'from-indigo-500 to-purple-500' }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCurrentOffer(filteredOffers[currentIndex]);
      setLoading(false);
    }, 200);
  }, [currentIndex, filteredOffers]);

  useEffect(() => {
    setFilteredOffers(offers);
  }, [offers]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    console.log('Selected category for API:', categoryId);
  };

  // Location Permission Component for Guest Users
  const LocationPermissionRequest = () => (
    <div className="flex h-screen" style={{ height: 'calc(100vh - 80px)' }}>
      <DesktopFilters />
      <div className="flex-1 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 bg-teal-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
            <MapPin className="w-12 h-12 text-teal-400" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-4">Location Access Required</h2>
          <p className="text-gray-400 mb-6 leading-relaxed">
            To show you the best nearby offers, we need access to your location. 
            Your location data is only used to find relevant deals around you.
          </p>
          <button
            onClick={requestLocationPermission}
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all mb-4"
          >
            Allow Location Access
          </button>
          <p className="text-gray-500 text-sm">
            You can change this permission anytime in your browser settings
          </p>
        </div>
      </div>
    </div>
  );

  // Desktop Filter Sidebar Component
  const DesktopFilters = () => (
    <div className="hidden lg:block w-80 bg-gradient-to-b from-gray-900 to-black border-r border-gray-800 p-6 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-bold">Categories</h2>
      </div>

      <div className="space-y-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`w-full p-3 rounded-xl text-left transition-all transform hover:scale-105 ${
              selectedCategory === category.id
                ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="font-medium">{category.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Mobile Filter Dropdown
  const MobileFilterDropdown = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const selectedName = categories.find((cat) => cat.id === selectedCategory)?.name || 'All Categories';
  
    return (
      <div className="lg:hidden absolute top-4 right-4 z-30">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2"
        >
          {selectedName}
          {showDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
  
        {showDropdown && (
          <div className="mt-2 w-64 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg p-3 absolute right-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  handleCategoryChange(category.id);
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium mb-1 ${
                  selectedCategory === category.id
                    ? 'bg-teal-500 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Show location permission request if no coordinates available
  if (locationError || (!coords && !loading)) {
    return <LocationPermissionRequest />;
  }

  const handleSwipe = (direction) => {
    if (showDetails || showImagePreview) return;
    
    if (direction === 'up') {
      loadNextOffer();
    } else if (direction === 'down') {
      loadPreviousOffer();
    }
  };

  const handleTouchStart = (e) => {
    if (showDetails || showImagePreview) return;
    const touch = e.touches[0] || e.targetTouches[0];
    setTouchStart(touch.clientY);
    setTouchEnd(0);
  };

  const handleTouchMove = (e) => {
    if (showDetails || showImagePreview) return;
    const touch = e.touches[0] || e.targetTouches[0];
    setTouchEnd(touch.clientY);
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    if (showDetails || showImagePreview) return;
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 30;
    const isDownSwipe = distance < -30;

    if (isUpSwipe && !loading) {
      handleSwipe('up');
    }
    if (isDownSwipe && !loading) {
      handleSwipe('down');
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleWheel = (e) => {
    if (showDetails || showImagePreview) return;
    e.preventDefault();
    if (loading) return;
    
    if (e.deltaY > 0) {
      handleSwipe('up');
    } else {
      handleSwipe('down');
    }
  };

  const loadNextOffer = () => {
    if (loading || filteredOffers.length === 0) return;
    setLoading(true);
    setTimeout(() => {
      const nextIndex = (currentIndex + 1) % filteredOffers.length;
      setCurrentIndex(nextIndex);
      setLoading(false);
    }, 300);
  };

  const loadPreviousOffer = () => {
    if (loading || filteredOffers.length === 0) return;
    setLoading(true);
    setTimeout(() => {
      const prevIndex = currentIndex === 0 ? filteredOffers.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      setLoading(false);
    }, 300);
  };

  const formatTimeLeft = (validTo) => {
    const now = new Date();
    const endDate = new Date(validTo);
    const diff = endDate - now;
    
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getDiscountDisplay = (discountType, discountValue) => {
    switch(discountType) {
      case 'percent':
        return `${discountValue}% OFF`;
      case 'flat':
        return `₹${discountValue} OFF`;
      case 'freebie':
        return discountValue === "100" ? "BOGO" : `${discountValue}% OFF`;
      case 'cashback':
        return `₹${discountValue} CASHBACK`;
      default:
        return `${discountValue}% OFF`;
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <Zap className="absolute inset-0 m-auto w-6 h-6 text-teal-400 animate-pulse" />
        </div>
      </div>
    );
  }

  if (filteredOffers.length === 0) {
    return (
      <div className="flex h-screen" style={{ height: 'calc(100vh - 80px)' }}>
        <DesktopFilters />
        <div className="flex-1 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">No offers found</h2>
            <p className="text-gray-400 mb-6">Try selecting a different category</p>
            <button
              onClick={() => handleCategoryChange('all')}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Show All Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOffer) return null;

  // Full Screen Image Preview
  if (showImagePreview) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <button 
          className="absolute top-6 right-6 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm z-10"
          onClick={() => setShowImagePreview(false)}
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <img 
          src={currentOffer.image} 
          alt={currentOffer.title}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  // Details Modal
  if (showDetails) {
    return (
      <div className="h-screen bg-gradient-to-b from-gray-900 to-black relative overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="relative z-10 h-full flex flex-col">
          <div className="p-4 pt-6 flex items-center justify-between">
            <h2 className="text-white text-xl font-bold">Offer Details</h2>
            <button 
              onClick={() => setShowDetails(false)}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <div className="relative mb-6">
              <img 
                src={currentOffer.image} 
                alt={currentOffer.title}
                className="w-full h-48 object-cover rounded-2xl"
              />
              <button
                onClick={() => setShowImagePreview(true)}
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all"
              >
                <Eye className="w-5 h-5 text-white" />
              </button>
              
              {currentOffer.isPremium && (
                <div className="absolute top-4 left-4">
                  <div className="bg-gradient-to-r from-teal-400 to-teal-600 px-3 py-1 rounded-full">
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4 text-white" />
                      <span className="text-white text-sm font-bold">PREMIUM</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 mb-6">
              <img 
                src={currentOffer.storeId.profileImage} 
                alt={currentOffer.storeId.storeName}
                className="w-14 h-14 rounded-full border-2 border-teal-400"
              />
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl">{currentOffer.storeId.storeName}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm font-medium">{currentOffer.storeId.rating}</span>
                  </div>
                  <span className="text-gray-300 text-sm">• {currentOffer.storeId.place}</span>
                </div>
              </div>
            </div>

            <h1 className="text-white text-2xl font-bold mb-4 leading-tight">
              {currentOffer.title}
            </h1>

            <p className="text-gray-200 text-base mb-6 leading-relaxed">
              {currentOffer.description}
            </p>

            <div className="bg-gradient-to-r from-teal-500/20 to-teal-600/20 backdrop-blur-sm border border-teal-500/30 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400 text-lg line-through">₹{currentOffer.originalPrice}</span>
                    <span className="text-white text-3xl font-bold">₹{currentOffer.offerPrice}</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-2">
                    <Clock className="w-4 h-4 text-teal-400" />
                    <span className="text-teal-300 text-sm font-medium">{formatTimeLeft(currentOffer.validTo)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-teal-400 text-3xl font-bold">{getDiscountDisplay(currentOffer.discountType, currentOffer.discountValue)}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 mb-6">
              <h4 className="text-white font-semibold text-lg mb-4">Store Information</h4>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-teal-400 mt-0.5" />
                  <span className="text-gray-200 flex-1">{currentOffer.storeId.address}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-teal-400" />
                  <span className="text-gray-200">{currentOffer.storeId.phone}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-teal-400" />
                  <span className="text-gray-200">Valid until: {new Date(currentOffer.validTo).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 mb-6">
              <button 
                onClick={() => setLiked(!liked)}
                className="flex items-center space-x-2 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all border border-white/20"
              >
                <Heart className={`w-6 h-6 ${liked ? 'text-red-500 fill-current' : 'text-white'}`} />
              </button>
              
              <button className="flex items-center space-x-2 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all border border-white/20">
                <Share2 className="w-6 h-6 text-white" />
              </button>
              
              <button 
                onClick={() => setSaved(!saved)}
                className="flex items-center space-x-2 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all border border-white/20"
              >
                <Bookmark className={`w-6 h-6 ${saved ? 'text-teal-400 fill-current' : 'text-white'}`} />
              </button>
            </div>

            <button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-2xl transition-all transform active:scale-95 shadow-lg shadow-teal-500/25">
              <span className="text-lg">Claim This Offer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Layout
  return (
    <div className="flex h-screen" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Desktop Filter Sidebar */}
      <DesktopFilters />

      {/* Main Offer View - Increased width for desktop */}
      <div className="flex-1 flex justify-center overflow-hidden">
        <div className="relative w-full lg:w-[600px] lg:max-w-[600px] h-full overflow-hidden">
          {/* Background Image with Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentOffer.image})` }}
          >

          </div>

          {/* Mobile Filter Dropdown */}
          <MobileFilterDropdown />

          {/* Swipe Container */}
          <div 
            ref={containerRef}
            className="relative z-10 h-full flex flex-col touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            style={{ touchAction: 'pan-y' }}
          >
            {/* Distance Badge */}
            <div className="absolute top-4 left-4 z-40">
              <div className="flex items-center space-x-1 text-black text-sm bg-white px-3 py-1 rounded-full border border-gray-300 shadow-md">
                <MapPin className="w-4 h-4 text-black" />
                <span>{currentOffer.distanceKm || currentOffer.distance} Km</span>
              </div>
            </div>

            {/* Eye Button to Preview Full Image */}
            <div className="absolute top-16 left-4 z-30">
              <button
                onClick={() => setShowImagePreview(true)}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all border border-white/20"
              >
                <Eye className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Premium Badge */}
            {currentOffer.isPremium && (
              <div className="absolute top-16 right-4 z-30">
                <div className="bg-gradient-to-r from-teal-400 to-teal-600 px-3 py-1 rounded-full">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 text-white" />
                    <span className="text-white text-xs font-bold">PREMIUM</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Content */}
            <div className="flex-1 flex items-end pb-6 px-4">
              <div className="w-full">
                {/* Store Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={currentOffer.storeId.profileImage} 
                    alt={currentOffer.storeId.storeName}
                    className="w-12 h-12 rounded-full border-2 border-teal-400"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">{currentOffer.storeId.storeName}</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white text-sm">{currentOffer.storeId.rating}</span>
                      </div>
                      <span className="text-gray-300 text-sm">• {currentOffer.storeId.place}</span>
                    </div>
                  </div>
                </div>

                {/* Offer Title */}
                <h1 className="text-white text-3xl font-bold mb-4 leading-tight">
                  {currentOffer.title}
                </h1>

                {/* Price Display */}
                <div className="bg-gradient-to-r from-teal-500/90 to-teal-600/90 backdrop-blur-sm rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-white/80 text-lg line-through">₹{currentOffer.originalPrice}</span>
                      <span className="text-white text-2xl font-bold">₹{currentOffer.offerPrice}</span>
                    </div>
                    <div className="text-white text-2xl font-bold">
                      {getDiscountDisplay(currentOffer.discountType, currentOffer.discountValue)}
                    </div>
                  </div>
                </div>

                {/* Show Details Button */}
                <button 
                  onClick={() => setShowDetails(true)}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-2xl transition-all transform active:scale-98 shadow-lg"
                >
                  <span className="text-lg">View Details</span>
                </button>
              </div>
            </div>

            {/* Swipe Hint */}
            <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
              <div className="text-white/60 text-sm text-center">
                <ChevronUp className="w-6 h-6 mx-auto mb-1" />
                <div>Swipe up for next</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferReelPage;