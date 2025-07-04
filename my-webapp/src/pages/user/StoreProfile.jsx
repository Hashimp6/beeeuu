import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Phone, Instagram, MessageCircle, Share2, ArrowLeft, ShoppingBag, Calendar, Image, Heart, ExternalLink, Clock, Award, Users, Sparkles, CheckCircle, TrendingUp, Shield, Copy, Facebook, Twitter, Linkedin, Mail, Loader2 } from 'lucide-react';
import { SERVER_URL } from '../../Config';
import axios from 'axios';

const StoreProfile = () => {
  console.log("prms",useParams());
  
  const { storeName } = useParams();
  const navigate = useNavigate();
  
  const [store, setStore] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch store details from API
  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        setLoading(true);
        setError(null);
    
       const response = await axios.get(`${SERVER_URL}/stores/storeprofile/${storeName}`);
    
        const storeData = response.data.data;
    console.log("sttt",storeData);
    
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

  // Mock enhanced store data (fallback for missing fields)
  const enhancedStore = store ? {
    ...store,
    verified: store.verified || true,
    responseTime: store.responseTime || '~2 hrs',
    completedOrders: store.completedOrders || 89,
    yearEstablished: store.yearEstablished || '2020',
    specialties: store.specialties || ['Premium Quality', 'Fast Service', 'Expert Team'],
    workingHours: store.workingHours || 'Mon-Sat: 9AM-8PM',
    averageRating: store.averageRating || store.rating || 4.5,
    numberOfRatings: store.numberOfRatings || store.reviewCount || 150
  } : null;

  // Generate mock data if not provided by API
  useEffect(() => {
    if (store && !products.length && !store.products) {
      // Mock products data
      setProducts([
        {
          _id: '1',
          name: 'Premium Hair Styling',
          description: 'Professional hair styling service with premium products and expert consultation',
          price: 1500,
          originalPrice: 2000,
          type: 'service',
          image: 'https://picsum.photos/400/300?random=1',
          rating: 4.9,
          duration: '60 min',
          popular: true,
          discount: 25,
          category: 'Hair Care'
        },
        {
          _id: '2',
          name: 'Organic Skincare Kit',
          description: 'Complete skincare routine with 100% organic ingredients for all skin types',
          price: 2500,
          originalPrice: 3200,
          type: 'product',
          image: 'https://picsum.photos/400/300?random=2',
          rating: 4.7,
          inStock: true,
          discount: 22,
          category: 'Skincare'
        },
        {
          _id: '3',
          name: 'Luxury Facial Treatment',
          description: 'Rejuvenating facial treatment with gold mask and premium anti-aging serums',
          price: 3500,
          type: 'service',
          image: 'https://picsum.photos/400/300?random=3',
          rating: 4.8,
          duration: '90 min',
          premium: true,
          category: 'Facial'
        },
        {
          _id: '4',
          name: 'Hair Care Bundle',
          description: 'Complete hair care set with natural shampoo, conditioner, and nourishing oil',
          price: 1200,
          originalPrice: 1500,
          type: 'product',
          image: 'https://picsum.photos/400/300?random=4',
          rating: 4.6,
          inStock: true,
          discount: 20,
          category: 'Hair Care'
        },
        {
          _id: '5',
          name: 'Bridal Makeup Package',
          description: 'Complete bridal makeup with trial session and touch-up kit included',
          price: 8500,
          type: 'service',
          image: 'https://picsum.photos/400/300?random=5',
          rating: 4.9,
          duration: '4 hours',
          premium: true,
          category: 'Makeup'
        },
        {
          _id: '6',
          name: 'Vitamin C Serum',
          description: 'High-potency vitamin C serum for brightening and anti-aging benefits',
          price: 899,
          originalPrice: 1299,
          type: 'product',
          image: 'https://picsum.photos/400/300?random=6',
          rating: 4.5,
          inStock: true,
          discount: 31,
          category: 'Skincare'
        }
      ]);
    }

    if (store && !gallery.length && !store.gallery) {
      // Mock gallery data
      setGallery([
        {
          _id: '1',
          image: 'https://picsum.photos/600/400?random=10',
          caption: 'Modern salon interior with premium equipment',
          category: 'Interior'
        },
        {
          _id: '2',
          image: 'https://picsum.photos/600/400?random=11',
          caption: 'Professional styling session in progress',
          category: 'Services'
        },
        {
          _id: '3',
          image: 'https://picsum.photos/600/400?random=12',
          caption: 'Premium product collection showcase',
          category: 'Products'
        },
        {
          _id: '4',
          image: 'https://picsum.photos/600/400?random=13',
          caption: 'Before and after transformation',
          category: 'Results'
        },
        {
          _id: '5',
          image: 'https://picsum.photos/600/400?random=14',
          caption: 'Team of expert professionals',
          category: 'Team'
        },
        {
          _id: '6',
          image: 'https://picsum.photos/600/400?random=15',
          caption: 'Award-winning service recognition',
          category: 'Awards'
        }
      ]);
    }
  }, [store, products.length, gallery.length]);

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

  // Mock data for demonstration
  useEffect(() => {
    setProducts([
      {
        _id: '1',
        name: 'Premium Hair Styling',
        description: 'Professional hair styling service with premium products and expert consultation',
        price: 1500,
        originalPrice: 2000,
        type: 'service',
        image: 'https://picsum.photos/400/300?random=1',
        rating: 4.9,
        duration: '60 min',
        popular: true,
        discount: 25,
        category: 'Hair Care'
      },
      {
        _id: '2',
        name: 'Organic Skincare Kit',
        description: 'Complete skincare routine with 100% organic ingredients for all skin types',
        price: 2500,
        originalPrice: 3200,
        type: 'product',
        image: 'https://picsum.photos/400/300?random=2',
        rating: 4.7,
        inStock: true,
        discount: 22,
        category: 'Skincare'
      },
      {
        _id: '3',
        name: 'Luxury Facial Treatment',
        description: 'Rejuvenating facial treatment with gold mask and premium anti-aging serums',
        price: 3500,
        type: 'service',
        image: 'https://picsum.photos/400/300?random=3',
        rating: 4.8,
        duration: '90 min',
        premium: true,
        category: 'Facial'
      },
      {
        _id: '4',
        name: 'Hair Care Bundle',
        description: 'Complete hair care set with natural shampoo, conditioner, and nourishing oil',
        price: 1200,
        originalPrice: 1500,
        type: 'product',
        image: 'https://picsum.photos/400/300?random=4',
        rating: 4.6,
        inStock: true,
        discount: 20,
        category: 'Hair Care'
      },
      {
        _id: '5',
        name: 'Bridal Makeup Package',
        description: 'Complete bridal makeup with trial session and touch-up kit included',
        price: 8500,
        type: 'service',
        image: 'https://picsum.photos/400/300?random=5',
        rating: 4.9,
        duration: '4 hours',
        premium: true,
        category: 'Makeup'
      },
      {
        _id: '6',
        name: 'Vitamin C Serum',
        description: 'High-potency vitamin C serum for brightening and anti-aging benefits',
        price: 899,
        originalPrice: 1299,
        type: 'product',
        image: 'https://picsum.photos/400/300?random=6',
        rating: 4.5,
        inStock: true,
        discount: 31,
        category: 'Skincare'
      }
    ]);

    setGallery([
      {
        _id: '1',
        image: 'https://picsum.photos/600/400?random=10',
        caption: 'Modern salon interior with premium equipment',
        category: 'Interior'
      },
      {
        _id: '2',
        image: 'https://picsum.photos/600/400?random=11',
        caption: 'Professional styling session in progress',
        category: 'Services'
      },
      {
        _id: '3',
        image: 'https://picsum.photos/600/400?random=12',
        caption: 'Premium product collection showcase',
        category: 'Products'
      },
      {
        _id: '4',
        image: 'https://picsum.photos/600/400?random=13',
        caption: 'Before and after transformation',
        category: 'Results'
      },
      {
        _id: '5',
        image: 'https://picsum.photos/600/400?random=14',
        caption: 'Team of expert professionals',
        category: 'Team'
      },
      {
        _id: '6',
        image: 'https://picsum.photos/600/400?random=15',
        caption: 'Award-winning service recognition',
        category: 'Awards'
      }
    ]);
  }, [store]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
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

  const handleAppointment = (productId, productName) => {
    console.log('Booking appointment for:', productName);
  };

  const handleOrderProduct = (product) => {
    console.log('Ordering product:', product.name);
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
    // Implement chat functionality
    console.log('Starting chat with store:', enhancedStore?.storeName);
  };
// Add this before the existing return statement:
if (loading) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 size={48} className="animate-spin text-teal-600" />
    </div>
  );
}

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
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors duration-200 font-medium"
            >
              <ArrowLeft size={20} />
              <span>Back to Stores</span>
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={shareViaWebShare}
                className="flex items-center gap-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-100 transition-colors duration-200 font-medium"
              >
                <Share2 size={18} />
                Share
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <div className="flex items-center gap-3 mb-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
  {enhancedStore?.storeName || storeName}
