import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Phone, Instagram, MessageCircle, Share2, ArrowLeft, ShoppingBag, Calendar, Image, Heart, Clock, Award, Users, CheckCircle, TrendingUp, Shield, Copy, Facebook, Twitter, Linkedin, Mail, Loader2 ,ExternalLink, Sparkles,  ChevronLeft, ChevronRight, X} from 'lucide-react';
import { SERVER_URL } from '../../Config';
import axios from 'axios';
import ChatAppScreen from '../../components/ChatApp';
import { useAuth } from '../../context/UserContext';

const StoreProfile = () => {
  console.log("prms", useParams());
  
  const { storeName } = useParams();
  const navigate = useNavigate();
  const {user}=useAuth()
  const [store, setStore] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [showChat, setShowChat] = useState(false);
const [touchEnd, setTouchEnd] = useState(null);
const [showChatApp, setShowChatApp] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);

const handleTouchStart = (e) => {
  setTouchStart(e.targetTouches[0].clientX);
};

const handleTouchMove = (e) => {
  setTouchEnd(e.targetTouches[0].clientX);
};

  // Fixed handleChatClick function
  const handleChatClick = () => {
    console.log('Chat button clicked'); // Debug log
    console.log('enhancedStore:', enhancedStore); // Debug log
    
    // Check if enhancedStore exists
    if (!enhancedStore) {
      console.error('No store data available');
      return;
    }

    // Set the selected user/store with proper structure
    const userToChat = {
      _id: enhancedStore.userId || enhancedStore.id,
      username: enhancedStore.storeName || enhancedStore.name,
      profileImage: enhancedStore.profileImage || enhancedStore.avatar,
      storeName: enhancedStore.storeName,
      isOnline: enhancedStore.isOnline || false,
      // Add additional fields that might be needed
      userId: enhancedStore.userId|| enhancedStore.id,
      name: enhancedStore.storeName || enhancedStore.name
    };

    console.log('Selected user for chat:', userToChat); // Debug log
    
    setSelectedUser(userToChat);
    setShowChatApp(true);
  };

  const handleCloseChatApp = () => {
    console.log('Closing chat app'); // Debug log
    setShowChatApp(false);
    setSelectedUser(null);
  };

