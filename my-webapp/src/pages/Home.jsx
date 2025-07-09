import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  CreditCard, 
  Star, 
  Users, 
  Zap,
  ChevronRight,
  Store,
  Clock,
  Shield,
  ArrowRight,
  Package,
  CheckCircle,
  Search,
  Heart,
  Handshake,
  TrendingUp,
  Globe,
  Award,
  Target,
  Sparkles,
  Instagram,
  Mail,
  Phone,
  Menu,
  X,
  Truck,
  PhoneCall
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Header Component
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-2xl border-b border-teal-100' 
        : 'bg-white shadow-xl border-b-2 border-teal-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2 relative">
              <img 
                src="/logo.png" 
                alt="Your Logo" 
                className="h-8 sm:h-12 object-contain"
              />
              <p className="absolute left-12 top-8 text-[8px] sm:text-[10px] text-gray-400 hidden sm:block">
                Made in Kerala
              </p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          {/* <div className="hidden lg:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-teal-600 font-semibold transition-colors">
              Marketplace
            </a>
            <a href="#" className="text-gray-700 hover:text-teal-600 font-semibold transition-colors">
              Sell
            </a>
            <a href="#" className="text-gray-700 hover:text-teal-600 font-semibold transition-colors">
              Services
            </a>
            <a href="#" className="text-gray-700 hover:text-teal-600 font-semibold transition-colors">
              About
            </a>
          </div> */}
          
          {/* Desktop Buttons */}
          <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
          <button
        onClick={() => navigate("/login")}
        className="text-gray-800 hover:text-teal-600 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-bold transition-all duration-300 hover:bg-teal-50"
      >
        Login
      </button>
            <button  onClick={() => navigate("/home")} className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-teal-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-teal-100 animate-slide-down">
            <div className="px-4 py-6 space-y-4">
              <a href="#" className="block text-gray-700 hover:text-teal-600 font-semibold transition-colors">
                Marketplace
              </a>
              <a href="#" className="block text-gray-700 hover:text-teal-600 font-semibold transition-colors">
                Sell
              </a>
              <a href="#" className="block text-gray-700 hover:text-teal-600 font-semibold transition-colors">
                Services
              </a>
              <a href="#" className="block text-gray-700 hover:text-teal-600 font-semibold transition-colors">
                About
              </a>
              <div className="flex flex-col space-y-3 pt-4">
                <button   onClick={() => navigate("/login")} className="text-gray-800 hover:text-teal-600 px-6 py-3 rounded-xl text-base font-bold transition-all duration-300 hover:bg-teal-50 text-center">
                  Login
                </button>
                <button   onClick={() => navigate("/login")} className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-3 rounded-xl text-base font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Hero Section Component



