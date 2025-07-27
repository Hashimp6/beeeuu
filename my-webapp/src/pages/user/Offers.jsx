import React, { useState, useEffect, useRef } from 'react';
import { Heart, MapPin, Clock, Share2, Bookmark, ChevronUp, ChevronDown, Star, Phone, Eye, Zap, X, Tag, Search, Share, Send, Forward } from 'lucide-react';
import { useAuth } from '../../context/UserContext';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { SERVER_URL } from '../../Config';
import { useNavigate, useParams } from 'react-router-dom';

const OfferReelPage = () => {
  const { offerId } = useParams();
  const { location, user,setLocation } = useAuth();
  const navigate = useNavigate();
  // Add null checks for location
  const coords = location?.location?.coordinates || null;
  console.log("loc", coords);
  const [allOffers, setAllOffers] = useState([]); // Store all loaded offers
const [hasMore, setHasMore] = useState(true);
const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sharedOffer, setSharedOffer] = useState(null);
  const [saved, setSaved] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [locationError, setLocationError] = useState(false);
  const containerRef = useRef(null);
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState(offers);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchSharedOffer = async () => {
      if (!offerId) return;
      try {
        const res = await axios.get(`${SERVER_URL}/offers/${offerId}`);
        if (res.data?.data) {
          setSharedOffer(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch shared offer", error);
      }
    };
  
    fetchSharedOffer();
  }, [offerId]);
  
  
  const fetchNearbyOffers = async (lat, lng, category = '', skip = 0) => {
    const { type, id } = getUserIdentifier();
    try {
      const response = await axios.get(`${SERVER_URL}/offers/nearby`, {
        params: {
          lat,
          lng,
          category,
          skip, // Add this line
          [type === 'temp' ? 'tempUserId' : 'userId']: id
        },
      });
  
      if (response.data.success && response.data.data) {
   
        return response.data; // Return full response to get pagination info
      } else {
        console.warn('No offers found:', response.data.message);
        return { data: [], pagination: { hasMore: false } };
      }
    } catch (err) {
      console.error('Error fetching nearby offers:', err);
      return { data: [], pagination: { hasMore: false } };
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

 
const requestLocationPermission = async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Get place name via reverse geocoding (optional but recommended)
        let placeName = 'Current Location';
        
        // If you want to get the actual place name:
        if (window.google && window.google.maps) {
          try {
            const geocoder = new window.google.maps.Geocoder();
            const latlng = new window.google.maps.LatLng(latitude, longitude);
            
            const result = await new Promise((resolve, reject) => {
              geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === 'OK' && results[0]) {
                  resolve(results[0].formatted_address);
                } else {
                  reject(new Error('Geocoder failed'));
                }
              });
            });
            
            placeName = result || 'Current Location';
          } catch (geocodeErr) {
            console.error('Reverse geocoding failed:', geocodeErr);
            // Continue with default location name
          }
        }
        
        // Create the SAME location structure as LocationSelectionModal
        const locationData = {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude] // [lng, lat] format
          },
          place: placeName
        };
        
        // Update the auth context (this was missing!)
        setLocation(locationData);
        
        // Save to localStorage for persistence
        localStorage.setItem('location', JSON.stringify(locationData));
        
        // Now fetch offers with the coordinates
        await fetchOffersWithCoords(latitude, longitude, true);
        setLocationError(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationError(true);
        // Use default location or show error
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  } else {
    setLocationError(true);
    console.error('Geolocation is not supported by this browser.');
  }
};

const fetchOffersWithCoords = async (lat, lng, reset = false) => {
  const skip = reset ? 0 : allOffers.length;
  const categoryFilter = selectedCategory !== 'all' ? selectedCategory : '';
  
  const response = await fetchNearbyOffers(lat, lng, categoryFilter, skip);
  
  if (response.data && response.data.length > 0) {
    let newOffers = response.data;
    
    // If we have a shared offer (offerId), make sure it's prioritized
    if (offerId && sharedOffer) { // Change: use sharedOffer instead of currentOffer
      // Remove the shared offer from the response if it exists
      newOffers = newOffers.filter(offer => offer._id !== offerId);
      
      if (reset) {
        // Put shared offer first
        newOffers = [sharedOffer, ...newOffers]; // Change: use sharedOffer
        setAllOffers(newOffers);
        setOffers(newOffers);
        setFilteredOffers(newOffers);
        setCurrentIndex(0);
      } else {
        // For pagination, add to existing offers but keep shared offer at top
        const updatedOffers = [sharedOffer, ...allOffers.slice(1), ...newOffers]; // Change: use sharedOffer
        setAllOffers(updatedOffers);
        setOffers(updatedOffers);
        setFilteredOffers(updatedOffers);
      }
    } else {
      // Normal flow without shared offer
      if (reset) {
        setAllOffers(newOffers);
        setOffers(newOffers);
        setFilteredOffers(newOffers);
        setCurrentIndex(0);
      } else {
        const updatedOffers = [...allOffers, ...newOffers];
        setAllOffers(updatedOffers);
        setOffers(updatedOffers);
        setFilteredOffers(updatedOffers);
      }
    }
    
    setHasMore(response.pagination?.hasMore || false);
  } else if (reset) {
    // If no offers found but we have a shared offer, keep it
    if (offerId && sharedOffer) { // Change: use sharedOffer instead of currentOffer
      setAllOffers([sharedOffer]);
      setOffers([sharedOffer]);
      setFilteredOffers([sharedOffer]);
    } else {
      setAllOffers([]);
      setOffers([]);
      setFilteredOffers([]);
    }
    setHasMore(false);
  }
};

