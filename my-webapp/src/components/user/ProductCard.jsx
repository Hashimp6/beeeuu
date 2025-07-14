
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Phone, Instagram, MessageCircle, Share2, ArrowLeft, ShoppingBag, Calendar, Image, Heart, Clock, Award, Users, CheckCircle, TrendingUp, Shield, Copy, Facebook, Twitter, Linkedin, Mail, Loader2, ExternalLink, Sparkles, ChevronLeft, ChevronRight, X, Eye, Info, Zap, Package, Timer } from 'lucide-react';

// Enhanced Product Card Component
const ProductCard = ({ product, onLike, isLiked, onBook, onOrder, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  // Auto-scroll images
  useEffect(() => {
    if (images.length > 1 && isAutoScrolling) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000); // Change image every 3 seconds

      return () => clearInterval(interval);
    }
  }, [images.length, isAutoScrolling]);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsAutoScrolling(false);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }

    setTimeout(() => setIsAutoScrolling(true), 5000);
  };

  const goToPrevious = () => {
    setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    setIsAutoScrolling(false);
    setTimeout(() => setIsAutoScrolling(true), 5000);
  };

  const goToNext = () => {
    setCurrentImageIndex(prev => (prev + 1) % images.length);
    setIsAutoScrolling(false);
    setTimeout(() => setIsAutoScrolling(true), 5000);
  };

  return (
    <div className="group bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-teal-200 transform hover:-translate-y-1">
      {/* Image Section with Auto-scroll */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div 
          className="relative w-full h-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          
          {/* Image navigation for multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-1.5 top-1/2 transform -translate-y-1/2 bg-black/30 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-black/30 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/50"
              >
                <ChevronRight size={14} />
              </button>
              
              {/* Image indicators */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setIsAutoScrolling(false);
                      setTimeout(() => setIsAutoScrolling(true), 5000);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === currentImageIndex 
                        ? 'bg-white' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Top badges */}
          <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 flex flex-col gap-1">
            {product.popular && (
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-sm">
                🔥 Hot
              </span>
            )}
            {product.premium && (
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-sm">
                ✨ Premium
              </span>
            )}
            {product.discount && (
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-sm">
                -{product.discount}%
              </span>
            )}
          </div>
      
          {/* Category badge */}
          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium shadow-md">
              {product.category}
            </span>
          </div>
      
          {/* Like button */}
          <button
            onClick={() => onLike(product._id)}
            className={`absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border ${
              isLiked
                ? 'bg-red-500 text-white shadow-md border-red-500 scale-110'
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 border-white/50 hover:scale-110'
            }`}
          >
            <Heart size={12} className={isLiked ? 'fill-current' : ''} />
          </button>
      
          {/* Price overlay */}
          <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2">
            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 shadow-md">
              <span className="text-xs sm:text-sm font-bold text-black">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-500 line-through hidden sm:inline">₹{product.originalPrice}</span>
              )}
            </div>
          </div>
          
          {/* View Details button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => onViewDetails(product)}
              className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium shadow-md hover:bg-white transition-colors duration-200 flex items-center gap-2 text-xs sm:text-sm"
            >
              <Eye size={14} />
              <span className="hidden sm:inline">View Details</span>
            </button>
          </div>
        </div>
      </div>
    
      {/* Content Section */}
      <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-black group-hover:text-teal-600 transition-colors line-clamp-2 flex-1 leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 ml-1">
            <Star size={10} className="sm:w-3 sm:h-3 text-yellow-400 fill-current" />
            <span className="text-xs font-semibold text-gray-600">{product.rating}</span>
          </div>
        </div>
    
        {/* Description - Hidden on mobile for space */}
        <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed hidden sm:block">
          {product.description}
        </p>
    
        {/* Action Buttons */}
        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={() => onViewDetails(product)}
            className="flex-1 bg-gray-100 text-gray-700 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-1 hover:bg-gray-200 text-xs sm:text-sm"
          >
            <Info size={12} />
            <span className="hidden sm:inline">Details</span>
          </button>
          
          <button
            onClick={() => {
              if (product.type === 'service') {
                onBook(product);
              } else {
                onOrder(product);
              }
            }}
            className={`flex-1 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 text-xs sm:text-sm ${
              product.type === 'service'
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700'
                : 'bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-black'
            }`}
          >
            {product.type === 'service' ? (
              <>
                <Calendar size={12} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Book</span>
              </>
            ) : (
              <>
                <ShoppingBag size={12} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ProductCard;