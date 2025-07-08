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
  Sparkles
} from "lucide-react";

const Welcome = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const features = [
    {
      icon: <Store className="w-10 h-10" />,
      title: "Create Your Store",
      description: "Set up your digital storefront in minutes and start selling anything",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: <Package className="w-10 h-10" />,
      title: "List Everything",
      description: "Products, services, rentals - if you have it, someone needs it",
      gradient: "from-green-500 to-teal-600"
    },
    {
      icon: <Calendar className="w-10 h-10" />,
      title: "Smart Booking",
      description: "Accept appointments and manage your schedule effortlessly",
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: <MessageCircle className="w-10 h-10" />,
      title: "Chat & Connect",
      description: "Build relationships with instant messaging and customer support",
      gradient: "from-pink-500 to-rose-600"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Stores", icon: <Store className="w-8 h-8" /> },
    { number: "50K+", label: "Products & Services", icon: <Package className="w-8 h-8" /> },
    { number: "25K+", label: "Happy Customers", icon: <Users className="w-8 h-8" /> },
    { number: "99.9%", label: "Success Rate", icon: <Award className="w-8 h-8" /> }
  ];

  const sellingProcess = [
    {
      step: "01",
      title: "Create Your Store",
      description: "Set up your digital storefront and customize it to reflect your brand",
      icon: <Store className="w-12 h-12" />,
      details: "Add photos, write descriptions, set your hours",
      color: "from-blue-500 to-indigo-600"
    },
    {
      step: "02", 
      title: "Add Your Offerings",
      description: "List products to sell or services to book - anything goes!",
      icon: <Package className="w-12 h-12" />,
      details: "Products: Set prices, manage inventory • Services: Set availability, accept bookings",
      color: "from-green-500 to-emerald-600"
    },
    {
      step: "03",
      title: "Manage Orders",
      description: "Receive orders, chat with customers, and grow your business",
      icon: <CheckCircle className="w-12 h-12" />,
      details: "Process orders • Accept appointments • Chat with customers",
      color: "from-purple-500 to-pink-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-2xl border-b border-teal-100' 
          : 'bg-white shadow-xl border-b-2 border-teal-100'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
          <div className="flex items-center">
          <div className="flex items-center space-x-3 relative">
  <img 
    src="/logo.png" 
    alt="Your Logo" 
    className="h-16 object-contain"
  />
  <p className="absolute left-20 top-14 text-[9px] sm:text-[10px] text-gray-400">
    Made in Kerala
  </p>
</div>

</div>


            
            <div className="hidden md:flex items-center space-x-8">
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
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/login'}
                className="text-gray-800 hover:text-teal-600 px-6 py-3 rounded-xl text-base font-bold transition-all duration-300 hover:bg-teal-50"
              >
                Login
              </button>
              <button
                onClick={() => window.location.href = '/register'}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-3 rounded-xl text-base font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="pt-32 pb-24 bg-gradient-to-br from-gray-50 via-white to-teal-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-full text-base font-bold mb-8 shadow-lg animate-bounce">
                <Sparkles className="w-5 h-5 mr-2" />
                Buy Anything. Sell Anything. Book Any Service.
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight">
                <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                  Everything
                </span> Near You.
                <br />
                On <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Your Platform
                </span>.
              </h1>
              
              <p className="text-2xl text-gray-600 mb-8 max-w-2xl font-medium leading-relaxed">
                <strong className="text-gray-900">Find What You Need. Sell What You Have. All From Where You Are.</strong>
                <br />
                Your complete local marketplace for products, services, and everything in between.
              </p>
              
              {/* Made in Kerala Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-3 rounded-full text-lg font-semibold mb-8 shadow-md hover:shadow-xl transition-shadow duration-300">
  Made in Kera<span className="inline-block transform -rotate-12">🌴</span>la
</div>

              
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-12">
                <button
                  onClick={() => window.location.href = '/register'}
                  className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center justify-center group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center">
                    Start Selling Today
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                </button>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="border-3 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Explore Marketplace
                </button>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start space-x-8 text-base text-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="font-semibold">Local Community</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="font-semibold">Secure Payments</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Handshake className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="font-semibold">Direct Chat</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 rounded-3xl p-10 shadow-3xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-2xl p-8 mb-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl">✨</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Glow Beauty Studio</h3>
                        <p className="text-base text-gray-500 font-medium">0.3 miles away</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-full">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-base font-bold text-gray-900">4.9</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-200">
                      <p className="text-sm text-gray-500 font-medium">Hair Coloring</p>
                      <p className="text-xl font-bold text-gray-900">₹2,500</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                      <p className="text-sm text-gray-500 font-medium">Booking at</p>
                      <p className="text-xl font-bold text-gray-900">Today 3:00 PM</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-white border border-white/30">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Live Chat Active</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <MessageCircle className="w-6 h-6" />
                      <span className="text-lg font-bold">Connected</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Floating elements */}
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-2xl animate-bounce">
                <MessageCircle className="w-8 h-8 text-teal-600" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-2xl animate-pulse">
                <MapPin className="w-8 h-8 text-teal-600" />
              </div>
              <div className="absolute top-1/2 -right-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 shadow-lg animate-spin">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Value Proposition */}
      <section className="py-24 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
              Buy Anything. Sell Anything. Book Any Service.
            </h2>
            <p className="text-2xl text-gray-600 font-medium">
              Everything Near You — All in One Place
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-green-200">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Search className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Find Anything</h3>
              <p className="text-gray-600 text-lg leading-relaxed">From groceries to gadgets, services to supplies - discover everything you need in your local area</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-blue-200">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sell Everything</h3>
              <p className="text-gray-600 text-lg leading-relaxed">List products, offer services, rent items - turn anything you have into income</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-purple-200">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect Instantly</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Chat directly with buyers and sellers for the best customer experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-teal-600/20 to-blue-600/20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-8">
              Everything You Need to
              <span className="bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto font-medium">
              Powerful tools to help you sell more, serve better, and grow faster
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-8 rounded-3xl border-2 transition-all duration-500 cursor-pointer transform hover:scale-105 ${
                  currentFeature === index 
                    ? 'border-teal-400 bg-gradient-to-br from-teal-400/20 to-blue-400/20 shadow-2xl' 
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                }`}
              >
                <div className={`text-white mb-6 w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-300 text-lg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white transform hover:scale-110 transition-all duration-300">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-black mb-3">{stat.number}</div>
                <div className="text-teal-100 text-lg font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced How It Works */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8">
              Start Selling in 3 Simple Steps
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-medium">
              Whether you're selling products or offering services, getting started is easy
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {sellingProcess.map((item, index) => (
              <div key={index} className="text-center transform hover:scale-105 transition-all duration-300">
                <div className="relative mb-8">
                  <div className={`w-24 h-24 bg-gradient-to-r ${item.color} rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl`}>
                    {item.icon}
                  </div>
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center text-lg font-black shadow-lg">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 mb-6 text-lg">{item.description}</p>
                <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-100">
                  <p className="text-base text-gray-600 font-medium">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-20 text-center">
            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-5xl mx-auto border-2 border-teal-100">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Products vs Services - We Handle Both!
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-2xl border-2 border-blue-200">
                  <h4 className="text-xl font-bold text-blue-900 mb-4">📦 Selling Products</h4>
                  <p className="text-blue-800 text-lg font-medium">Create store → Add products → Receive orders → Process & deliver</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-8 rounded-2xl border-2 border-green-200">
                  <h4 className="text-xl font-bold text-green-900 mb-4">🛠️ Offering Services</h4>
                  <p className="text-green-800 text-lg font-medium">Create store → Add services → Get booking requests → Accept & complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-r from-teal-600 via-teal-700 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center relative">
          <div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8">
              Ready to Buy, Sell, or Book?
            </h2>
            <p className="text-2xl text-teal-100 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Join thousands discovering the power of local commerce. Everything Near You. All in One Place.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => window.location.href = '/register'}
                className="bg-white text-teal-600 hover:bg-gray-100 px-12 py-5 rounded-2xl font-black text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center group"
              >
                Start Selling Now
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="border-3 border-white text-white hover:bg-white hover:text-teal-600 px-12 py-5 rounded-2xl font-black text-xl transition-all duration-300 transform hover:scale-105"
              >
                Browse Marketplace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src="/logo.png" 
                  alt="Your Logo" 
                  className="h-12 object-contain"
                />
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Everything Near You. Find What You Need. Sell What You Have. All From Where You Are.
              </p>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-6">For Sellers</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-teal-400 transition-colors text-lg">Sell Products</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors text-lg">Offer Services</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors text-lg">Mobile App</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-6">For Buyers</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-teal-400 transition-colors text-lg">Find Products</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors text-lg">Book Services</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors text-lg">Local Deals</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-6">Support</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-teal-400 transition-colors text-lg">Help Center</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors text-lg">Contact Us</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors text-lg">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p className="text-lg">&copy; 2025 SerchBy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;