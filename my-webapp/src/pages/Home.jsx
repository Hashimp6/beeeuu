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
  Truck
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
          <div className="hidden lg:flex items-center space-x-8">
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
          </div>
          
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
                <button className="text-gray-800 hover:text-teal-600 px-6 py-3 rounded-xl text-base font-bold transition-all duration-300 hover:bg-teal-50 text-center">
                  Login
                </button>
                <button className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-3 rounded-xl text-base font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
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


const HeroSection = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [particles, setParticles] = useState([]);
  const [fallingStars, setFallingStars] = useState([]);
  const [magicOrbs, setMagicOrbs] = useState([]);

  // Auto-flip cards every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleCardTransition();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Generate magic orbs continuously
  useEffect(() => {
    const generateMagicOrbs = () => {
      const newOrbs = [];
      for (let i = 0; i < 2; i++) {
        newOrbs.push({
          id: Date.now() + i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 20 + 10,
          delay: Math.random() * 3,
          duration: Math.random() * 4 + 3,
          color: ['from-purple-400', 'from-teal-400', 'from-pink-400', 'from-blue-400'][Math.floor(Math.random() * 4)],
          opacity: Math.random() * 0.7 + 0.3
        });
      }
      setMagicOrbs(prev => [...prev, ...newOrbs]);
    };

    const interval = setInterval(generateMagicOrbs, 2000);
    
    const cleanup = setInterval(() => {
      setMagicOrbs(prev => prev.filter(orb => Date.now() - orb.id < 7000));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(cleanup);
    };
  }, []);

  // Enhanced falling stars with more variety
  useEffect(() => {
    const generateFallingStars = () => {
      const newStars = [];
      for (let i = 0; i < 4; i++) {
        newStars.push({
          id: Date.now() + i,
          x: Math.random() * 100,
          delay: Math.random() * 2,
          size: Math.random() * 6 + 3,
          rotation: Math.random() * 360,
          opacity: Math.random() * 0.8 + 0.4,
          type: ['star', 'diamond', 'heart', 'sparkle'][Math.floor(Math.random() * 4)],
          color: ['text-yellow-400', 'text-purple-400', 'text-pink-400', 'text-teal-400'][Math.floor(Math.random() * 4)]
        });
      }
      setFallingStars(prev => [...prev, ...newStars]);
    };

    const interval = setInterval(generateFallingStars, 1200);
    
    const cleanup = setInterval(() => {
      setFallingStars(prev => prev.filter(star => Date.now() - star.id < 4000));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(cleanup);
    };
  }, []);

  // Enhanced particles with more dynamic behavior
  const generateParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 1.5,
        duration: Math.random() * 3 + 2,
        opacity: Math.random() * 0.8 + 0.4,
        direction: Math.random() > 0.5 ? 1 : -1,
        type: Math.random() > 0.6 ? 'burst' : 'float'
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
    }, 3000);
  };

  // YOUR EXISTING APPOINTMENT AND ORDER CARDS GO HERE
  const AppointmentCard = () => (
    <div className="relative">
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
      {/* Enhanced Animated Background with Morphing Blobs */}
      <div className="absolute inset-0 opacity-20 sm:opacity-30">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-r from-teal-300 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-morphing-blob"></div>
        <div className="absolute top-20 sm:top-40 right-5 sm:right-10 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-r from-blue-300 to-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-morphing-blob-delayed"></div>
        <div className="absolute bottom-10 sm:bottom-20 left-1/2 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-r from-purple-300 to-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-morphing-blob-slow"></div>
        <div className="absolute top-1/2 left-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full mix-blend-multiply filter blur-xl animate-pulsing-orb"></div>
      </div>

      {/* Magic Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {magicOrbs.map((orb) => (
          <div
            key={orb.id}
            className="absolute animate-magic-orb-float"
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              animationDelay: `${orb.delay}s`,
              animationDuration: `${orb.duration}s`,
              opacity: orb.opacity
            }}
          >
            <div 
              className={`bg-gradient-to-r ${orb.color} to-transparent rounded-full animate-magic-pulse filter blur-sm`}
              style={{ width: `${orb.size}px`, height: `${orb.size}px` }}
            />
          </div>
        ))}
      </div>

      {/* Enhanced Falling Stars/Glitter Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {fallingStars.map((star) => (
          <div
            key={star.id}
            className="absolute animate-magical-fall z-30"
            style={{
              left: `${star.x}%`,
              top: '-20px',
              animationDelay: `${star.delay}s`,
              animationDuration: '4s',
              fontSize: `${star.size}px`,
              transform: `rotate(${star.rotation}deg)`,
              opacity: star.opacity
            }}
          >
            {star.type === 'star' && (
              <div className={`${star.color} animate-rainbow-twinkle filter drop-shadow-lg`}>
                ⭐
              </div>
            )}
            {star.type === 'diamond' && (
              <div className={`${star.color} animate-rainbow-twinkle filter drop-shadow-lg`}>
                💎
              </div>
            )}
            {star.type === 'heart' && (
              <div className={`${star.color} animate-rainbow-twinkle filter drop-shadow-lg`}>
                💖
              </div>
            )}
            {star.type === 'sparkle' && (
              <div className="bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-rainbow-spin filter drop-shadow-lg"
                   style={{ width: `${star.size}px`, height: `${star.size}px` }}>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-bold mb-6 sm:mb-8 shadow-lg animate-rainbow-bounce relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-rainbow-shimmer"></div>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-rainbow-spin" />
              <span className="relative z-10">Buy Anything. Sell Anything. Book Any Service.</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 mb-4 sm:mb-6 lg:mb-8 leading-tight">
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 bg-clip-text text-transparent animate-text-rainbow">
                Everything
              </span> Near You.
              <br />
              On <span className="bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-text-rainbow-delayed">
                Your Platform
              </span>.
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-2xl font-medium leading-relaxed animate-text-glow">
              <strong className="text-gray-900 animate-text-emphasis">Find What You Need. Sell What You Have. All From Where You Are.</strong>
              <br className="hidden sm:block" />
              <span className="text-sm sm:text-base lg:text-lg xl:text-xl">
                Your complete local marketplace for products, services, and everything in between.
              </span>
            </p>
            
            {/* Enhanced Made in Kerala Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base lg:text-lg font-semibold mb-6 sm:mb-8 shadow-md hover:shadow-xl transition-all duration-300 animate-badge-glow relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-badge-shimmer"></div>
              <span className="animate-star-pulse">🌟</span>
              <span className="ml-2 relative z-10">Explore for more</span>
            </div>
            
            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start mb-8 sm:mb-12">
              <button className="bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 hover:from-teal-700 hover:via-teal-800 hover:to-cyan-800 text-white px-6 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg lg:text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center group relative overflow-hidden animate-button-glow">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-button-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-button-shimmer"></div>
                <span className="relative flex items-center z-10">
                  Start Selling Today
                  <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform animate-arrow-bounce" />
                </span>
              </button>
              <button className="border-2 sm:border-3 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg lg:text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl animate-border-glow relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-900/10 to-transparent -skew-x-12 animate-border-shimmer"></div>
                <span className="relative z-10">Explore Marketplace</span>
              </button>
            </div>
            
            {/* Enhanced Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8 text-sm sm:text-base text-gray-600">
              <div className="flex items-center space-x-2 sm:space-x-3 animate-indicator-glow">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center animate-icon-pulse">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-heart-beat" />
                </div>
                <span className="font-semibold">Local Community</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 animate-indicator-glow-delayed">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center animate-icon-pulse">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-shield-glow" />
                </div>
                <span className="font-semibold">Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 animate-indicator-glow-slow">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center animate-icon-pulse">
                  <Handshake className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-handshake-wiggle" />
                </div>
                <span className="font-semibold">Direct Chat</span>
              </div>
            </div>
          </div>
          
          {/* Right Content - Enhanced Hanging Cards Animation */}
          <div className="relative order-1 lg:order-2 mb-8 lg:mb-0">
            {/* Enhanced Curved String SVG */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-16 sm:-translate-y-20 z-40">
              <svg width="120" height="80" viewBox="0 0 120 80" className="animate-string-sway">
                <defs>
                  <linearGradient id="stringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#6B7280', stopOpacity: 1}} />
                    <stop offset="30%" style={{stopColor: '#14B8A6', stopOpacity: 1}} />
                    <stop offset="70%" style={{stopColor: '#06B6D4', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#6B7280', stopOpacity: 1}} />
                  </linearGradient>
                  <filter id="stringGlow">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="rgba(20, 184, 166, 0.6)"/>
                  </filter>
                </defs>
                <path 
                  d="M 60 10 Q 45 25 60 40 T 60 70" 
                  stroke="url(#stringGradient)" 
                  strokeWidth="4" 
                  fill="none" 
                  className="animate-string-rainbow"
                  filter="url(#stringGlow)"
                />
                <circle cx="60" cy="10" r="5" fill="#374151" className="animate-attachment-pulse" />
                <circle cx="60" cy="10" r="3" fill="#14B8A6" className="animate-attachment-glow" />
                <path 
                  d="M 60 10 Q 45 25 60 40 T 60 70" 
                  stroke="rgba(255,255,255,0.6)" 
                  strokeWidth="2" 
                  fill="none" 
                  className="animate-string-shine"
                />
              </svg>
            </div>

            {/* Enhanced Particle System */}
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
                  animation: particle.type === 'burst' 
                    ? `particle-burst ${particle.duration}s ease-out ${particle.delay}s both`
                    : `particle-magic-float ${particle.duration}s ease-out ${particle.delay}s both`
                }}
              >
                <div className="w-full h-full bg-gradient-to-r from-teal-400 via-purple-500 to-pink-400 rounded-full animate-particle-rainbow filter blur-sm"></div>
              </div>
            ))}
            
            {/* Hanging Cards Container */}
            <div className="relative min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
              {/* Current Card */}
              <div 
                className={`absolute inset-0 transition-all duration-1000 ease-out ${
                  isTransitioning ? 'animate-card-flip-out' : 'animate-card-flip-in'
                }`}
                style={{
                  transformOrigin: 'top center',
                  zIndex: isTransitioning ? 5 : 10
                }}
              >
                <div className="animate-card-float">
                  {currentCard === 0 ? <AppointmentCard /> : <OrderCard />}
                </div>
              </div>
              
              {/* Next Card (during transition) */}
              {isTransitioning && (
                <div 
                  className="absolute inset-0 animate-card-flip-in-delayed"
                  style={{
                    transformOrigin: 'top center',
                    zIndex: 8
                  }}
                >
                  <div className="animate-card-float">
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
                      }, 3000);
                    }
                  }}
                  className={`relative transition-all duration-300 ${
                    currentCard === index 
                      ? 'w-8 h-3 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 rounded-full scale-125 animate-dot-active' 
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400 rounded-full animate-dot-inactive'
                  }`}
                >
                  {currentCard === index && (
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 rounded-full animate-dot-pulse"></div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Enhanced Floating elements */}
            <div className="absolute -top-3 -right-3 sm:-top-6 sm:-right-6 bg-white rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-2xl animate-floating-element z-20">
              {currentCard === 0 ? (
                <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-teal-600 animate-icon-bounce" />
              ) : (
                <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-600 animate-icon-bounce" />
              )}
            </div>
            <div className="absolute -bottom-3 -left-3 sm:-bottom-6 sm:-left-6 bg-white rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-2xl animate-floating-element-delayed z-20">
              <MapPin className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-teal-600 animate-icon-pulse" />
            </div>
            <div className="absolute top-1/2 -right-4 sm:-right-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full p-2 sm:p-3 shadow-lg animate-magical-orb z-20">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white animate-sparkle-spin" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Animation Styles */}
      <style jsx>{`
        @keyframes morphing-blob {
          0% { transform: scale(1) rotate(0deg); border-radius: 50% 50% 50% 50%; }
          25% { transform: scale(1.1) rotate(90deg); border-radius: 60% 40% 70% 30%; }
          50% { transform: scale(0.9) rotate(180deg); border-radius: 70% 30% 50% 50%; }
          75% { transform: scale(1.05) rotate(270deg); border-radius: 40% 60% 30% 70%; }
          100% { transform: scale(1) rotate(360deg); border-radius: 50% 50% 50% 50%; }
        }

        @keyframes rainbow-shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }

        @keyframes text-rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes magical-fall {
          0% { 
            top: -20px; 
            opacity: 0; 
            transform: translateY(0) rotate(0deg) scale(0.5);
          }
          20% { 
            opacity: 1; 
            transform: translateY(20px) rotate(90deg) scale(1);
          }
          100% { 
            top: 100%; 
            opacity: 0.8; 
            transform: translateY(0) rotate(360deg) scale(0.8);
          }
        }

        @keyframes particle-burst {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-40px) scale(1.5) rotate(180deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-80px) scale(0.3) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes particle-magic-float {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-60px) translateX(40px) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes card-flip-out {
          0% {
            transform: perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: perspective(1000px) rotateX(90deg) rotateY(-10deg) scale(0.9);
            opacity: 0;
          }
        }

        @keyframes card-flip-in {
          0% {
            transform: perspective(1000px) rotateX(-90deg) rotateY(10deg) scale(0.9);
            opacity: 0;
          }
          100% {
            transform: perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes card-flip-in-delayed {
          0% {
            transform: perspective(1000px) rotateX(90deg) rotateY(-10deg) scale(0.9);
            opacity: 0;
          }
          100% {
            transform: perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes card-float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        @keyframes magic-orb-float {
          0% { 
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px) translateX(10px) scale(1.2);
            opacity: 0.8;
          }
          100% { 
            transform: translateY(-40px) translateX(-5px) scale(0.8);
            opacity: 0;
          }
        }

        .animate-morphing-blob {
          animation: morphing-blob 8s ease-in-out infinite;
        }

        .animate-morphing-blob-delayed {
          animation: morphing-blob 10s ease-in-out infinite 2s;
        }

        .animate-morphing-blob-slow {
          animation: morphing-blob 12s ease-in-out infinite 4s;
        }

        .animate-pulsing-orb {
          animation: morphing-blob 6s ease-in-out infinite, 
                     particle-magic-float 15s ease-in-out infinite;
        }

        .animate-rainbow-shimmer {
          animation: rainbow-shimmer 3s infinite linear;
        }

        .animate-text-rainbow {
          background-size: 200% 200%;
          animation: text-rainbow 3s ease-in-out infinite;
        }

        .animate-text-rainbow-delayed {
          background-size: 200% 200%;
          animation: text-rainbow 3s ease-in-out infinite 1s;
        }

        .animate-magical-fall {
          animation: magical-fall 4s ease-in-out infinite;
        }

      
  @keyframes card-float {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(1deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }

  .animate-card-float {
    animation: card-float 5s ease-in-out infinite;
  }

  .animate-card-flip-out {
    animation: card-flip-out 1s ease-in forwards;
  }

  .animate-card-flip-in {
    animation: card-flip-in 1s ease-out forwards;
  }

  .animate-card-flip-in-delayed {
    animation: card-flip-in-delayed 1s ease-out 1s forwards;
  }

  .animate-dot-active {
    animation: pulse 1.5s infinite ease-in-out;
  }

  .animate-dot-inactive {
    animation: none;
  }

  .animate-dot-pulse {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.6;
    }
  }

  .animate-floating-element {
    animation: float 3s ease-in-out infinite;
  }

  .animate-floating-element-delayed {
    animation: float 4s ease-in-out infinite 1s;
  }

  @keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0); }
  }

  .animate-icon-bounce {
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  .animate-icon-pulse {
    animation: iconPulse 3s ease-in-out infinite;
  }

  @keyframes iconPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }

  .animate-sparkle-spin {
    animation: sparkleSpin 2s linear infinite;
  }

  @keyframes sparkleSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .animate-magical-orb {
    animation: float 4s ease-in-out infinite, sparkleSpin 5s linear infinite;
  }

  .animate-string-sway {
    animation: sway 5s ease-in-out infinite;
  }

  @keyframes sway {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(3deg); }
  }

  .animate-star-pulse {
    animation: pulse 1.5s ease-in-out infinite;
  }

  .animate-badge-glow {
    animation: glow 4s ease-in-out infinite;
  }

  @keyframes glow {
    0% {
      box-shadow: 0 0 0px rgba(255, 255, 255, 0.2);
    }
    50% {
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
    }
    100% {
      box-shadow: 0 0 0px rgba(255, 255, 255, 0.2);
    }
  }

  .animate-border-shimmer {
    animation: rainbow-shimmer 4s linear infinite;
  }

  .animate-button-glow {
    animation: glow 3s ease-in-out infinite;
  }

  .animate-button-shimmer {
    animation: rainbow-shimmer 3s linear infinite;
  }

  .animate-button-pulse {
    animation: pulse 2.5s ease-in-out infinite;
  }

  .animate-arrow-bounce {
    animation: bounce 2s infinite;
  }

  .animate-rainbow-bounce {
    animation: bounce 3s ease-in-out infinite;
  }

  .animate-handshake-wiggle {
    animation: wiggle 2s ease-in-out infinite;
  }

  @keyframes wiggle {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(3deg); }
    50% { transform: rotate(-3deg); }
    75% { transform: rotate(2deg); }
    100% { transform: rotate(0deg); }
  }

  .animate-shield-glow {
    animation: pulse 2.5s infinite;
  }

  .animate-heart-beat {
    animation: heartBeat 1.5s infinite;
  }

  @keyframes heartBeat {
    0% {
      transform: scale(1);
    }
    25% {
      transform: scale(1.2);
    }
    50% {
      transform: scale(1);
    }
    75% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }

  .animate-rainbow-twinkle {
    animation: twinkle 3s infinite ease-in-out;
  }

  @keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.3); }
  }

  .animate-string-rainbow {
    animation: glow 5s ease-in-out infinite;
  }

  .animate-attachment-pulse {
    animation: pulse 2s ease-in-out infinite;
  }

  .animate-attachment-glow {
    animation: glow 3s ease-in-out infinite;
  }

  .animate-string-shine {
    animation: rainbow-shimmer 6s ease-in-out infinite;
  }
`}</style>
</section>
  );
};




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
      title: "Add Your Offerings",
      description: "List products to sell or services to book - anything goes!",
      icon: <Package className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      details: "Products, services, rentals - you name it",
      color: "from-green-500 to-teal-600"
    },
    {
      step: "03",
      title: "Connect & Sell",
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
          <button className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl lg:text-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl">
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
            <button className="bg-white text-teal-700 px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl lg:text-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl w-full sm:w-auto">
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
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-6 h-6 sm:w-8 sm:h-8" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Phone className="w-6 h-6 sm:w-8 sm:h-8" />
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
            <ul className="space-y-2 sm:space-y-3">
              <li className="text-gray-400 text-base sm:text-lg">Kerala, India</li>
              <li className="text-gray-400 text-base sm:text-lg">support@yourplatform.com</li>
              <li className="text-gray-400 text-base sm:text-lg">+91 99999 99999</li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-0">
            © 2024 YourPlatform. All rights reserved. Made with ❤️ in Kerala
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
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
};

export default App;