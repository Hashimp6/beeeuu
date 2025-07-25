import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-slate-100 flex flex-col items-center justify-center text-gray-900 px-6 text-center overflow-hidden relative">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-3 h-3 bg-teal-400 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute top-40 right-20 w-2 h-2 bg-black rounded-full animate-pulse opacity-20 animation-delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-4 h-4 bg-teal-300 rounded-full animate-pulse opacity-30 animation-delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-gray-700 rounded-full animate-pulse opacity-25 animation-delay-3000"></div>
        <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-teal-500 rounded-full animate-pulse opacity-50 animation-delay-4000"></div>
      </div>

      {/* Main illustration */}
      <div className="relative mb-12 animate-float">
        <svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl"
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="bgGradient" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#f1f5f9" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.3" />
            </radialGradient>
            <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
            <linearGradient id="darkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="shadow">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#0f766e" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Background circle */}
          <circle cx="160" cy="160" r="140" fill="url(#bgGradient)" stroke="#e2e8f0" strokeWidth="2" />
          
          {/* Decorative rings */}
          <circle cx="160" cy="160" r="120" fill="none" stroke="#14b8a6" strokeWidth="1" opacity="0.3" strokeDasharray="8,8" className="animate-spin-slow" />
          <circle cx="160" cy="160" r="100" fill="none" stroke="#0d9488" strokeWidth="1" opacity="0.2" strokeDasharray="4,4" className="animate-spin-reverse" />
          
          {/* Central telescope/spyglass illustration */}
          <g transform="translate(160, 160)">
            {/* Telescope body */}
            <ellipse cx="0" cy="0" rx="45" ry="15" fill="url(#darkGradient)" filter="url(#shadow)" />
            <ellipse cx="0" cy="0" rx="40" ry="12" fill="#1f2937" />
            <ellipse cx="0" cy="0" rx="35" ry="9" fill="#374151" />
            
            {/* Telescope segments */}
            <rect x="-45" y="-8" width="15" height="16" fill="#0d9488" rx="2" />
            <rect x="-25" y="-6" width="50" height="12" fill="url(#tealGradient)" rx="6" />
            <rect x="30" y="-4" width="20" height="8" fill="#14b8a6" rx="4" />
            
            {/* Lens */}
            <circle cx="45" cy="0" r="12" fill="#ffffff" stroke="#14b8a6" strokeWidth="3" />
            <circle cx="45" cy="0" r="8" fill="#f0fdfa" stroke="#0d9488" strokeWidth="1" />
            <circle cx="45" cy="0" r="4" fill="url(#tealGradient)" opacity="0.6" />
            
            {/* Eyepiece */}
            <circle cx="-45" cy="0" r="8" fill="#1f2937" />
            <circle cx="-45" cy="0" r="5" fill="#374151" />
            
            {/* Decorative elements */}
            <line x1="-35" y1="-15" x2="-35" y2="15" stroke="#14b8a6" strokeWidth="2" opacity="0.7" />
            <line x1="0" y1="-18" x2="0" y2="18" stroke="#0d9488" strokeWidth="2" opacity="0.5" />
            <line x1="25" y1="-12" x2="25" y2="12" stroke="#14b8a6" strokeWidth="2" opacity="0.6" />
          </g>
          
          {/* 404 Text integrated into design */}
          <g filter="url(#glow)">
            <text x="160" y="90" fontSize="32" fontWeight="bold" textAnchor="middle" fill="url(#tealGradient)" className="animate-pulse">
              4
            </text>
            <text x="160" y="125" fontSize="28" fontWeight="bold" textAnchor="middle" fill="#1f2937" opacity="0.8">
              0
            </text>
            <text x="160" y="250" fontSize="32" fontWeight="bold" textAnchor="middle" fill="url(#tealGradient)" className="animate-pulse" style={{animationDelay: '0.5s'}}>
              4
            </text>
          </g>
          
          {/* Search beams from telescope */}
          <g opacity="0.4">
            <path d="M205 160 L280 140" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
            <path d="M205 160 L280 160" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" className="animate-pulse" style={{animationDelay: '0.3s'}} />
            <path d="M205 160 L280 180" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round" className="animate-pulse" style={{animationDelay: '0.6s'}} />
          </g>
          
          {/* Floating particles */}
          <g className="animate-float-particles">
            <circle cx="80" cy="80" r="3" fill="#14b8a6" opacity="0.6" />
            <circle cx="240" cy="100" r="2" fill="#0d9488" opacity="0.5" />
            <circle cx="60" cy="240" r="2.5" fill="#14b8a6" opacity="0.4" />
            <circle cx="250" cy="250" r="2" fill="#1f2937" opacity="0.3" />
          </g>
          
          {/* Geometric accent shapes */}
          <g opacity="0.3">
            <polygon points="40,60 50,40 60,60" fill="#0d9488" className="animate-bounce" style={{animationDelay: '1s', animationDuration: '3s'}} />
            <rect x="260" y="70" width="12" height="12" fill="#14b8a6" rx="2" className="animate-bounce" style={{animationDelay: '1.5s', animationDuration: '2.5s'}} />
            <polygon points="270,240 275,230 280,240 275,250" fill="#1f2937" className="animate-bounce" style={{animationDelay: '2s', animationDuration: '3.5s'}} />
          </g>
          
          {/* Decorative arcs */}
          <path d="M50 50 Q160 20 270 50" stroke="#14b8a6" strokeWidth="2" fill="none" opacity="0.3" strokeDasharray="10,5" className="animate-pulse" />
          <path d="M50 270 Q160 300 270 270" stroke="#0d9488" strokeWidth="2" fill="none" opacity="0.2" strokeDasharray="5,10" className="animate-pulse" style={{animationDelay: '1s'}} />
        </svg>
      </div>

      {/* Content */}
      <h1 className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-gray-900 to-teal-600 animate-fade-in leading-tight">
        Oops! Page Not Found
      </h1>
      
      <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-2xl leading-relaxed animate-fade-in font-medium" style={{ animationDelay: '0.2s' }}>
        We've searched high and low, but this page seems to have vanished into the digital void.
      </p>
      
      <p className="text-lg text-gray-500 mb-10 max-w-xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
        Don't worry though - amazing deals and discoveries are waiting for you back home!
      </p>
      
      <button
        onClick={handleGoHome}
        className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in border-0 cursor-pointer"
        style={{ animationDelay: '0.6s' }}
      >
        🏠 Return Home
      </button>

      {/* Footer message */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm animate-fade-in" style={{ animationDelay: '0.8s' }}>
        Lost in space? We'll guide you back! ✨
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        
        @keyframes float-particles {
          0%, 100% { transform: translateY(0px); }
          25% { transform: translateY(-5px); }
          75% { transform: translateY(5px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-particles {
          animation: float-particles 6s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          opacity: 0;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default NotFound;