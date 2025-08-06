import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Menu,
  CreditCard,
  CheckCircle,
  Smartphone,
  ArrowRight,
  Clock,
  Star,
  Sparkles,
  ShoppingCart,
  Bell,
  Check
} from 'lucide-react';

export default function ModernProcessSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      number: "1",
      title: "Scan QR Code",
      subtitle: "Point your camera at the QR code on your table",
      description: "Open your phone camera and point it at the QR code. No app download needed!",
      icon: QrCode,
      gradient: "from-blue-500 to-cyan-500",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
      bgColor: "bg-blue-50"
    },
    {
      number: "2", 
      title: "Choose Your Food",
      subtitle: "Browse menu and select items you want",
      description: "See photos of dishes, read descriptions, and add items to your cart with one tap.",
      icon: Menu,
      gradient: "from-green-500 to-emerald-500", 
      image: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&q=80",
      bgColor: "bg-green-50"
    },
    {
      number: "3",
      title: "Pay Online",
      subtitle: "Choose payment method and pay securely", 
      description: "Select your table number, choose payment method, and pay safely online.",
      icon: CreditCard,
      gradient: "from-purple-500 to-pink-500",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
      bgColor: "bg-purple-50"
    },
    {
      number: "4",
      title: "Food Delivered",
      subtitle: "Track order and get your food delivered to table",
      description: "Watch your order progress and get notified when food is ready at your table.",
      icon: CheckCircle,
      gradient: "from-orange-500 to-red-500", 
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            How It Works
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Order in 4 Simple Steps
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            No apps needed. Just scan, select, pay and enjoy!
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            
            return (
              <div
                key={step.number}
                className={`group cursor-pointer transition-all duration-500 ${
                  isActive ? 'scale-105' : 'hover:scale-102'
                }`}
                onClick={() => setActiveStep(index)}
              >
                {/* Step Card */}
                <div className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-500 overflow-hidden h-96 ${
                  isActive 
                    ? `border-transparent shadow-2xl` 
                    : 'border-gray-100 hover:shadow-xl'
                }`}>
                  
                  {/* Step Number */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white transition-all duration-500 ${
                      isActive 
                        ? `bg-gradient-to-r ${step.gradient} shadow-lg` 
                        : 'bg-gray-400'
                    }`}>
                      {step.number}
                    </div>
                  </div>

                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img 
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
                      isActive 
                        ? `bg-gradient-to-r ${step.gradient} shadow-lg` 
                        : 'bg-white/20 backdrop-blur-sm'
                    }`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                    <p className="text-white/90 text-sm mb-3 font-medium">{step.subtitle}</p>
                    <p className="text-white/80 text-sm leading-relaxed">{step.description}</p>

                    {/* Progress Bar */}
                    <div className="mt-4 w-full bg-white/20 rounded-full h-1">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${step.gradient} transition-all duration-1000 ${
                          isActive ? 'w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Arrow for flow */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-30">
                      <div className={`w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-500 ${
                        isActive ? 'scale-110' : ''
                      }`}>
                        <ArrowRight className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Row */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: "30s", label: "Average Order Time", icon: Clock },
            { number: "No .1", label: "Dedicated App and Web App", icon: Smartphone },
            { number: "100%", label: "Secure Payment", icon: Check },
            { number: "24/7", label: "Always Available", icon: Star }
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <QrCode className="w-6 h-6" />
            Try It Now - Scan QR Code
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-gray-500 mt-4">Works on any phone • No registration required</p>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-10">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeStep === index ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}