</h1>
                {enhancedStore?.verified && (
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                    <CheckCircle size={32} className="text-teal-300" />
                  </div>
                )}
              </div>
              
              <p className="text-xl lg:text-2xl text-teal-100 mb-4 font-medium">
                {enhancedStore?.category}
              </p>
              
              <div className="flex items-center gap-2 text-white/90 mb-8">
                <MapPin size={20} />
                <span className="text-lg">{enhancedStore?.place}</span>
              </div>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Star size={18} className="text-yellow-400 fill-current" />
                  <span className="font-semibold">{enhancedStore?.averageRating}</span>
                  <span className="text-white/80">({enhancedStore?.numberOfRatings} reviews)</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock size={18} className="text-teal-300" />
                  <span className="text-white/90">{enhancedStore?.responseTime}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <TrendingUp size={18} className="text-green-400" />
                  <span className="text-white/90">{enhancedStore?.completedOrders}+ orders</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={onChatNow}
                  className="bg-white text-teal-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Conversation
                </button>
                <button
                  onClick={() => openPhone(enhancedStore?.phone)}
                  className="bg-teal-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-teal-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Call Now
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {enhancedStore?.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Content - Profile Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img
                    src={enhancedStore?.profileImage || 'https://picsum.photos/500/500?random=store'}
                    alt={enhancedStore?.storeName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Shield size={20} className="text-teal-600" />
                    <span className="text-sm font-semibold text-gray-800">Verified Business</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Bar */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{enhancedStore?.yearEstablished}</div>
                <div className="text-sm text-gray-500">Established</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{enhancedStore?.completedOrders}+</div>
                <div className="text-sm text-gray-500">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{enhancedStore?.rating}</div>
                <div className="text-sm text-gray-500">Star Rating</div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => openPhone(enhancedStore?.phone)}
                className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors duration-200 font-medium"
              >
                <Phone size={20} />
                Call
              </button>
              <button
                onClick={() => openWhatsapp(enhancedStore?.socialMedia?.whatsapp || enhancedStore?.phone)}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                <MessageCircle size={20} />
                WhatsApp
              </button>
              <button
                onClick={() => openInstagram(enhancedStore?.socialMedia?.instagram)}
                className="flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-xl hover:bg-pink-700 transition-colors duration-200 font-medium"
              >
                <Instagram size={20} />
                Instagram
              </button>
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
          <div className="space-y-8">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Our Products & Services
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our premium collection of products and professional services designed to meet your needs
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <div key={product._id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-teal-200">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Overlay badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.popular && (
                          <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                            🔥 Popular
                          </span>
                        )}
                        {product.premium && (
                          <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            ✨ Premium
                          </span>
                        )}
                        {product.discount && (
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            -{product.discount}%
                          </span>
                        )}
                      </div>

                      {/* Category */}
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/90 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                          {product.category}
                        </span>
                      </div>

                      {/* Like button */}
                      <button
                        onClick={() => toggleLike(product._id)}
                        className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                          likedProducts.has(product._id)
                            ? 'bg-red-500 text-white shadow-lg'
                            : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                        }`}
                      >
                        <Heart size={20} className={likedProducts.has(product._id) ? 'fill-current' : ''} />
                      </button>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-black group-hover:text-teal-600 transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-600">{product.rating}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                      {product.duration && (
                        <div className="flex items-center gap-2 mb-4">
                          <Clock size={16} className="text-teal-500" />
                          <span className="text-sm text-gray-600">{product.duration}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-black">₹{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-lg text-gray-500 line-through">₹{product.originalPrice}</span>
                          )}
                        </div>
                        {product.type === 'product' && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            product.inStock 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (product.type === 'service') {
                            handleAppointment(product._id, product.name);
                          } else {
                            handleOrderProduct(product);
                          }
                        }}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                          product.type === 'service'
                            ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg hover:shadow-xl'
                            : 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                        }`}
                        disabled={product.type === 'product' && !product.inStock}
                      >
                        {product.type === 'service' ? (
                          <>
                            <Calendar size={18} />
                            Book Appointment
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={18} />
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto border border-gray-100">
                    <ShoppingBag size={64} className="mx-auto mb-6 text-gray-300" />
                    <h3 className="text-2xl font-bold text-black mb-4">No Products Found</h3>
                    <p className="text-gray-600">
                      This store hasn't added any products yet. Check back later for amazing deals!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Gallery
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Take a look at our work, facilities, and the amazing results we deliver
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gallery && gallery.length > 0 ? (
                gallery.map((item, index) => (
                  <div key={item._id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-teal-200">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.caption}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-700 font-medium text-center">{item.caption}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto border border-gray-100">
                    <Image size={64} className="mx-auto mb-6 text-gray-300" />
                    <h3 className="text-2xl font-bold text-black mb-4">Gallery Coming Soon</h3>
                    <p className="text-gray-600">
                      Beautiful images showcasing our work will be added here soon!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <footer className="bg-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-teal-100 mb-8 text-lg">
            Contact us today to book your appointment or order your favorite products
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onChatNow}
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
  );
};

export default StoreProfile;