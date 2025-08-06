import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  QrCode,
  Clock,
  ChefHat,
  Utensils,
  Star,
  ArrowRight,
  Zap,
  Users,
  TrendingUp,
  Play
} from 'lucide-react';

export default function SerchByHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      
      {/* Dynamic Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Restaurant Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-teal-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50" />
      </div>

      {/* Animated Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-teal-400 rounded-full animate-ping opacity-60" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-teal-300 rounded-full animate-bounce" />
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-white/60 rounded-full animate-ping" />
      </div>

      {/* Floating QR Code Animation */}
      <div className="absolute top-20 right-10 hidden lg:block">
        <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center animate-float">
              <QrCode className="w-8 h-8 text-teal-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 lg:pt-32 pb-8 sm:pb-12 lg:pb-20">
        
        {/* NEW: Animated Main Heading */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
            <span className={`inline-block transform transition-all duration-700 ease-out ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-200 to-teal-400">
                SerchBy
              </span>
            </span>
            <span className={`inline-block transform transition-all duration-700 ease-out delay-300 ${isVisible ? 'translate-x-0 opacity-100 rotate-0' : 'translate-x-8 opacity-0 rotate-6'}`}>
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 ml-3">
                for Restaurants
              </span>
            </span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Content Section */}
          <div className={`space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

            {/* Premium Badge */}
            <div className="flex justify-center lg:justify-start">
              <span className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-teal-500/20 to-teal-400/20 backdrop-blur-md border border-teal-400/30 text-teal-300 text-xs sm:text-sm font-semibold rounded-full">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-teal-400" />
                #1 QR Restaurant Ordering Automation Solution
              </span>
            </div>

            {/* Hero Title */}
            <div className="space-y-2 sm:space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                <span className="block">Future of</span>
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-300">
                  Digital
                </span>
                <span className="block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-300 to-white">
                    Restaurants
                  </span>
                </span>
               
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 px-2 sm:px-0">
             Digitalise Your Restaurant with SerchBy. Transform your restaurant with instant QR ordering. No wait times, just 
              <span className="text-teal-400 font-semibold"> seamless dining experiences</span> that your customers will love.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-8 py-4 sm:py-6 px-2 sm:px-0">
              {[
                { value: "2x", label: "Faster Orders", icon: Clock },
                { value: "50%", label: "Less Wait Time", icon: Users },
                { value: "98%", label: "Customer Satisfaction", icon: TrendingUp }
              ].map(({ value, label, icon: Icon }, index) => (
                <div key={label} className={`text-center transform transition-all duration-700 delay-${900 + index * 200} ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                  <div className="flex justify-center mb-1 sm:mb-2">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                  </div>
                  <div className="text-lg sm:text-2xl lg:text-3xl font-black text-white">{value}</div>
                  <div className="text-xs sm:text-sm text-gray-400 font-medium break-words">{label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2 sm:pt-4 px-4 sm:px-0">
              <button className="group relative overflow-hidden px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-teal-500 to-teal-400 text-white text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-teal-500/25 transform hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                 Lets Add Your Restaurent
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>

          {/* Visual Section */}
          <div className={`relative transform transition-all duration-1000 delay-1000 px-4 sm:px-0 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            
            {/* Main Phone Mockup */}
            <div className="relative mx-auto max-w-xs sm:max-w-sm">
              
              {/* Glow Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400/30 to-teal-600/30 rounded-[2.5rem] sm:rounded-[3rem] blur-3xl scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-500/20 to-transparent rounded-[2.5rem] sm:rounded-[3rem] scale-105" />
              
              {/* Phone Frame */}
              <div className="relative bg-gradient-to-br from-gray-900 to-black p-1.5 sm:p-2 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl border border-gray-700">
                <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
                  
                  {/* Phone Screen */}
                  <div className="relative h-[500px] sm:h-[600px] bg-gradient-to-br from-gray-50 to-white">
                    
                    {/* Real Menu Image */}
                    <div className="relative h-full">
                      <img
                        src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80"
                        alt="SerchBy Restaurant Menu"
                        className="w-full h-full object-cover"
                      />

                      {/* Overlay with SerchBy Branding - WHITE BACKGROUND */}
                      <div className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm p-3 sm:p-4 mx-2 sm:mx-3 mt-2 sm:mt-3 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Utensils className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-gray-900 text-xs sm:text-sm leading-tight">SerchBy Menu</h3>
                              <p className="text-xs text-gray-600 leading-tight">Table #12</p>
                            </div>
                          </div>
                          <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 flex-shrink-0" />
                        </div>
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 sm:p-4">
                        <button className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-xl shadow-lg backdrop-blur-sm text-sm sm:text-base">
                          <div className="flex items-center justify-center gap-2">
                            <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" />
                            Scan & Order Now
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements - Responsive sizing */}
              <div className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center animate-bounce">
                <ChefHat className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>

              <div className="absolute -bottom-2 sm:-bottom-4 -right-2 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Smartphone className="w-4 h-4 sm:w-6 sm:h-6 text-teal-400 mx-auto mb-0.5 sm:mb-1" />
                  <span className="text-xs text-white font-medium hidden sm:block">Scan & Order</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Scroll Indicator - Hidden on small screens */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 hidden sm:block">
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-xs font-medium">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center animate-bounce">
            <div className="w-1 h-3 bg-teal-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}