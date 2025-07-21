import React, { useState, useEffect, useRef } from 'react';
import { Heart, MapPin, Clock, Share2, Bookmark, ChevronUp, ChevronDown, Star, Phone, Navigation, Eye, Zap, X } from 'lucide-react';
import { SERVER_URL } from '../../Config';
import axios from 'axios';

const OfferReelPage = () => {
  const [currentOffer, setCurrentOffer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef(null);
  const [offers, setOffers] = useState([  {
    "location": {
        "type": "Point",
        "coordinates": [
            76.8604367,
            8.8977417
        ]
    },
    "_id": "687caa0a4efb59579514dad1",
    "storeId": {
        "_id": "682cdf764acd2732dbbe90d7",
        "storeName": "Dianaas Henna",
        "profileImage": "https://res.cloudinary.com/dhed9kuow/image/upload/v1752042211/store_profiles/xthuo1cbj2vi0sq9jmd2.png",
        "place": "Ayoor, Kerala, India",
        "phone": "6485970539",
        "averageRating": 3.5
    },
    "title": "Big Sale on BURger",
    "description": "Up to 50% off branded shoes",
    "image": "https://res.cloudinary.com/dhed9kuow/image/upload/v1753000458/offers/sf1ino4v0e3fi1imymmt.jpg",
    "discountType": "percent",
    "discountValue": "50",
    "validFrom": "2025-07-19T00:00:00.000Z",
    "validTo": "2025-07-30T00:00:00.000Z",
    "category": "Food",
    "tags": [
        "food",
        "burger",
        "offer"
    ],
    "isPremium": false,
    "isActive": true,
    "originalPrice": 2000,
    "offerPrice": 1000,
    "place": "Ayoor, Kerala, India",
    "createdAt": "2025-07-20T08:34:18.916Z",
    "updatedAt": "2025-07-20T08:34:18.916Z",
    "__v": 0
}]);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
 
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const location = JSON.parse(localStorage.getItem("location"));
        const lat = location?.lat;
        const lng = location?.lng;

        if (!lat || !lng) {
          setError("Location not found. Please allow location access.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${SERVER_URL}/offers/nearby?lat=${lat}&lng=${lng}&radius=5000`
        );

        if (response.data.success && response.data.data?.length) {
          setOffers(response.data.data);
        } else {
          setError("No offers found nearby.");
        }
      } catch (err) {
        setError("Failed to fetch offers.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);


  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCurrentOffer(offers[currentIndex]);
      setLoading(false);
    }, 200);
  }, [currentIndex]);

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
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      const nextIndex = (currentIndex + 1) % offers.length;
      setCurrentIndex(nextIndex);
      setLoading(false);
    }, 300);
  };

  const loadPreviousOffer = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      const prevIndex = currentIndex === 0 ? offers.length - 1 : currentIndex - 1;
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
        return `${discountValue} OFF`;
      case 'freebie':
        return discountValue === "100" ? "BOGO" : `${discountValue}% OFF`;
      case 'cashback':
        return `${discountValue} CASHBACK`;
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
        {/* Image Info Overlay */}
        <div className="absolute bottom-6 left-6 right-6 bg-black/70 backdrop-blur-sm rounded-2xl p-4">
          <h3 className="text-white font-bold text-lg">{currentOffer.title}</h3>
          <p className="text-gray-300 text-sm">{currentOffer.storeId.storeName}</p>
        </div>
      </div>
    );
  }

  // Details Modal - NO FULL IMAGE, just compact design
  if (showDetails) {
    return (
      <div className="h-screen bg-gradient-to-b from-gray-900 to-black relative overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-purple-600/20"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(20, 184, 166, 0.1) 0%, transparent 50%), 
                            radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`
          }}></div>
        </div>

        {/* Details Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header with Close Button */}
          <div className="p-4 pt-6 flex items-center justify-between">
            <h2 className="text-white text-xl font-bold">Offer Details</h2>
            <button 
              onClick={() => setShowDetails(false)}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {/* Compact Offer Image */}
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

            {/* Store Info */}
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src={currentOffer.storeId.profileImage} 
                alt={currentOffer.storeId.profileImage}
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

            {/* Offer Title */}
            <h1 className="text-white text-2xl font-bold mb-4 leading-tight">
              {currentOffer.title}
            </h1>

            {/* Description */}
            <p className="text-gray-200 text-base mb-6 leading-relaxed">
              {currentOffer.description}
            </p>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-teal-500/20 to-teal-600/20 backdrop-blur-sm border border-teal-500/30 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400 text-lg line-through">${currentOffer.originalPrice}</span>
                    <span className="text-white text-3xl font-bold">${currentOffer.offerPrice}</span>
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

            {/* Category and Distance */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-white text-sm font-medium">
                {currentOffer.category}
              </span>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span className="text-white text-sm font-medium">{currentOffer.distance}m away</span>
              </div>
            </div>

            {/* Store Details */}
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

            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
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
            </div>

            {/* Main CTA */}
            <button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-2xl transition-all transform active:scale-95 shadow-lg shadow-teal-500/25">
              <span className="text-lg">Claim This Offer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Offer View - With nav space
  return (
    <div className="flex justify-center h-screen  overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
    <div className="relative w-full sm:w-[420px] max-w-[420px] h-full  overflow-hidden">
   {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${currentOffer.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      </div>

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
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center space-x-1 text-white text-sm bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
            <MapPin className="w-4 h-4" />
            <span>{currentOffer.distance}m</span>
          </div>
        </div>

        {/* Eye Button to Preview Full Image */}
        <div className="absolute top-4 left-4 z-30">
          <button
            onClick={() => setShowImagePreview(true)}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all border border-white/20"
          >
            <Eye className="w-5 h-5 text-white" />
          </button>
        </div>

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
                  <span className="text-white/80 text-lg line-through">${currentOffer.originalPrice}</span>
                  <span className="text-white text-2xl font-bold">${currentOffer.offerPrice}</span>
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
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">View Details</span>
              </div>
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
  );
};

export default OfferReelPage;