const HeroSection = () => {
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [particles, setParticles] = useState([]);

  // Auto-flip cards every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleCardTransition();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Generate particles for animation
  const generateParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 2,
        delay: Math.random() * 1,
        duration: Math.random() * 2 + 1.5,
        opacity: Math.random() * 0.7 + 0.3
      });
    }
    return newParticles;
  };

  const handleCardTransition = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setParticles(generateParticles());
    
    setTimeout(() => {
      setCurrentCard(prev => (prev + 1) % 2);
    }, 1000);
    
    setTimeout(() => {
      setIsTransitioning(false);
      setParticles([]);
    }, 2500);
  };

  const AppointmentCard = () => (
    <div className="relative">
      {/* String */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 sm:-translate-y-12">
        <div className="w-0.5 h-8 sm:h-12 bg-gradient-to-b from-gray-600 to-gray-400 rounded-full shadow-sm"></div>
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-700 rounded-full shadow-md"></div>
      </div>
      
      <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl relative overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
        
        <div className="flex items-center justify-between mb-4 sm:mb-6 relative z-10">
          <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-bold">
            Your Appointment
          </h2>
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
        </div>
        
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6 shadow-xl relative z-10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-lg sm:text-xl lg:text-2xl">✨</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">Glamio Beauty Studio</h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-500 font-medium">0.6 km away</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 bg-yellow-50 px-2 sm:px-3 py-1 sm:py-2 rounded-full animate-bounce">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
              <span className="text-xs sm:text-sm font-bold text-gray-900">4.9</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border border-pink-200 hover:shadow-lg transition-shadow duration-300">
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Hair Coloring</p>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">₹2,500</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border border-purple-200 hover:shadow-lg transition-shadow duration-300">
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Booking at</p>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">Today 3:00 PM</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/20 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 text-white border border-white/30 relative z-10 hover:bg-white/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base lg:text-lg font-semibold">Chat Now</span>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              <span className="text-sm sm:text-base lg:text-lg font-bold">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const OrderCard = () => (
    <div className="relative">
      {/* String */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 sm:-translate-y-12">
        <div className="w-0.5 h-8 sm:h-12 bg-gradient-to-b from-gray-600 to-gray-400 rounded-full shadow-sm"></div>
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-700 rounded-full shadow-md"></div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl relative overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
        
        <div className="flex items-center justify-between mb-4 sm:mb-6 relative z-10">
          <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-bold">
            Your Order
          </h2>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <span className="text-xs sm:text-sm text-white font-medium">Live</span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 mb-4 sm:mb-6 shadow-xl relative z-10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-lg sm:text-xl lg:text-2xl">🍕</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">Spice Route Kitchen</h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-500 font-medium">1.2 km away</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 bg-green-50 px-2 sm:px-3 py-1 sm:py-2 rounded-full animate-bounce">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 fill-current" />
              <span className="text-xs sm:text-sm font-bold text-gray-900">Confirmed</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border border-orange-200 hover:shadow-lg transition-shadow duration-300">
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Order Total</p>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">₹425</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border border-blue-200 hover:shadow-lg transition-shadow duration-300">
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Delivery in</p>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">25 mins</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/20 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 text-white border border-white/30 relative z-10 hover:bg-white/30 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base lg:text-lg font-semibold">Track Order</span>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              <span className="text-sm sm:text-base lg:text-lg font-bold">On the way</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="pt-20 sm:pt-32 pb-12 sm:pb-24 bg-gradient-to-br from-gray-50 via-white to-teal-50 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 opacity-20 sm:opacity-30">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-32 sm:w-72 h-32 sm:h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-20 sm:top-40 right-5 sm:right-10 w-32 sm:w-72 h-32 sm:h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-float-delayed"></div>
        <div className="absolute bottom-10 sm:bottom-20 left-1/2 w-32 sm:w-72 h-32 sm:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float-slow"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center bg-gradient-to-r from-teal-500 to-teal-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-bold mb-6 sm:mb-8 shadow-lg animate-bounce">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
              Buy Anything. Sell Anything. Book Any Service.
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 mb-4 sm:mb-6 lg:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent animate-pulse">
                Everything
              </span> Near You.
              <br />
              On <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent animate-pulse delay-500">
                Your Platform
              </span>.
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-2xl font-medium leading-relaxed">
              <strong className="text-gray-900">Find What You Need. Sell What You Have. All From Where You Are.</strong>
              <br className="hidden sm:block" />
              <span className="text-sm sm:text-base lg:text-lg xl:text-xl">
                Your complete local marketplace for products, services, and everything in between.
              </span>
            </p>
            
            {/* Made in Kerala Badge */}
            <div className="inline-flex items-center bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base lg:text-lg font-semibold mb-6 sm:mb-8 shadow-md hover:shadow-xl transition-shadow duration-300 animate-fade-in">
              <span className="animate-pulse">🌟</span>
              <span className="ml-2">Explore now</span>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start mb-8 sm:mb-12">
              <button   onClick={() => navigate("/home")} className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg lg:text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center">
                  Start Selling Today
                  <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
              <button className="border-2 sm:border-3 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg lg:text-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                Explore Marketplace
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8 text-sm sm:text-base text-gray-600">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                </div>
                <span className="font-semibold">Local Community</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center animate-pulse delay-300">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </div>
                <span className="font-semibold">Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center animate-pulse delay-500">
                  <Handshake className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <span className="font-semibold">Direct Chat</span>
              </div>
            </div>
          </div>
          
          {/* Right Content - Hanging Cards Animation */}
          <div className="relative order-1 lg:order-2 mb-8 lg:mb-0">
            {/* Particle System */}
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute pointer-events-none z-20"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  opacity: particle.opacity,
                  animation: `particle-float ${particle.duration}s ease-out ${particle.delay}s both`
                }}
              >
                <div className="w-full h-full bg-gradient-to-r from-teal-400 to-purple-500 rounded-full animate-pulse"></div>
              </div>
            ))}
            
            {/* Hanging Cards Container */}
            <div className="relative min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
              {/* Current Card */}
              <div 
                className={`absolute inset-0 transition-all duration-1000 ease-out ${
                  isTransitioning ? 'animate-hanging-exit' : 'animate-hanging-enter'
                }`}
                style={{
                  transformOrigin: 'top center',
                  zIndex: isTransitioning ? 5 : 10
                }}
              >
                <div className="animate-gentle-swing">
                  {currentCard === 0 ? <AppointmentCard /> : <OrderCard />}
                </div>
              </div>
              
              {/* Next Card (during transition) */}
              {isTransitioning && (
                <div 
                  className="absolute inset-0 animate-hanging-enter-delayed"
                  style={{
                    transformOrigin: 'top center',
                    zIndex: 8
                  }}
                >
                  <div className="animate-gentle-swing">
                    {currentCard === 1 ? <AppointmentCard /> : <OrderCard />}
                  </div>
                </div>
              )}
            </div>
            
            {/* Enhanced Card Switcher Dots */}
            <div className="flex justify-center mt-6 space-x-3 relative z-20">
              {[0, 1].map((index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (currentCard !== index && !isTransitioning) {
                      setIsTransitioning(true);
                      setParticles(generateParticles());
                      setTimeout(() => {
                        setCurrentCard(index);
                      }, 1000);
                      setTimeout(() => {
                        setIsTransitioning(false);
                        setParticles([]);
                      }, 2500);
                    }
                  }}
                  className={`relative transition-all duration-300 ${
                    currentCard === index 
                      ? 'w-8 h-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full scale-125' 
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400 rounded-full'
                  }`}
                >
                  {currentCard === index && (
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Enhanced Floating elements */}
            <div className="absolute -top-3 -right-3 sm:-top-6 sm:-right-6 bg-white rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-2xl animate-float z-20">
              {currentCard === 0 ? (
                <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-teal-600" />
              ) : (
                <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-600" />
              )}
            </div>
            <div className="absolute -bottom-3 -left-3 sm:-bottom-6 sm:-left-6 bg-white rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-2xl animate-float-delayed z-20">
              <MapPin className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-teal-600" />
            </div>
            <div className="absolute top-1/2 -right-4 sm:-right-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 sm:p-3 shadow-lg animate-spin-slow z-20">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes particle-float {
          0% { 
            transform: translateY(0px) scale(0); 
            opacity: 1; 
          }
          50% { 
            transform: translateY(-50px) scale(1); 
            opacity: 0.8; 
          }
          100% { 
            transform: translateY(-100px) scale(0); 
            opacity: 0; 
          }
        }
        
        @keyframes gentle-swing {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(1deg); }
          75% { transform: rotate(-1deg); }
        }
        
        @keyframes hanging-enter {
          0% { 
            transform: translateY(-100px) rotate(-10deg) scale(0.8); 
            opacity: 0; 
          }
          50% { 
            transform: translateY(20px) rotate(5deg) scale(1.05); 
            opacity: 0.8; 
          }
          100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
            opacity: 1; 
          }
        }
        
        @keyframes hanging-enter-delayed {
          0% { 
            transform: translateY(-120px) rotate(-15deg) scale(0.7); 
            opacity: 0; 
          }
          60% { 
            transform: translateY(-120px) rotate(-15deg) scale(0.7); 
            opacity: 0; 
          }
          80% { 
            transform: translateY(25px) rotate(8deg) scale(1.08); 
            opacity: 0.9; 
          }
          100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
            opacity: 1; 
          }
        }
        
        @keyframes hanging-exit {
          0% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
            opacity: 1; 
          }
          50% { 
            transform: translateY(-20px) rotate(-8deg) scale(0.95); 
            opacity: 0.7; 
          }
          100% { 
            transform: translateY(-150px) rotate(-20deg) scale(0.6); 
            opacity: 0; 
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-gentle-swing {
          animation: gentle-swing 4s ease-in-out infinite;
        }
        
        .animate-hanging-enter {
          animation: hanging-enter 2s ease-out forwards;
        }
        
        .animate-hanging-enter-delayed {
          animation: hanging-enter-delayed 2.5s ease-out forwards;
        }
        
        .animate-hanging-exit {
          animation: hanging-exit 1s ease-in forwards;
        }
        
        @media (max-width: 640px) {
          .animate-gentle-swing {
            animation: gentle-swing 5s ease-in-out infinite;
          }
        }
      `}</style>
    </section>
  );
};



// Value Proposition Component
const ValueProposition = () => {
  const values = [
    {
      icon: <Search className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />,
      title: "Find Anything",
      description: "From groceries to gadgets, services to supplies - discover everything you need in your local area",
      gradient: "from-green-500 to-emerald-600",
      hoverColor: "hover:border-green-200"
    },
    {
      icon: <Package className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />,
      title: "Sell Everything",
      description: "List products, offer services, rent items - turn anything you have into income",
      gradient: "from-blue-500 to-indigo-600",
      hoverColor: "hover:border-blue-200"
    },
    {
      icon: <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />,
      title: "Connect Instantly",
      description: "Chat directly with buyers and sellers for the best customer experience",
      gradient: "from-purple-500 to-pink-600",
      hoverColor: "hover:border-purple-200"
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 mb-4 sm:mb-6 animate-fade-in">
            Buy Anything. Sell Anything. Book Any Service.
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 font-medium animate-fade-in delay-300">
            Everything Near You — All in One Place
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {values.map((value, index) => (
            <div 
              key={index}
              className={`bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl text-center transform hover:scale-105 transition-all duration-300 border-2 border-transparent ${value.hoverColor} animate-fade-in`}
              style={{animationDelay: `${index * 200}ms`}}
            >
              <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${value.gradient} rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg animate-pulse`}>
                {value.icon}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{value.title}</h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features Component