const handleTouchEnd = () => {
  if (!touchStart || !touchEnd) return;
  
  const distance = touchStart - touchEnd;
  const isLeftSwipe = distance > 50;
  const isRightSwipe = distance < -50;

  if (isLeftSwipe) {
    goToNext();
  } else if (isRightSwipe) {
    goToPrevious();
  }
};
  // Fetch store details from API
  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        setLoading(true);
        setError(null);
    
        const response = await axios.get(`${SERVER_URL}/stores/storeprofile/${storeName}`);
    
        const storeData = response.data.data;
        console.log("Store data:", storeData);
    
        setStore(storeData);
    
        // If the API returns products and gallery, set them
        if (storeData.products) {
          setProducts(storeData.products);
        }
        if (storeData.gallery) {
          setGallery(storeData.gallery);
        }
    
      } catch (err) {
        console.error('Error fetching store details:', err);
        const message =
          err.response?.data?.message || err.message || 'Something went wrong';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (storeName) {
      fetchStoreDetails();
    }
  }, [storeName]);

  // Fetch products when store is loaded
  useEffect(() => {
    const fetchProducts = async () => {
      if (!store || !store._id) return;

      try {
        console.log("Fetching products for store:", store._id);
        const response = await axios.get(`${SERVER_URL}/products/store/${store._id}`);
        
        console.log("Products fetched:", response.data);
        setProducts(response.data);
        
      } catch (err) {
        console.error('Error fetching products:', err);
        // Don't set error here as it might prevent the component from showing store info
      }
    };

    fetchProducts();
  }, [store]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isGalleryModalOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          closeGalleryModal();
          break;
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryModalOpen]);
  

  // Mock enhanced store data (fallback for missing fields)
  const enhancedStore = store ? {
    ...store,
    verified: store.verified || true,
    completedOrders: store.completedOrders ,
    specialties: store.specialties || ['Premium Quality', 'Fast Service', 'Expert Team'],
    averageRating: store.averageRating || store.rating || 4.5,
    numberOfRatings: store.numberOfRatings || store.reviewCount || 150
  } : null;

  // Handle tab change and fetch gallery when needed
  const handleTabChange = async (tab) => {
    setActiveTab(tab);

    // Only fetch gallery if switching to gallery tab and gallery is empty
    if (tab === 'gallery' && !gallery.length && store && store._id) {
      try {
        setLoading(true);
        console.log("Fetching gallery for store:", store._id);
        
        const response = await axios.get(`${SERVER_URL}/gallery/${store._id}`);
        
        console.log("Gallery data:", response.data);
        // Adjust based on your API response structure
        const galleryData = response.data.data?.images || response.data.images || response.data;
        setGallery(galleryData);
        
      } catch (err) {
        console.error('Error fetching gallery:', err);
        setError('Failed to fetch gallery');
      } finally {
        setLoading(false);
      }
    }
  };

  // Generate share URL and content
  const generateShareContent = () => {
    const currentUrl = window.location.href;
    const storeUrl = `${window.location.origin}/storeprofile/${storeName}`;
    
    return {
      url: storeUrl,
      title: `${enhancedStore?.storeName || storeName} - ${enhancedStore?.category || 'Business'}`,
      description: `Check out ${enhancedStore?.storeName || storeName} in ${enhancedStore?.place || 'your area'}! ⭐ ${enhancedStore?.averageRating || '4.5'} rating with ${enhancedStore?.numberOfRatings || '100'}+ reviews. Premium ${enhancedStore?.category || 'business'} services available.`,
      hashtags: ['LocalBusiness', enhancedStore?.category?.replace(/\s+/g, '') || 'Business', enhancedStore?.place?.replace(/\s+/g, '') || 'Local']
    };
  };

  const openGalleryModal = (index) => {
    setCurrentImageIndex(index);
    setIsGalleryModalOpen(true);
  };
  
  const closeGalleryModal = () => {
    setIsGalleryModalOpen(false);
  };
  
  // Navigation functions
  const goToPrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? gallery.length - 1 : prev - 1
    );
  };
  
  const goToNext = () => {
    setCurrentImageIndex((prev) => 
      prev === gallery.length - 1 ? 0 : prev + 1
    );
  };
  
  // Share functions
  const shareViaWebShare = async () => {
    const shareData = generateShareContent();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.description,
          url: shareData.url
        });
        setShowShareModal(false);
      } catch (error) {
        console.log('Error sharing:', error);
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = async () => {
    const shareData = generateShareContent();
    const textToCopy = `${shareData.title}\n\n${shareData.description}\n\n${shareData.url}`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const shareToSocial = (platform) => {
    const shareData = generateShareContent();
    const encodedUrl = encodeURIComponent(shareData.url);
    const encodedTitle = encodeURIComponent(shareData.title);
    const encodedDescription = encodeURIComponent(shareData.description);
    const encodedHashtags = encodeURIComponent(shareData.hashtags.join(','));

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedDescription}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${encodedHashtags}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%0A%0A${encodedDescription}%0A%0A${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setShowShareModal(false);
  };

  // Generate QR code URL (using QR Server API)
  const generateQRCode = () => {
    const shareData = generateShareContent();
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareData.url)}`;
  };

  const toggleLike = (productId) => {
    setLikedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleAppointment = (product) => {
    console.log("product is ",product);
    
    navigate('/appointmentShedule', {
      state: {
        product:product,
        store: store
      }
    });
  };

  const handleOrderProduct = (product) => {
    navigate('/order-details', {
      state: {
        product: product,
        store: store
      }
    });
  };

  const openPhone = (phone) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    }
  };

  const openWhatsapp = (phone) => {
    if (phone) {
      const formattedPhone = phone.replace(/[^0-9+]/g, '');
      window.open(`https://wa.me/${formattedPhone}`, '_blank');
    }
  };

  const openInstagram = (instagram) => {
    if (instagram) {
      window.open(instagram, '_blank');
    }
  };

  const onBack = () => {
    navigate(-1); // Go back to previous page
  };

  const onChatNow = () => {
   setShowChat(true)
    console.log('Starting chat with store:', enhancedStore?.storeName);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-teal-600" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
   

    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors duration-200 font-medium text-sm sm:text-base"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Back to Stores</span>
              <span className="sm:hidden">Back</span>
            </button>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={shareViaWebShare}
                className="flex items-center gap-1 sm:gap-2 bg-teal-50 text-teal-600 px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-teal-100 transition-colors duration-200 font-medium text-sm sm:text-base"
              >
                <Share2 size={16} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Share Store</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Store Preview */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={enhancedStore?.profileImage || 'https://picsum.photos/60/60?random=store'}
                  alt={enhancedStore?.storeName}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{enhancedStore?.storeName}</h4>
                  <p className="text-sm text-gray-600">{enhancedStore?.category} • {enhancedStore?.place}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star size={16} className="text-yellow-400 fill-current" />
                <span>{enhancedStore?.averageRating} ({enhancedStore?.numberOfRatings} reviews)</span>
              </div>
            </div>

            {/* Social Media Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => shareToSocial('facebook')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Facebook size={20} />
                Facebook
              </button>
              <button
                onClick={() => shareToSocial('twitter')}
                className="flex items-center gap-2 bg-sky-500 text-white px-4 py-3 rounded-lg hover:bg-sky-600 transition-colors"
              >
                <Twitter size={20} />
                Twitter
              </button>
              <button
                onClick={() => shareToSocial('linkedin')}
                className="flex items-center gap-2 bg-blue-700 text-white px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors"
              >
                <Linkedin size={20} />
                LinkedIn
              </button>
              <button
                onClick={() => shareToSocial('whatsapp')}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle size={20} />
                WhatsApp
              </button>
              <button
                onClick={() => shareToSocial('telegram')}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <MessageCircle size={20} />
                Telegram
              </button>
              <button
                onClick={() => shareToSocial('email')}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Mail size={20} />
                Email
              </button>
            </div>

            {/* Copy Link */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generateShareContent().url}
                  readOnly
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    copySuccess
                      ? 'bg-green-600 text-white'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {copySuccess ? (
                    <CheckCircle size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
              {copySuccess && (
                <p className="text-sm text-green-600 mt-1">Link copied to clipboard!</p>
              )}
            </div>

            {/* QR Code */}
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Scan QR Code</h4>
              <div className="inline-block bg-white p-4 rounded-lg border border-gray-200">
                <img
                  src={generateQRCode()}
                  alt="QR Code"
                  className="w-32 h-32"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Scan with your phone camera</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-black overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          
          {/* Mobile-First Layout: Image First, Then Content */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Mobile: Image First - Desktop: Right Side */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end w-full">
              <div className="relative w-full max-w-sm lg:max-w-none">
                <div className="w-full aspect-square lg:w-80 lg:h-80 xl:w-96 xl:h-96 rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl transform hover:rotate-0 lg:rotate-3 transition-transform duration-300">
                  <img
                    src={enhancedStore?.profileImage || 'https://picsum.photos/500/500?random=store'}
                    alt={enhancedStore?.storeName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 lg:-bottom-4 lg:-right-4 bg-white rounded-xl lg:rounded-2xl p-2 lg:p-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="lg:w-5 lg:h-5 text-teal-600" />
                    <span className="text-xs lg:text-sm font-semibold text-gray-800">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile: Content Second - Desktop: Left Side */}
            <div className="order-2 lg:order-1 text-white text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4 lg:mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-6xl font-bold leading-tight">
                  {enhancedStore?.storeName || storeName}
                </h1>
                {enhancedStore?.verified && (
                  <div className="bg-white/20 backdrop-blur-sm p-1.5 lg:p-2 rounded-full">
                    <CheckCircle size={20} className="lg:w-8 lg:h-8 text-teal-300" />
                  </div>
                )}
              </div>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-teal-100 mb-3 lg:mb-4 font-medium">
                {enhancedStore?.category}
              </p>
              
              <div className="flex items-center justify-center lg:justify-start gap-2 text-white/90 mb-6 lg:mb-8">
                <MapPin size={18} className="lg:w-5 lg:h-5" />
                <span className="text-base lg:text-lg">{enhancedStore?.place}</span>
              </div>

              {/* Stats - Stack on mobile, inline on desktop */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 lg:gap-4 mb-6 lg:mb-8 justify-center lg:justify-start">
                <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 lg:px-4 lg:py-2 rounded-full">
                  <Star size={16} className="lg:w-4 lg:h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold text-sm lg:text-base">{enhancedStore?.averageRating}</span>
                  <span className="text-white/80 text-sm lg:text-base">({enhancedStore?.numberOfRatings} reviews)</span>
                </div>
                
                <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 lg:px-4 lg:py-2 rounded-full">
                  <TrendingUp size={16} className="lg:w-4 lg:h-4 text-green-400" />
                  <span className="text-white/90 text-sm lg:text-base">{enhancedStore?.completedOrders}+ orders</span>
                </div>
              </div>

              {/* Action Buttons - Stack on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-6 lg:mb-8">
                <button
                  onClick={handleChatClick}
                  className="bg-white text-teal-600 px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold text-base lg:text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
                >
                  Start Conversation
                </button>
                <button
                  onClick={() => openPhone(enhancedStore?.phone)}
                  className="bg-teal-500 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold text-base lg:text-lg hover:bg-teal-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
                >
                  Call Now
                </button>
              </div>

              {/* Specialties - Centered on mobile */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {enhancedStore?.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium border border-white/20"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Navigation Tabs */}
      <section className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="flex bg-gray-50 rounded-xl p-1 my-6">
              <button
                onClick={() => handleTabChange('products')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'products'
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                Products & Services
              </button>
              <button
                onClick={() => handleTabChange('gallery')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'gallery'
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                Gallery
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    
      {activeTab === 'products' ? (
  <div className="space-y-6 sm:space-y-8">
    {/* Section Header */}
    <div className="text-center mb-8 sm:mb-12">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3 sm:mb-4">
        Our Products & Services
      </h2>
      <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
        Discover our premium collection of products and professional services designed to meet your needs
      </p>
    </div>

    {/* Products Grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {products && products.length > 0 ? (
        products.map((product) => (
          <div key={product._id} className="group bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-teal-200 transform hover:-translate-y-1">
          {/* Image Section - Responsive aspect ratio */}
          <div className="relative aspect-[4/3] sm:aspect-[4/3] overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            
            {/* Gradient overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            
            {/* Top badges */}
            <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 flex flex-col gap-1">
              {product.popular && (
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-sm">
                  🔥
                </span>
              )}
              {product.premium && (
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-sm">
                  ✨
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
              onClick={() => toggleLike(product._id)}
              className={`absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border ${
                likedProducts.has(product._id)
                  ? 'bg-red-500 text-white shadow-md border-red-500 scale-110'
                  : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 border-white/50 hover:scale-110'
              }`}
            >
              <Heart size={12} className={likedProducts.has(product._id) ? 'fill-current' : ''} />
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
            <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed hidden sm:block">{product.description}</p>
        
            {/* Action Button */}
            <button
              onClick={() => {
                if (product.type === 'service') {
                  handleAppointment(product);
                } else {
                  handleOrderProduct(product);
                }
              }}
              className={`w-full py-1.5 sm:py-2 rounded-md sm:rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 text-xs sm:text-sm ${
                product.type === 'service'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700'
                  : 'bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-black'
              }`}
            >
              {product.type === 'service' ? (
                <>
                  <Calendar size={12} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Book Now</span>
                  <span className="sm:hidden">Book</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={12} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Add to Cart</span>
                  <span className="sm:hidden">Add</span>
                </>
              )}
            </button>
          </div>
        </div>
        ))
      ) : (
        <div className="col-span-full text-center py-8 sm:py-12">
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 max-w-sm mx-auto border border-gray-100">
            <ShoppingBag size={40} className="sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-black mb-3">No Products Found</h3>
            <p className="text-gray-600 text-sm">
              This store hasn't added any products yet. Check back later for amazing deals!
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
): (
  // Enhanced Gallery Section
  <div className="space-y-6">
  {/* Section Header */}
  <div className="text-center mb-8">
    <h2 className="text-2xl lg:text-3xl font-bold text-black mb-3">
      Gallery
    </h2>
    <p className="text-base text-gray-600 max-w-2xl mx-auto">
      Take a look at our work, facilities, and the amazing results we deliver
    </p>
  </div>

  {/* Gallery Grid */}
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
  {gallery && gallery.length > 0 ? (
    gallery.map((item, index) => (
      <div
        key={item._id}
        className="group bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-teal-200 transform hover:-translate-y-1 cursor-pointer"
        onClick={() => openGalleryModal(index)}
      >
        {/* Image Section */}
        <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
          <img
            src={item.image}
            alt={item.caption}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Category badge */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium shadow-md">
              {item.category}
            </span>
          </div>

          {/* View button overlay - Hidden on mobile, shown on hover for larger screens */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex">
            <button className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium shadow-md hover:bg-white transition-colors duration-200 flex items-center gap-2 text-xs sm:text-sm">
              <ExternalLink size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">View Full Size</span>
              <span className="sm:hidden">View</span>
            </button>
          </div>

          {/* Caption overlay - Only on larger screens */}
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden sm:block">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-md">
              <p className="text-gray-800 font-medium text-xs text-center line-clamp-2">{item.caption}</p>
            </div>
          </div>

          {/* Mobile tap indicator */}
          <div className="absolute bottom-2 right-2 sm:hidden">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md">
              <ExternalLink size={12} className="text-gray-600" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 font-medium text-xs sm:text-sm truncate flex-1 line-clamp-1">{item.caption}</p>
            <div className="flex items-center gap-1 ml-2">
              <Sparkles size={10} className="sm:w-3 sm:h-3 text-teal-500" />
              <span className="text-xs text-gray-500 hidden sm:inline">New</span>
            </div>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="col-span-full text-center py-8 sm:py-12">
      <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 max-w-sm mx-auto border border-gray-100">
        <Image size={40} className="sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-base sm:text-lg font-bold text-black mb-3">Gallery Coming Soon</h3>
        <p className="text-gray-600 text-sm">
          Beautiful images showcasing our work will be added here soon!
        </p>
      </div>
    </div>
  )}
</div>
</div>
)}
      </main>
      {isGalleryModalOpen && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={closeGalleryModal}
        className="absolute top-4 right-4 text-white hover:text-red-400 z-50 bg-black/20 rounded-full p-2 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Previous Button */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 text-white hover:text-teal-400 z-50 bg-black/20 rounded-full p-2 transition-colors"
      >
        <ChevronLeft size={32} />
      </button>

      {/* Next Button */}
      <button
        onClick={goToNext}
        className="absolute right-4 text-white hover:text-teal-400 z-50 bg-black/20 rounded-full p-2 transition-colors"
      >
        <ChevronRight size={32} />
      </button>

      {/* Main Image Container */}
      <div 
        className="relative max-w-4xl max-h-[90vh] mx-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={gallery[currentImageIndex]?.image}
          alt={gallery[currentImageIndex]?.caption}
          className="w-full h-full object-contain rounded-lg"
        />
        
        {/* Image Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
          <h3 className="text-white text-lg font-semibold mb-1">
            {gallery[currentImageIndex]?.caption}
          </h3>
          <p className="text-white/80 text-sm">
            {gallery[currentImageIndex]?.category}
          </p>
        </div>
      </div>

      {/* Image Counter */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/40 text-white px-3 py-1 rounded-full text-sm">
        {currentImageIndex + 1} / {gallery.length}
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {gallery.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentImageIndex 
                ? 'bg-white' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  </div>
)}
      {/* Footer CTA */}
      <footer className="bg-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-teal-100 mb-8 text-lg">
            Contact us today to book your appointment or order your favorite products
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleChatClick}
              className="bg-white text-teal-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Chat
            </button>
            <button
              onClick={() => openPhone(enhancedStore?.phone)}
              className="bg-teal-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-teal-400 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-teal-400"
            >
              Call Now
            </button>
          </div>
        </div>
      </footer>
    </div>
 
    {showChatApp && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute inset-4 bg-white rounded-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">
                Chat with {selectedUser?.username || selectedUser?.storeName || 'Store'}
              </h2>
              <button
                onClick={handleCloseChatApp}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="h-[calc(100%-4rem)]">
              {selectedUser && (
                <ChatAppScreen 
                  targetUser={selectedUser} 
                  key={selectedUser._id} // Force re-render when user changes
                />
              )}
            </div>
          </div>
        </div>
      )}
  </div>
  );
};

export default StoreProfile;