useEffect(() => {
  if (coords && coords.length === 2) {
    // Only fetch if we don't have an offerId, or if we have offerId and sharedOffer is ready
    if (!offerId || (offerId && sharedOffer)) {
      fetchOffersWithCoords(coords[1], coords[0], true);
    }
  }
}, [coords, selectedCategory, sharedOffer]);

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
      if (filteredOffers.length > 0) {
        setCurrentOffer(filteredOffers[currentIndex]);
      }
      setLoading(false);
    }, 200);
  }, [currentIndex, filteredOffers]);
  useEffect(() => {
    setFilteredOffers(offers);
  }, [offers]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setAllOffers([]); // Clear existing offers
    setHasMore(true); // Reset pagination
   
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
    
    // Check if we're near the end and need to load more
    const isNearEnd = currentIndex >= filteredOffers.length - 3; // Load when 3 items left
    
    if (isNearEnd && hasMore && !isLoadingMore && coords) {
      setIsLoadingMore(true);
      const [lng, lat] = coords;
      fetchOffersWithCoords(lat, lng, false).finally(() => {
        setIsLoadingMore(false);
      });
    }
    
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


  const handleShareOffer = async () => {
    if (!currentOffer) return;
    
    const shareUrl = `${window.location.origin}/offers/${currentOffer._id}`;
    const shareData = {
      title: currentOffer.title,
      text: `Check out this amazing offer: ${currentOffer.title} at ${currentOffer.storeId.storeName}`,
      url: shareUrl
    };
  
    try {
      // Try native sharing first (mobile devices)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        // You might want to show a toast notification here
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    }
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
      case 'Percentage':
        return `${discountValue}% OFF`;
      case 'fixed':
        return `₹${discountValue} OFF`;
      case 'freebie':
        return discountValue === "100" ? "BOGO" : `${discountValue}% OFF`;
      case 'cashback':
        return `₹${discountValue} CASHBACK`;
      default:
        return `${discountValue}-Rs OFF`;
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Spinning border ring */}
        <div className="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
    
        {/* Icon image in center */}
        <img
          src="/icon.png" // Replace with your actual path
          alt="loading icon"
          className="w-10 h-10 rounded-full object-cover border-2 border-black"
        />
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
      <div className="relative z-10 h-full flex flex-col max-w-3xl mx-auto w-full"> {/* <== Add this wrapper */}
      <div className="p-4 pt-6 flex items-center justify-between">
  <h2 className="text-white text-xl font-bold">Offer Details</h2>
  <div className="flex items-center space-x-2">
    <button 
      onClick={handleShareOffer}
      className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all"
    >
      <Send className="w-5 h-5 text-white" />
    </button>
    <button 
      onClick={() => setShowDetails(false)}
      className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all"
    >
      <X className="w-5 h-5 text-white" />
    </button>
  </div>
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
                    <span className="text-white text-sm font-medium">{currentOffer.storeId.rating||"0"}</span>
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
                  <span className="text-gray-200 flex-1">{currentOffer.storeId.place}</span>
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

          

            <button
  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-2xl transition-all transform active:scale-95 shadow-lg shadow-teal-500/25"
  onClick={() => {
    const storeSlug = currentOffer.storeId.storeName
      .toLowerCase()
      .replace(/\s+/g, '-');
    navigate(`/storeprofile/${storeSlug}`);
  }}
>
  <span className="text-lg">View Shop Profile</span>
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
            <div className="flex-1 flex items-end pb-14 px-4">
              {/* Content Card with Black Transparent Background */}
              <div className="w-full bg-black/40 backdrop-blur-sm rounded-3xl p-6">
                {/* Store Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={currentOffer.storeId.profileImage} 
                    alt={currentOffer.storeId.storeName}
                    className="w-12 h-12 rounded-full border-2 border-teal-400"
                    onClick={() => {
                      const storeSlug = currentOffer.storeId.storeName
                        .toLowerCase()
                        .replace(/\s+/g, '-');
                      navigate(`/storeprofile/${storeSlug}`);
                    }}
                  />
                  <div className="flex-1">
                    <h3 onClick={() => {
                      const storeSlug = currentOffer.storeId.storeName
                        .toLowerCase()
                        .replace(/\s+/g, '-');
                      navigate(`/storeprofile/${storeSlug}`);
                    }} className="text-white font-bold text-lg">{currentOffer.storeId.storeName}</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white text-sm">{currentOffer.storeId.averageRating}</span>
                      </div>
                      <span className="text-gray-300 text-sm">• {currentOffer.storeId.place}</span>
                    </div>
                  </div>
                  {/* Add share button here */}
                  <button
                    onClick={handleShareOffer}
                    className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all border border-white/20"
                  >
                    <Send className="w-5 h-5 text-gray-800" />
                  </button>
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