const Features = () => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: <Store className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: "Create Your Store",
      description: "Set up your digital storefront in minutes and start selling anything",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: <Package className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: "List Everything",
      description: "Products, services, rentals - if you have it, someone needs it",
      gradient: "from-green-500 to-teal-600"
    },
    {
      icon: <Calendar className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: "Smart Booking",
      description: "Accept appointments and manage your schedule effortlessly",
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10" />,
      title: "Chat & Connect",
      description: "Build relationships with instant messaging and customer support",
      gradient: "from-pink-500 to-rose-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-teal-600/20 to-blue-600/20"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 sm:mb-6 lg:mb-8 animate-fade-in">
            Everything You Need to
            <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent"> Succeed</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto font-medium animate-fade-in delay-300">
            Powerful tools to help you sell more, serve better, and grow faster
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 transition-all duration-500 cursor-pointer transform hover:scale-105 animate-fade-in ${
                currentFeature === index 
                  ? 'border-teal-400 bg-gradient-to-br from-teal-400/20 to-blue-400/20 shadow-2xl' 
                  : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
              }`}
              style={{animationDelay: `${index * 200}ms`}}
            >
              <div className={`text-white mb-4 sm:mb-6 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg animate-pulse`}>
                {feature.icon}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{feature.title}</h3>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Stats Component
const Stats = () => {
  const stats = [
    { number: "10K+", label: "Active Stores soon", icon: <Store className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { number: "50K+", label: "Products & Services soon", icon: <Package className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { number: "25K+", label: "Happy Customers soon", icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" /> },
    { number: "99.9%", label: "Success Rate soon", icon: <Award className="w-6 h-6 sm:w-8 sm:h-8" /> }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center text-white transform hover:scale-110 transition-all duration-300 animate-fade-in"
              style={{animationDelay: `${index * 150}ms`}}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-pulse">
                {stat.icon}
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-2 sm:mb-3">{stat.number}</div>
              <div className="text-teal-100 text-sm sm:text-base lg:text-lg font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const navigate = useNavigate();
  const sellingProcess = [
    {
      step: "01",
      title: "Create Your Store",
      description: "Set up your digital storefront and customize it to reflect your brand",
      icon: <Store className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      details: "Add photos, write descriptions, set your hours",
      color: "from-blue-500 to-indigo-600"
    },
    {
      step: "02",
      title: "Add Your Product / Service",
      description: "List products to sell or services to book - anything goes!",
      icon: <Package className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      details: "Products, services, rentals - you name it",
      color: "from-green-500 to-teal-600"
    },
    {
      step: "03",
      title: "Get Order / Appointmet and Chat with them",
      description: "Chat with customers, accept payments, and grow your business",
      icon: <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      details: "Real-time messaging, secure payments, reviews",
      color: "from-purple-500 to-pink-600"
    }
  ];

  const buyingProcess = [
    {
      step: "01",
      title: "Search & Discover",
      description: "Find exactly what you need from local businesses and individuals",
      icon: <Search className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      details: "Browse categories, filter by location, compare prices",
      color: "from-orange-500 to-red-600"
    },
    {
      step: "02",
      title: "Chat & Connect",
      description: "Message sellers directly to ask questions and negotiate",
      icon: <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      details: "Instant messaging, photo sharing, voice notes",
      color: "from-teal-500 to-blue-600"
    },
    {
      step: "03",
      title: "Buy & Enjoy",
      description: "Complete your purchase safely and leave a review",
      icon: <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      details: "Secure payments, delivery tracking, satisfaction guaranteed",
      color: "from-green-500 to-emerald-600"
    }
  ];

  const [activeTab, setActiveTab] = useState('selling');

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 mb-4 sm:mb-6 lg:mb-8 animate-fade-in">
            How It <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto font-medium animate-fade-in delay-300">
            Getting started is easier than you think
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 sm:mb-12 lg:mb-16">
          <div className="bg-gray-100 rounded-full p-2 sm:p-3 shadow-lg">
            <div className="flex space-x-2 sm:space-x-4">
              <button
                onClick={() => setActiveTab('selling')}
                className={`px-4 sm:px-8 py-2 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'selling'
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                For Sellers
              </button>
              <button
                onClick={() => setActiveTab('buying')}
                className={`px-4 sm:px-8 py-2 sm:py-4 rounded-full font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'buying'
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                For Buyers
              </button>
            </div>
          </div>
        </div>
        
        {/* Process Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {(activeTab === 'selling' ? sellingProcess : buyingProcess).map((item, index) => (
            <div
              key={index}
              className="relative bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 border-2 border-gray-100 hover:border-teal-200 animate-fade-in"
              style={{animationDelay: `${index * 200}ms`}}
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg">
                {item.step}
              </div>
              
              {/* Icon */}
              <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${item.color} rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white shadow-lg animate-pulse`}>
                {item.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">{item.title}</h3>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed text-center mb-4 sm:mb-6">{item.description}</p>
              <p className="text-sm sm:text-base text-gray-500 text-center font-medium bg-gray-50 px-4 py-2 rounded-lg">{item.details}</p>
              
              {/* Connector Arrow */}
              {index < (activeTab === 'selling' ? sellingProcess : buyingProcess).length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-5 text-gray-300">
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 sm:mt-16 lg:mt-20">
          <button  onClick={() => navigate("/newStore")} className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl lg:text-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl">
            {activeTab === 'selling' ? 'Start Selling Now' : 'Start Shopping Now'}
          </button>
        </div>
      </div>
    </section>
  );
};

// Testimonials Component
const Testimonials = () => {
  const testimonials = [
    {
      name: "Priya Nair",
      role: "Beauty Salon Owner",
      location: "Kochi, Kerala",
      image: "https://images.unsplash.com/photo-1494790108755-2616c53e77b3?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "This platform transformed my beauty salon business. I'm now booking 3x more appointments and my customers love the easy chat feature!",
      business: "Glamio Beauty Studio"
    },
    {
      name: "Rajesh Kumar",
      role: "Electronics Store",
      location: "Ernakulam, Kerala",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "I've sold over ₹2 lakhs worth of electronics in just 3 months. The local reach and instant messaging make all the difference.",
      business: "Tech Hub Electronics"
    },
    {
      name: "Meera Pillai",
      role: "Home Baker",
      location: "Thrissur, Kerala",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "From my kitchen to 500+ happy customers! This platform helped me turn my passion into a profitable business.",
      business: "Sweet Dreams Bakery"
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 mb-4 sm:mb-6 lg:mb-8 animate-fade-in">
            Success <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">Stories</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto font-medium animate-fade-in delay-300">
            Real people, real businesses, real results
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 border-2 border-gray-100 hover:border-teal-200 animate-fade-in"
              style={{animationDelay: `${index * 200}ms`}}
            >
              {/* Rating */}
              <div className="flex items-center mb-4 sm:mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 font-medium">
                "{testimonial.text}"
              </p>
              
              {/* Profile */}
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover shadow-lg mr-4 sm:mr-6"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-base sm:text-lg">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm sm:text-base">{testimonial.business}</p>
                  <p className="text-gray-500 text-xs sm:text-sm font-medium">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section Component
const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-16 sm:py-20 lg:py-32 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-6 sm:mb-8 lg:mb-10 animate-fade-in">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-teal-100 mb-8 sm:mb-10 lg:mb-12 font-medium animate-fade-in delay-300">
            Join thousands of local businesses already growing with our platform.
            <br className="hidden sm:block" />
            Start your journey today!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8 sm:mb-12 lg:mb-16">
            <button   onClick={() => navigate("/home")} className="bg-white text-teal-700 px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl lg:text-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl w-full sm:w-auto">
              Start Selling Today
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-teal-700 px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl lg:text-2xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
              Explore Marketplace
            </button>
          </div>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-teal-100">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-base font-semibold">100% Secure</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-base font-semibold">Setup in 5 mins</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-base font-semibold">Made in Kerala</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <img src="/logo.png" alt="Your Logo" className="h-8 sm:h-12 object-contain" />
              <span className="text-lg sm:text-xl font-bold">YourPlatform</span>
            </div>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 max-w-md">
              Your complete local marketplace for buying anything, selling everything, and booking any service - all in one place.
            </p>
            
<div className="flex space-x-4 sm:space-x-6">
  {/* Instagram */}
  <a
    href="https://www.instagram.com/serchby?igsh=MXVvYWdyY2M2bWNkcw=="
    className="text-gray-400 hover:text-pink-500 transition-colors"
    target="_blank"
    rel="noopener noreferrer"
  >
    <Instagram className="w-6 h-6 sm:w-8 sm:h-8" />
  </a>

  {/* Phone */}
  <a
    href="tel:+917012455400"
    className="text-gray-400 hover:text-green-400 transition-colors"
  >
    <Phone className="w-6 h-6 sm:w-8 sm:h-8" />
  </a>

  {/* WhatsApp (using MessageCircle as Lucide doesn’t have a real WhatsApp icon) */}
  <a
    href="https://wa.me/917012455400"
    className="text-gray-400 hover:text-green-500 transition-colors"
    target="_blank"
    rel="noopener noreferrer"
  >
    <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />
  </a>
</div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-base sm:text-lg">Marketplace</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-base sm:text-lg">Start Selling</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-base sm:text-lg">Book Services</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-base sm:text-lg">How It Works</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-base sm:text-lg">Support</a></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
  <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Contact Us</h3>
  <ul className="space-y-2 sm:space-y-3 text-gray-400 text-base sm:text-lg">
    <li className="flex items-center space-x-2">
      <PhoneCall className="w-4 h-4 text-green-500" />
      <a href="https://wa.me/917012455400" target="_blank" rel="noopener noreferrer">
        +91 7012455400
      </a>
    </li>
    <li className="flex items-center space-x-2">
      <Mail className="w-4 h-4 text-blue-500" />
      <a href="mailto:contactserchby@gmail.com">contactserchby@gmail.com</a>
    </li>
    
    <li>Kerala, India</li>
  </ul>
</div>

        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-0">
            © 2025 SerchBy. All rights reserved. Made with ❤️ in Kerala
          </p>
          <div className="flex space-x-4 sm:space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
const App = () => {
  return (
    <div className="min-h-screen bg-white">
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-down {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
      `}</style>
      <Header/>
      <HeroSection/>
      <ValueProposition/>
      <Features/>
      <Stats/>
      <HowItWorks />
      {/* <Testimonials /> */}
      <CTASection />
      <Footer />
    </div>
  );
};

export default App;