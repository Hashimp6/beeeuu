import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  ShoppingCart, 
  Clock, 
  Calendar, 
  Truck, 
  Settings, 
  Globe, 
  Menu,
  BarChart3,
  TrendingUp,
  MapPin,
  Image,
  Star,
  MessageCircle,
  Zap,
  Users,
  DollarSign,
  Smartphone,
  Tag,
  Percent,
  Timer,
  Sun,
  Moon,
  Coffee,
  Utensils,
  Gift,
  Target,
  Wifi,
  Edit3,
  Trash2,
  Plus,
  Eye,
  Navigation
} from 'lucide-react';

const WhatWeOffer = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeOffer, setActiveOffer] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Core Features - Primary Focus
  const coreFeatures = [
    {
      icon: QrCode,
      title: "QR Menu System",
      description: "100% contactless digital menus with instant access. Customers scan, browse, and order without touching physical menus or waiting for staff.",
      color: "from-teal-500 to-teal-700",
      stats: "Zero Contact",
      highlight: true
    },
    {
      icon: Wifi,
      title: "Live Ordering System", 
      description: "Real-time order processing with instant kitchen notifications. Orders appear live on kitchen screens with preparation status updates.",
      color: "from-teal-600 to-cyan-700",
      stats: "Instant Processing",
      highlight: true
    },
    {
      icon: MapPin,
      title: "Location-Based Offers",
      description: "Smart offer management that automatically shows deals to nearby customers. Target users within your radius with real-time promotions.",
      color: "from-teal-700 to-green-600",
      stats: "Geo-Targeted",
      highlight: true
    },
    {
      icon: Clock,
      title: "Collection Orders",
      description: "Streamlined pickup system with time slot booking and automated ready notifications for customers.",
      color: "from-gray-600 to-gray-800",
      stats: "30% Faster"
    },
    {
      icon: Calendar,
      title: "Table Reservation",
      description: "Smart booking system with real-time availability tracking and automated customer management.",
      color: "from-gray-700 to-black",
      stats: "Zero Conflicts"
    },
    {
      icon: Truck,
      title: "Delivery Management",
      description: "Direct delivery orders without third-party commissions. Keep 100% of your delivery revenue.",
      color: "from-teal-500 to-teal-600",
      stats: "No Commission"
    }
  ];

  // Additional Features
  const additionalFeatures = [
    {
      icon: Settings,
      title: "Order Management Hub",
      description: "Centralized dashboard for all orders with real-time status tracking and customer communication.",
      color: "from-gray-600 to-gray-700"
    },
    {
      icon: Globe,
      title: "Restaurant Website",
      description: "Professional responsive websites with integrated ordering system and menu management.",
      color: "from-teal-600 to-teal-700"
    },
    {
      icon: Menu,
      title: "Live Menu Updates",
      description: "Update dishes, prices, and availability instantly across all platforms in real-time.",
      color: "from-gray-700 to-gray-800"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive sales reports and business insights with detailed revenue tracking graphs.",
      color: "from-teal-500 to-teal-600"
    }
  ];

  // Offer Management Examples
  const offerTypes = [
    {
      icon: Sun,
      title: "Friday Deal",
      description: "Weekend kickstart with special combo offers",
      discount: "Buy 2 Get 1 Free",
      time: "All Day Friday",
      color: "from-teal-400 to-teal-600",
      category: "Weekend Special",
      actions: ["Edit", "Delete", "View Analytics"]
    },
    {
      icon: Moon,
      title: "Evening Special",
      description: "Happy hours with premium beverage discounts",
      discount: "40% OFF",
      time: "5 PM - 8 PM Daily",
      color: "from-gray-600 to-gray-800",
      category: "Happy Hours",
      actions: ["Edit", "Delete", "View Analytics"]
    },
    {
      icon: Timer,
      title: "Closing Deal",
      description: "Last-minute flash sale on remaining fresh items",
      discount: "50% OFF",
      time: "Last 30 Minutes",
      color: "from-teal-500 to-teal-700",
      category: "Flash Sale",
      actions: ["Edit", "Delete", "View Analytics"]
    },
    {
      icon: Gift,
      title: "Weekend Feast",
      description: "Saturday & Sunday family meal packages",
      discount: "₹999 Family Pack",
      time: "Sat-Sun All Day",
      color: "from-gray-700 to-black",
      category: "Family Deal",
      actions: ["Edit", "Delete", "View Analytics"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-50 to-gray-100 py-20 px-4 font-inter">
      <div className="max-w-7xl mx-auto">
        
        {/* Hero Header */}
        <div className={`text-center mb-20 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-teal-600 to-teal-800 rounded-3xl mb-8 shadow-2xl transform hover:scale-110 transition-all duration-500">
            <QrCode className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-gray-900 via-teal-700 to-black bg-clip-text text-transparent mb-6 tracking-tight">
            What We Offer
          </h1>
          <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
            Revolutionary restaurant management platform with <span className="font-bold text-teal-700">100% contactless ordering</span> and intelligent offer management
          </p>
        </div>

        {/* Highlight Banner */}
        <div className={`mb-16 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-gray-600/20 animate-pulse"></div>
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">🚀 Our Highlight Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <QrCode className="w-8 h-8 text-white mb-3 mx-auto" />
                  <h3 className="font-bold text-white mb-2">Fully Online Contactless Ordering</h3>
                  <p className="text-teal-100 text-sm">Complete QR code-based ordering system with zero physical contact required</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <MapPin className="w-8 h-8 text-white mb-3 mx-auto" />
                  <h3 className="font-bold text-white mb-2">Dedicated Offer Management</h3>
                  <p className="text-teal-100 text-sm">Location-based offers that reach nearby customers with real-time deals</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Features Grid - Main Focus */}
        <div className={`mb-20 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h3 className="text-4xl font-black text-center mb-12 bg-gradient-to-r from-teal-700 to-gray-900 bg-clip-text text-transparent">
            Core Platform Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              
              return (
                <div
                  key={index}
                  className={`group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transform transition-all duration-700 cursor-pointer overflow-hidden border-2 ${
                    feature.highlight 
                      ? 'border-teal-200 shadow-teal-100/50' 
                      : 'border-gray-100'
                  } ${
                    isActive ? 'scale-105 -rotate-1' : 'hover:-translate-y-3 hover:rotate-1'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  {/* Highlight Ring for Important Features */}
                  {feature.highlight && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  )}
                  
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  {/* Icon */}
                  <div className={`relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r ${feature.color} mb-6 transform transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-lg`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>

                  {/* Content */}
                  <h4 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-teal-700 transition-colors duration-300">
                    {feature.title}
                  </h4>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed text-base">
                    {feature.description}
                  </p>

                  {/* Stats Badge */}
                  <div className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold bg-gradient-to-r ${feature.color} text-white transform transition-all duration-300 group-hover:scale-105`}>
                    {feature.stats || "Enhanced"}
                  </div>

                  {/* Priority Indicator */}
                  {feature.highlight && (
                    <div className="absolute top-4 right-4">
                      <div className="w-3 h-3 bg-teal-500 rounded-full animate-ping"></div>
                      <div className="absolute top-0 w-3 h-3 bg-teal-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Smart Offer Management Section */}
        <div className={`mb-20 transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-600 to-gray-800 rounded-2xl mb-6 shadow-xl">
              <Tag className="w-8 h-8 text-white animate-bounce" />
            </div>
            <h3 className="text-4xl font-black bg-gradient-to-r from-teal-700 via-gray-800 to-black bg-clip-text text-transparent mb-6">
              Smart Offer Management
            </h3>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
              Create, edit, and manage <span className="font-bold text-teal-700">location-based offers</span> that automatically reach nearby customers. 
              Restaurant owners have full control to create short-time deals and track performance.
            </p>
          </div>

          {/* Offer Control Features */}
          <div className="bg-gradient-to-r from-gray-900 via-teal-800 to-black rounded-3xl p-8 mb-12 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Plus className="w-8 h-8 text-teal-300 mx-auto mb-3" />
                <h4 className="font-bold text-white mb-2">Create Offers</h4>
                <p className="text-gray-300 text-sm">Set up time-based deals with custom discounts and target radius</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Edit3 className="w-8 h-8 text-white mx-auto mb-3" />
                <h4 className="font-bold text-white mb-2">Edit & Control</h4>
                <p className="text-gray-300 text-sm">Modify offers in real-time, adjust pricing and availability instantly</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <BarChart3 className="w-8 h-8 text-teal-300 mx-auto mb-3" />
                <h4 className="font-bold text-white mb-2">Track Performance</h4>
                <p className="text-gray-300 text-sm">Monitor offer success rates and customer engagement analytics</p>
              </div>
            </div>
          </div>

          {/* Live Offer Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offerTypes.map((offer, index) => {
              const Icon = offer.icon;
              const isActive = activeOffer === index;
              
              return (
                <div
                  key={index}
                  className={`group relative bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100 hover:border-teal-200 transform transition-all duration-500 cursor-pointer overflow-hidden ${
                    isActive ? 'scale-105 shadow-2xl' : 'hover:-translate-y-2'
                  }`}
                  onMouseEnter={() => setActiveOffer(index)}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${offer.color} transform transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
                      {offer.category}
                    </div>
                  </div>

                  {/* Content */}
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {offer.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    {offer.description}
                  </p>

                  {/* Offer Details */}
                  <div className="space-y-2 mb-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${offer.color} text-white`}>
                      {offer.discount}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock className="w-3 h-3 mr-1" />
                      {offer.time}
                    </div>
                  </div>

                  {/* Management Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <button className="p-1.5 bg-teal-50 hover:bg-teal-100 rounded-lg text-teal-600 hover:text-teal-700 transition-colors">
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-700 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <button className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-700 transition-colors">
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Location Targeting Showcase */}
          <div className="mt-12 bg-gradient-to-r from-teal-50 to-gray-50 rounded-3xl p-8 border border-teal-100">
            <div className="text-center mb-6">
              <Navigation className="w-10 h-10 text-teal-600 mx-auto mb-3" />
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Location-Based Targeting</h4>
              <p className="text-gray-700">Your offers automatically reach customers within your chosen radius</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-teal-600">500m</div>
                <div className="text-sm text-gray-600">Immediate Area</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-teal-600">2km</div>
                <div className="text-sm text-gray-600">Extended Reach</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-teal-600">5km+</div>
                <div className="text-sm text-gray-600">City Coverage</div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features - Secondary */}
        <div className={`mb-16 transform transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Additional Platform Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform transition-all duration-500 hover:-translate-y-1 border border-gray-100"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} mb-4 transform transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final CTA */}
        <div className={`text-center transform transition-all duration-1000 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-gradient-to-r from-teal-600 via-gray-800 to-black rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 to-gray-600/10 animate-pulse"></div>
            <div className="relative z-10">
              <h3 className="text-4xl font-bold text-white mb-4">
                Transform Your Restaurant Today
              </h3>
              <p className="text-gray-200 mb-8 max-w-3xl mx-auto text-lg">
                Join the contactless revolution with smart QR ordering and location-based offers that drive real results
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button className="px-10 py-5 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl text-lg">
                  Start Free Trial
                </button>
                <button className="px-10 py-5 border-2 border-white text-white rounded-2xl font-bold hover:bg-white hover:text-gray-900 transform hover:-translate-y-1 transition-all duration-300 text-lg">
                  See Live Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default WhatWeOffer;