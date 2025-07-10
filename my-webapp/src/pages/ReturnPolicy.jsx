import React, { useState, useEffect } from 'react';
import { RotateCcw, Mail, Phone, Clock, Package, AlertTriangle, XCircle, CheckCircle, Camera, ArrowLeft, ShoppingCart, User, FileText, Info } from 'lucide-react';

const ReturnRefundPolicy = () => {
  const [activeSection, setActiveSection] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      const scrollY = window.scrollY;
      
      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('data-section');
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          setActiveSection(sectionId);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = [
    { id: 'eligibility', title: 'Return Eligibility', icon: CheckCircle },
    { id: 'damaged', title: 'Damaged Products', icon: AlertTriangle },
    { id: 'refund', title: 'Refund Process', icon: RotateCcw },
    { id: 'non-returnable', title: 'Non-Returnable Items', icon: XCircle },
    { id: 'seller-policies', title: 'Seller Policies', icon: User },
    { id: 'contact', title: 'Contact Us', icon: Mail }
  ];

  const PolicySection = ({ id, title, icon: Icon, children, highlight = false, warning = false }) => (
    <div
      data-section={id}
      className={`mb-8 p-6 md:p-8 rounded-2xl transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${
        highlight
          ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-xl'
          : warning
          ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-lg hover:shadow-xl'
          : 'bg-white/80 backdrop-blur-sm border border-teal-100 hover:border-teal-200 shadow-lg hover:shadow-xl'
      } ${
        activeSection === id ? 'ring-2 ring-teal-400 ring-opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${
          highlight ? 'bg-white/20' : warning ? 'bg-amber-100' : 'bg-teal-100'
        }`}>
          <Icon className={`w-5 h-5 ${
            highlight ? 'text-white' : warning ? 'text-amber-600' : 'text-teal-600'
          }`} />
        </div>
        <h2 className={`text-xl md:text-2xl font-bold ${
          highlight ? 'text-white' : warning ? 'text-amber-900' : 'text-gray-900'
        }`}>
          {title}
        </h2>
      </div>
      <div className={`space-y-4 ${
        highlight ? 'text-white/90' : warning ? 'text-amber-900' : 'text-gray-700'
      }`}>
        {children}
      </div>
    </div>
  );

  const TimelineStep = ({ step, title, description, isActive = false }) => (
    <div className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${
      isActive ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50 border border-gray-200'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
        isActive ? 'bg-teal-500 text-white' : 'bg-gray-300 text-gray-600'
      }`}>
        {step}
      </div>
      <div>
        <h4 className={`font-semibold mb-1 ${isActive ? 'text-teal-900' : 'text-gray-900'}`}>
          {title}
        </h4>
        <p className={`text-sm ${isActive ? 'text-teal-700' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
    </div>
  );

  const InfoCard = ({ icon: Icon, title, description, color = 'teal' }) => (
    <div className={`p-4 rounded-xl border ${
      color === 'teal' ? 'bg-teal-50 border-teal-200' :
      color === 'amber' ? 'bg-amber-50 border-amber-200' :
      color === 'red' ? 'bg-red-50 border-red-200' :
      'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-1 flex-shrink-0 ${
          color === 'teal' ? 'text-teal-600' :
          color === 'amber' ? 'text-amber-600' :
          color === 'red' ? 'text-red-600' :
          'text-gray-600'
        }`} />
        <div>
          <h4 className={`font-semibold mb-1 ${
            color === 'teal' ? 'text-teal-900' :
            color === 'amber' ? 'text-amber-900' :
            color === 'red' ? 'text-red-900' :
            'text-gray-900'
          }`}>
            {title}
          </h4>
          <p className={`text-sm ${
            color === 'teal' ? 'text-teal-700' :
            color === 'amber' ? 'text-amber-700' :
            color === 'red' ? 'text-red-700' :
            'text-gray-600'
          }`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-50/30 to-teal-100/50">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-400/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-teal-500/20 rounded-2xl backdrop-blur-sm">
              <RotateCcw className="w-12 h-12 text-teal-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-teal-100 bg-clip-text text-transparent">
            Return & Refund Policy
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-2">Serchby</p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We aim to ensure a smooth and trustworthy shopping experience for both buyers and sellers.
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-teal-100 shadow-sm">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-6 h-6 text-teal-600" />
              <span className="font-bold text-gray-900">Return & Refund Policy</span>
            </div>
            <div className="hidden md:flex items-center gap-2 overflow-x-auto">
              {sections.slice(0, 4).map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeSection === section.id
                      ? 'bg-teal-100 text-teal-700'
                      : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl px-4 py-12">
        {/* Introduction */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
            <Info className="w-4 h-4" />
            Marketplace Policy - Seller Terms May Vary
          </div>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            As a marketplace, return and refund processes may vary depending on the individual seller's policies. 
            Please read the following terms carefully before making any purchase.
          </p>
        </div>

        {/* Quick Timeline */}
        <div className="mb-12 p-6 bg-white rounded-2xl shadow-lg border border-teal-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Return Process Timeline</h3>
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
            >
              {showTimeline ? 'Hide' : 'Show'} Timeline
            </button>
          </div>
          
          {showTimeline && (
            <div className="space-y-4">
              <TimelineStep
                step="1"
                title="Within 7 days of delivery"
                description="Raise a return request for eligible items"
                isActive={true}
              />
              <TimelineStep
                step="2"
                title="Within 48 hours (if damaged)"
                description="Report damaged or defective products with photos"
              />
              <TimelineStep
                step="3"
                title="Return approval"
                description="Seller reviews and approves your return request"
              />
              <TimelineStep
                step="4"
                title="Ship back to seller"
                description="Send item back to original shipping address"
              />
              <TimelineStep
                step="5"
                title="7-10 business days"
                description="Refund processed after item inspection"
              />
            </div>
          )}
        </div>

        {/* Return Eligibility */}
        <PolicySection id="eligibility" title="Return Eligibility" icon={CheckCircle}>
          <div className="bg-teal-50 p-6 rounded-xl border border-teal-200 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-teal-600" />
              <h4 className="font-semibold text-teal-900">7-Day Return Window</h4>
            </div>
            <p className="text-teal-700 mb-4">
              Return requests must be raised within 7 days of receiving the product.
            </p>
          </div>
          
          <h4 className="font-semibold text-gray-900 mb-4">To be eligible for a return, the item must be:</h4>
          <div className="space-y-3">
            {[
              'Unused and in the same condition as received',
              'In its original packaging with tags, accessories, or documents (if any)',
              'Not a part of non-returnable items such as perishables, digital goods, or personalized products'
            ].map((requirement, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{requirement}</p>
              </div>
            ))}
          </div>
        </PolicySection>

        {/* Damaged or Defective Products */}
        <PolicySection id="damaged" title="Damaged or Defective Products" icon={AlertTriangle} warning={true}>
          <div className="bg-amber-100 p-6 rounded-xl border border-amber-200 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-amber-600" />
              <h4 className="font-semibold text-amber-900">48-Hour Reporting Window</h4>
            </div>
            <p className="text-amber-800">
              If you receive a damaged, defective, or wrong item, you must report it within 48 hours of receiving the product.
            </p>
          </div>

          <h4 className="font-semibold text-amber-900 mb-4">Steps to report damaged/defective items:</h4>
          <div className="space-y-4">
            <InfoCard
              icon={Mail}
              title="Contact Seller or Serchby"
              description="Inform the seller directly or contact us at hashimhusain313@gmail.com"
              color="amber"
            />
            <InfoCard
              icon={Camera}
              title="Provide Evidence"
              description="Submit clear photos or videos as proof of the issue"
              color="amber"
            />
            <InfoCard
              icon={ArrowLeft}
              title="Return to Original Address"
              description="Upon seller approval, return the item to the original shipping address"
              color="amber"
            />
          </div>

          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">Important Note</h4>
                <p className="text-red-700 text-sm">
                  We do not provide replacements or exchanges. For damaged or defective products, 
                  only refunds are processed after successful return and inspection.
                </p>
              </div>
            </div>
          </div>
        </PolicySection>

        {/* Refund Process */}
        <PolicySection id="refund" title="Refund Process" icon={RotateCcw}>
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-100 mb-6">
            <h4 className="font-semibold text-teal-900 mb-4">Refund Timeline & Process</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-teal-700">Item received and inspected by seller</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-teal-700">Seller approves the return request</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-teal-700">Refund credited to original payment method within 7–10 business days</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">Refund Deductions</h4>
                <p className="text-amber-700 text-sm">
                  Refunds may be subject to deductions (e.g., shipping or handling charges) depending on the seller's policy.
                </p>
              </div>
            </div>
          </div>
        </PolicySection>

        {/* Non-Returnable Items */}
        <PolicySection id="non-returnable" title="Non-Returnable Items" icon={XCircle}>
          <p className="mb-6 text-gray-700">The following items are typically non-returnable:</p>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard
              icon={FileText}
              title="Digital Products"
              description="Downloadable software or digital products"
              color="red"
            />
            <InfoCard
              icon={User}
              title="Custom Items"
              description="Custom-made or personalized items"
              color="red"
            />
            <InfoCard
              icon={Package}
              title="Perishable Goods"
              description="Items with limited shelf life"
              color="red"
            />
            <InfoCard
              icon={XCircle}
              title="Final Sale Items"
              description="Items marked as 'Final Sale' or 'Non-returnable'"
              color="red"
            />
          </div>
        </PolicySection>

        {/* Seller-Specific Policies */}
        <PolicySection id="seller-policies" title="Seller-Specific Policies" icon={User}>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <ShoppingCart className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Individual Seller Terms</h4>
                <p className="text-blue-700 leading-relaxed">
                  Each seller on Serchby may have individual return and refund rules. Buyers are strongly encouraged 
                  to read the seller's return terms on the product page before placing an order.
                </p>
              </div>
            </div>
          </div>
        </PolicySection>

        {/* Contact Us */}
        <PolicySection id="contact" title="Contact Us" icon={Mail} highlight={true}>
          <p className="mb-6">
            For any questions about returns, refunds, or if you need to report a damaged product, please contact us:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <a
              href="mailto:hashimhusain313@gmail.com"
              className="flex items-center gap-3 p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-200"
            >
              <Mail className="w-5 h-5" />
              <div>
                <p className="font-semibold">Email Support</p>
                <p className="text-sm opacity-90">hashimhusain313@gmail.com</p>
              </div>
            </a>
            <a
              href="tel:8304025594"
              className="flex items-center gap-3 p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-200"
            >
              <Phone className="w-5 h-5" />
              <div>
                <p className="font-semibold">Phone Support</p>
                <p className="text-sm opacity-90">8304025594</p>
              </div>
            </a>
          </div>
          
          <div className="mt-6 p-4 bg-white/20 rounded-xl">
            <h4 className="font-semibold mb-2">Quick Response Times</h4>
            <p className="text-sm opacity-90">
              We aim to respond to all return and refund inquiries within 24 hours. 
              For urgent matters involving damaged products, please call us directly.
            </p>
          </div>
        </PolicySection>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-teal-500/20 rounded-xl">
              <RotateCcw className="w-8 h-8 text-teal-400" />
            </div>
          </div>
          <p className="text-gray-400 mb-2">© 2025 Serchby. All rights reserved.</p>
          <p className="text-sm text-gray-500">
            This return and refund policy is designed to ensure fair and transparent transactions for all users.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ReturnRefundPolicy;