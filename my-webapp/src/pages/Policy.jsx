import React, { useState, useEffect } from 'react';
import { Shield, Mail, Phone, Eye, Lock, Users, FileText, ExternalLink, User, Database, AlertCircle, CheckCircle } from 'lucide-react';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('');
  const [isVisible, setIsVisible] = useState(false);

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
    { id: 'collection', title: 'Information We Collect', icon: Database },
    { id: 'usage', title: 'How We Use Your Information', icon: Eye },
    { id: 'sharing', title: 'Sharing of Information', icon: Users },
    { id: 'security', title: 'Data Security', icon: Lock },
    { id: 'rights', title: 'Your Rights', icon: User },
    { id: 'links', title: 'Third-Party Links', icon: ExternalLink },
    { id: 'children', title: 'Children\'s Privacy', icon: Shield },
    { id: 'changes', title: 'Changes to This Policy', icon: FileText },
    { id: 'contact', title: 'Contact Us', icon: Mail }
  ];

  const PolicySection = ({ id, title, icon: Icon, children, highlight = false }) => (
    <div
      data-section={id}
      className={`mb-8 p-6 md:p-8 rounded-2xl transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${
        highlight
          ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-xl'
          : 'bg-white/80 backdrop-blur-sm border border-teal-100 hover:border-teal-200 shadow-lg hover:shadow-xl'
      } ${
        activeSection === id ? 'ring-2 ring-teal-400 ring-opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${
          highlight ? 'bg-white/20' : 'bg-teal-100'
        }`}>
          <Icon className={`w-5 h-5 ${
            highlight ? 'text-white' : 'text-teal-600'
          }`} />
        </div>
        <h2 className={`text-xl md:text-2xl font-bold ${
          highlight ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h2>
      </div>
      <div className={`space-y-4 ${
        highlight ? 'text-white/90' : 'text-gray-700'
      }`}>
        {children}
      </div>
    </div>
  );

  const InfoItem = ({ icon: Icon, title, description }) => (
    <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-xl border border-teal-100">
      <div className="p-2 bg-teal-100 rounded-lg flex-shrink-0">
        <Icon className="w-4 h-4 text-teal-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
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
              <Shield className="w-12 h-12 text-teal-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-teal-100 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-2">Serchby</p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your privacy is our priority. Learn how we protect and handle your personal information.
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-teal-100 shadow-sm">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-teal-600" />
              <span className="font-bold text-gray-900">Privacy Policy</span>
            </div>
            <div className="hidden md:flex items-center gap-2 overflow-x-auto">
              {sections.slice(0, 5).map((section) => (
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
            <CheckCircle className="w-4 h-4" />
            Effective immediately upon posting
          </div>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            At Serchby, we are committed to safeguarding your privacy and protecting your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and secure your data when you access or use our platform.
          </p>
        </div>

        {/* Information We Collect */}
        <PolicySection id="collection" title="Information We Collect" icon={Database}>
          <p className="text-base leading-relaxed mb-6">
            We may collect the following types of information from users:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoItem
              icon={User}
              title="Personal Information"
              description="Name, email address, phone number, address, payment details, etc."
            />
            <InfoItem
              icon={Lock}
              title="Account Information"
              description="Username, password, profile data, order history."
            />
            <InfoItem
              icon={Eye}
              title="Usage Data"
              description="Device type, browser, IP address, access times, and browsing behavior."
            />
            <InfoItem
              icon={Database}
              title="Cookies and Tracking"
              description="We use cookies and similar technologies to enhance user experience and analyze platform performance."
            />
          </div>
        </PolicySection>

        {/* How We Use Your Information */}
        <PolicySection id="usage" title="How We Use Your Information" icon={Eye}>
          <p className="mb-6">We use the collected information to:</p>
          <div className="space-y-3">
            {[
              'Facilitate marketplace transactions between buyers and sellers',
              'Provide and manage your account and orders',
              'Communicate updates, offers, or support responses',
              'Analyze user behavior and improve platform functionality',
              'Detect and prevent fraudulent or unauthorized activity',
              'Comply with legal obligations'
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </PolicySection>

        {/* Sharing of Information */}
        <PolicySection id="sharing" title="Sharing of Information" icon={Users}>
          <p className="mb-6">We do not sell or rent your personal data to third parties. We may share data with:</p>
          <div className="space-y-4">
            {[
              { title: 'Sellers', desc: 'to fulfill your orders and respond to queries' },
              { title: 'Service Providers', desc: 'for payments, logistics, and analytics' },
              { title: 'Law Enforcement or Government Authorities', desc: 'when required by law' }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="font-semibold text-gray-900">{item.title}</span>
                  <span className="text-gray-600"> {item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </PolicySection>

        {/* Data Security */}
        <PolicySection id="security" title="Data Security" icon={Lock}>
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-100">
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-700 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your data from unauthorized access, 
                  disclosure, or loss. However, no system is 100% secure, and we encourage users to maintain strong account passwords.
                </p>
              </div>
            </div>
          </div>
        </PolicySection>

        {/* Your Rights */}
        <PolicySection id="rights" title="Your Rights" icon={User}>
          <p className="mb-6">You have the right to:</p>
          <div className="grid gap-4 md:grid-cols-1">
            {[
              'Access or update your personal information',
              'Request deletion of your account or data (subject to legal and business obligations)',
              'Opt out of marketing communications at any time'
            ].map((right, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-teal-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <p className="text-gray-700">{right}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800">
              <strong>To exercise any of these rights,</strong> contact us at{' '}
              <a href="mailto:hashimhusain313@gmail.com" className="text-amber-700 hover:text-amber-900 underline">
                hashimhusain313@gmail.com
              </a>
            </p>
          </div>
        </PolicySection>

        {/* Third-Party Links */}
        <PolicySection id="links" title="Third-Party Links" icon={ExternalLink}>
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <p className="text-gray-700">
              Our platform may contain links to external websites. We are not responsible for the privacy practices or content of those sites.
            </p>
          </div>
        </PolicySection>

        {/* Children's Privacy */}
        <PolicySection id="children" title="Children's Privacy" icon={Shield}>
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border border-red-100">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-700 leading-relaxed">
                  Serchby is not intended for children under the age of 13. We do not knowingly collect data from minors. 
                  If we become aware of such data, we will take appropriate steps to delete it.
                </p>
              </div>
            </div>
          </div>
        </PolicySection>

        {/* Changes to This Policy */}
        <PolicySection id="changes" title="Changes to This Policy" icon={FileText}>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. Any changes will be posted on this page and will be effective immediately upon posting.
          </p>
        </PolicySection>

        {/* Contact Us */}
        <PolicySection id="contact" title="Contact Us" icon={Mail} highlight={true}>
          <p className="mb-6">
            If you have any questions or concerns about this Privacy Policy, please reach out to us at:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <a
              href="mailto:hashimhusain313@gmail.com"
              className="flex items-center gap-3 p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-200"
            >
              <Mail className="w-5 h-5" />
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm opacity-90">hashimhusain313@gmail.com</p>
              </div>
            </a>
            <a
              href="tel:8304025594"
              className="flex items-center gap-3 p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-200"
            >
              <Phone className="w-5 h-5" />
              <div>
                <p className="font-semibold">Phone</p>
                <p className="text-sm opacity-90">8304025594</p>
              </div>
            </a>
          </div>
        </PolicySection>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-teal-500/20 rounded-xl">
              <Shield className="w-8 h-8 text-teal-400" />
            </div>
          </div>
          <p className="text-gray-400 mb-2">© 2025 Serchby. All rights reserved.</p>
          <p className="text-sm text-gray-500">
            This privacy policy is designed to help you understand how we collect, use, and protect your information.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;