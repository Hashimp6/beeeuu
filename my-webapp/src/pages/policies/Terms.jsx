
// import React, { useState, useEffect } from 'react';
// import { 
//   FileText, 
//   Mail, 
//   Phone, 
//   User, 
//   Shield, 
//   AlertTriangle, 
//   ShoppingCart, 
//   CreditCard, 
//   Copyright,
//   Ban,
//   Scale,
//   Users,
//   CheckCircle,
//   Building,
//   Gavel,
//   UserCheck
// } from 'lucide-react';

// const TermsAndConditions = () => {
//   const [activeSection, setActiveSection] = useState('');
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     setIsVisible(true);
    
//     const handleScroll = () => {
//       const sections = document.querySelectorAll('[data-section]');
//       const scrollY = window.scrollY;
      
//       sections.forEach((section) => {
//         const sectionTop = section.offsetTop - 100;
//         const sectionHeight = section.offsetHeight;
//         const sectionId = section.getAttribute('data-section');
        
//         if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
//           setActiveSection(sectionId);
//         }
//       });
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const scrollToSection = (sectionId) => {
//     const element = document.querySelector(`[data-section="${sectionId}"]`);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }
//   };

//   const sections = [
//     { id: 'about', title: 'About Serchby', icon: Building },
//     { id: 'eligibility', title: 'User Eligibility', icon: UserCheck },
//     { id: 'account', title: 'Account Responsibilities', icon: User },
//     { id: 'conduct', title: 'User Conduct', icon: Shield },
//     { id: 'listing', title: 'Listing and Selling', icon: ShoppingCart },
//     { id: 'transactions', title: 'Transactions', icon: CreditCard },
//     { id: 'fees', title: 'Fees and Payments', icon: CreditCard },
//     { id: 'ip', title: 'Intellectual Property', icon: Copyright },
//     { id: 'termination', title: 'Suspension and Termination', icon: Ban },
//     { id: 'liability', title: 'Limitation of Liability', icon: Scale },
//     { id: 'changes', title: 'Changes to Terms', icon: FileText },
//     { id: 'law', title: 'Governing Law', icon: Gavel },
//     { id: 'contact', title: 'Contact Us', icon: Mail }
//   ];

//   const PolicySection = ({ id, title, icon: Icon, children, highlight = false, warning = false }) => (
//     <div
//       data-section={id}
//       className={`mb-8 p-6 md:p-8 rounded-2xl transition-all duration-500 transform ${
//         isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
//       } ${
//         highlight
//           ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-xl'
//           : warning
//           ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-lg hover:shadow-xl'
//           : 'bg-white/80 backdrop-blur-sm border border-teal-100 hover:border-teal-200 shadow-lg hover:shadow-xl'
//       } ${
//         activeSection === id ? 'ring-2 ring-teal-400 ring-opacity-50' : ''
//       }`}
//     >
//       <div className="flex items-center gap-3 mb-4">
//         <div className={`p-2 rounded-lg ${
//           highlight ? 'bg-white/20' : warning ? 'bg-amber-100' : 'bg-teal-100'
//         }`}>
//           <Icon className={`w-5 h-5 ${
//             highlight ? 'text-white' : warning ? 'text-amber-600' : 'text-teal-600'
//           }`} />
//         </div>
//         <h2 className={`text-xl md:text-2xl font-bold ${
//           highlight ? 'text-white' : warning ? 'text-amber-900' : 'text-gray-900'
//         }`}>
//           {title}
//         </h2>
//       </div>
//       <div className={`space-y-4 ${
//         highlight ? 'text-white/90' : warning ? 'text-amber-900' : 'text-gray-700'
//       }`}>
//         {children}
//       </div>
//     </div>
//   );

//   const InfoCard = ({ icon: Icon, title, description, color = 'teal' }) => (
//     <div className={`p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${
//       color === 'teal' 
//         ? 'bg-teal-50 border-teal-100 hover:border-teal-200' 
//         : color === 'red'
//         ? 'bg-red-50 border-red-100 hover:border-red-200'
//         : 'bg-amber-50 border-amber-100 hover:border-amber-200'
//     }`}>
//       <div className="flex items-start gap-3">
//         <div className={`p-2 rounded-lg flex-shrink-0 ${
//           color === 'teal' 
//             ? 'bg-teal-100' 
//             : color === 'red'
//             ? 'bg-red-100'
//             : 'bg-amber-100'
//         }`}>
//           <Icon className={`w-4 h-4 ${
//             color === 'teal' 
//               ? 'text-teal-600' 
//               : color === 'red'
//               ? 'text-red-600'
//               : 'text-amber-600'
//           }`} />
//         </div>
//         <div>
//           <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
//           <p className="text-gray-600 text-sm">{description}</p>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-white via-teal-50/30 to-teal-100/50">
//       {/* Header */}
//       <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-4 relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 to-transparent"></div>
//         <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-400/5 rounded-full blur-3xl"></div>
        
//         <div className="container mx-auto max-w-4xl text-center relative z-10">
//           <div className="flex justify-center mb-6">
//             <div className="p-4 bg-teal-500/20 rounded-2xl backdrop-blur-sm">
//               <FileText className="w-12 h-12 text-teal-400" />
//             </div>
//           </div>
//           <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-teal-100 bg-clip-text text-transparent">
//             Terms & Conditions
//           </h1>
//           <p className="text-xl md:text-2xl text-gray-300 mb-2">Serchby</p>
//           <p className="text-gray-400 max-w-2xl mx-auto">
//             Please read these terms carefully before using our platform and services.
//           </p>
//         </div>
//       </header>

//       {/* Navigation */}
//       <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-teal-100 shadow-sm">
//         <div className="container mx-auto max-w-6xl px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <FileText className="w-6 h-6 text-teal-600" />
//               <span className="font-bold text-gray-900">Terms & Conditions</span>
//             </div>
//             <div className="hidden md:flex items-center gap-2 overflow-x-auto">
//               {sections.slice(0, 5).map((section) => (
//                 <button
//                   key={section.id}
//                   onClick={() => scrollToSection(section.id)}
//                   className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
//                     activeSection === section.id
//                       ? 'bg-teal-100 text-teal-700'
//                       : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
//                   }`}
//                 >
//                   {section.title}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <main className="container mx-auto max-w-4xl px-4 py-12">
//         {/* Introduction */}
//         <div className="text-center mb-12">
//           <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
//             <CheckCircle className="w-4 h-4" />
//             Effective upon accessing our platform
//           </div>
//           <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
//             Welcome to Serchby! These Terms and Conditions ("Terms") govern your use of our platform and services. 
//             By accessing or using Serchby, you agree to be bound by these Terms. If you do not agree, please do not use our services.
//           </p>
//         </div>

//         {/* About Serchby */}
//         <PolicySection id="about" title="About Serchby" icon={Building}>
//           <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-100">
//             <div className="flex items-start gap-3">
//               <Building className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="text-gray-700 leading-relaxed">
//                   Serchby is an online marketplace that connects buyers and sellers. We act as a facilitator and are not directly 
//                   involved in the transactions between users.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </PolicySection>

//         {/* User Eligibility */}
//         <PolicySection id="eligibility" title="User Eligibility" icon={UserCheck}>
//           <div className="grid gap-4 md:grid-cols-1">
//             <InfoCard
//               icon={User}
//               title="Age Requirement"
//               description="You must be at least 18 years old to use our platform."
//               color="teal"
//             />
//             <InfoCard
//               icon={CheckCircle}
//               title="Account Information"
//               description="By registering, you confirm that all information provided is accurate and complete."
//               color="teal"
//             />
//           </div>
//         </PolicySection>

//         {/* Account Responsibilities */}
//         <PolicySection id="account" title="Account Responsibilities" icon={User}>
//           <div className="space-y-4">
//             <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
//               <Shield className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-amber-900 mb-1">Account Security</p>
//                 <p className="text-amber-800">You are responsible for maintaining the confidentiality of your account information.</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
//               <AlertTriangle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-red-900 mb-1">Account Liability</p>
//                 <p className="text-red-800">You are liable for all activities that occur under your account.</p>
//               </div>
//             </div>
//           </div>
//         </PolicySection>

//         {/* User Conduct */}
//         <PolicySection id="conduct" title="User Conduct" icon={Shield} warning={true}>
//           <p className="mb-6">You agree not to:</p>
//           <div className="space-y-3">
//             {[
//               'Violate any applicable laws or regulations',
//               'Post false, misleading, or harmful content',
//               'Use the platform for fraudulent transactions',
//               'Infringe on any third-party rights'
//             ].map((item, index) => (
//               <div key={index} className="flex items-start gap-3">
//                 <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
//                 <p className="text-amber-900">{item}</p>
//               </div>
//             ))}
//           </div>
//         </PolicySection>

//         {/* Listing and Selling */}
//         <PolicySection id="listing" title="Listing and Selling" icon={ShoppingCart}>
//           <div className="space-y-4">
//             <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-xl border border-teal-100">
//               <ShoppingCart className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-teal-900 mb-1">Seller Responsibilities</p>
//                 <p className="text-teal-800">Sellers are responsible for the accuracy of their listings and the delivery of sold items.</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
//               <AlertTriangle className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-gray-900 mb-1">Platform Disclaimer</p>
//                 <p className="text-gray-700">Serchby does not guarantee the quality, safety, or legality of items listed by users.</p>
//               </div>
//             </div>
//           </div>
//         </PolicySection>

//         {/* Transactions */}
//         <PolicySection id="transactions" title="Transactions" icon={CreditCard}>
//           <div className="space-y-4">
//             <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
//               <Users className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-blue-900 mb-1">Direct Transactions</p>
//                 <p className="text-blue-800">All transactions are conducted directly between buyers and sellers.</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
//               <Scale className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-gray-900 mb-1">Dispute Resolution</p>
//                 <p className="text-gray-700">
//                   Serchby is not responsible for disputes, returns, or chargebacks between users, 
//                   though we may assist in resolving issues where possible.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </PolicySection>

//         {/* Fees and Payments */}
//         <PolicySection id="fees" title="Fees and Payments" icon={CreditCard}>
//           <div className="space-y-4">
//             <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
//               <CreditCard className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-green-900 mb-1">Service Fees</p>
//                 <p className="text-green-800">We may charge a service or commission fee on sales made through the platform.</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
//               <AlertTriangle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-amber-900 mb-1">Fee Changes</p>
//                 <p className="text-amber-800">Any applicable fees will be communicated clearly and are subject to change with notice.</p>
//               </div>
//             </div>
//           </div>
//         </PolicySection>

//         {/* Intellectual Property */}
//         <PolicySection id="ip" title="Intellectual Property" icon={Copyright}>
//           <div className="space-y-4">
//             <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
//               <Copyright className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-purple-900 mb-1">Platform Content</p>
//                 <p className="text-purple-800">All content on Serchby (except user-generated content) is our property or licensed to us.</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
//               <Ban className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-red-900 mb-1">Usage Restrictions</p>
//                 <p className="text-red-800">Users may not use our content without written permission.</p>
//               </div>
//             </div>
//           </div>
//         </PolicySection>

//         {/* Suspension and Termination */}
//         <PolicySection id="termination" title="Suspension and Termination" icon={Ban} warning={true}>
//           <div className="bg-red-50 p-6 rounded-xl border border-red-200">
//             <div className="flex items-start gap-3">
//               <Ban className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="text-red-900 font-semibold mb-2">Account Termination</p>
//                 <p className="text-red-800 leading-relaxed">
//                   We reserve the right to suspend or terminate accounts that violate these Terms or misuse the platform in any way.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </PolicySection>

//         {/* Limitation of Liability */}
//         <PolicySection id="liability" title="Limitation of Liability" icon={Scale} warning={true}>
//           <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
//             <div className="flex items-start gap-3">
//               <Scale className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="text-amber-900 font-semibold mb-2">Liability Limitation</p>
//                 <p className="text-amber-800 leading-relaxed">
//                   Serchby is not liable for any direct, indirect, incidental, or consequential damages arising out of 
//                   the use or inability to use the platform.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </PolicySection>

//         {/* Changes to Terms */}
//         <PolicySection id="changes" title="Changes to the Terms" icon={FileText}>
//           <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
//             <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
//             <div>
//               <p className="text-blue-900 font-semibold mb-1">Terms Updates</p>
//               <p className="text-blue-800">
//                 We may modify these Terms at any time. Continued use of Serchby constitutes your acceptance of the revised Terms.
//               </p>
//             </div>
//           </div>
//         </PolicySection>

//         {/* Governing Law */}
//         <PolicySection id="law" title="Governing Law" icon={Gavel}>
//           <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
//             <div className="flex items-start gap-3">
//               <Gavel className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="text-indigo-900 font-semibold mb-1">Jurisdiction</p>
//                 <p className="text-indigo-800 leading-relaxed">
//                   These Terms shall be governed by the laws of India.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </PolicySection>

//         {/* Contact Us */}
//         <PolicySection id="contact" title="Contact Us" icon={Mail} highlight={true}>
//           <p className="mb-6">
//             If you have any questions about these Terms, please contact us at:
//           </p>
//           <div className="grid gap-4 md:grid-cols-2 mb-6">
//             <a
//               href="mailto:hashimhusain313@gmail.com"
//               className="flex items-center gap-3 p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-200"
//             >
//               <Mail className="w-5 h-5" />
//               <div>
//                 <p className="font-semibold">Email</p>
//                 <p className="text-sm opacity-90">hashimhusain313@gmail.com</p>
//               </div>
//             </a>
//             <a
//               href="tel:8304025594"
//               className="flex items-center gap-3 p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-200"
//             >
//               <Phone className="w-5 h-5" />
//               <div>
//                 <p className="font-semibold">Phone</p>
//                 <p className="text-sm opacity-90">8304025594</p>
//               </div>
//             </a>
//           </div>
//           <div className="bg-white/20 p-4 rounded-xl">
//             <p className="text-center">
//               <span className="font-semibold">Managed By:</span> MR HASHIM H
//             </p>
//           </div>
//         </PolicySection>
//       </main>

//       {/* Footer */}
//       <footer className="bg-gray-900 text-white py-8 px-4">
//         <div className="container mx-auto max-w-4xl text-center">
//           <div className="flex justify-center mb-4">
//             <div className="p-3 bg-teal-500/20 rounded-xl">
//               <FileText className="w-8 h-8 text-teal-400" />
//             </div>
//           </div>
//           <p className="text-gray-400 mb-2">© 2025 Serchby. All rights reserved.</p>
//           <p className="text-sm text-gray-500">
//             These terms and conditions are designed to protect both users and our platform.
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default TermsAndConditions;
import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="bg-white min-h-screen py-10 px-4 md:px-16 text-gray-800 font-sans">
      <div className="max-w-4xl mx-auto shadow-md rounded-2xl bg-white p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-8 text-violet-700">Terms and Conditions</h1>

        <p className="text-center text-gray-500 mb-10">Welcome to Serchby! These Terms and Conditions ("Terms") govern your use of our platform and services. By accessing or using Serchby, you agree to be bound by these Terms. If you do not agree, please do not use our services.</p>

        <div className="space-y-6">
          <Section number="1" title="About Serchby">
            Serchby is an online marketplace that connects buyers and sellers. We act as a facilitator and are not directly involved in the transactions between users.
          </Section>

          <Section number="2" title="User Eligibility">
            You must be at least 18 years old to use our platform.<br />
            By registering, you confirm that all information provided is accurate and complete.
          </Section>

          <Section number="3" title="Account Responsibilities">
            You are responsible for maintaining the confidentiality of your account information.<br />
            You are liable for all activities that occur under your account.
          </Section>

          <Section number="4" title="User Conduct">
            You agree not to:
            <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
              <li>Violate any applicable laws or regulations</li>
              <li>Post false, misleading, or harmful content</li>
              <li>Use the platform for fraudulent transactions</li>
              <li>Infringe on any third-party rights</li>
            </ul>
          </Section>

          <Section number="5" title="Listing and Selling">
            Sellers are responsible for the accuracy of their listings and the delivery of sold items.<br />
            Serchby does not guarantee the quality, safety, or legality of items listed by users.
          </Section>

          <Section number="6" title="Transactions">
            All transactions are conducted directly between buyers and sellers.<br />
            Serchby is not responsible for disputes, returns, or chargebacks between users, though we may assist in resolving issues where possible.
          </Section>

          <Section number="7" title="Fees and Payments">
            We may charge a service or commission fee on sales made through the platform.<br />
            Any applicable fees will be communicated clearly and are subject to change with notice.
          </Section>

          <Section number="8" title="Intellectual Property">
            All content on Serchby (except user-generated content) is our property or licensed to us.<br />
            Users may not use our content without written permission.
          </Section>

          <Section number="9" title="Suspension and Termination">
            We reserve the right to suspend or terminate accounts that violate these Terms or misuse the platform in any way.
          </Section>

          <Section number="10" title="Limitation of Liability">
            Serchby is not liable for any direct, indirect, incidental, or consequential damages arising out of the use or inability to use the platform.
          </Section>

          <Section number="11" title="Changes to the Terms">
            We may modify these Terms at any time. Continued use of Serchby constitutes your acceptance of the revised Terms.
          </Section>

          <Section number="12" title="Governing Law">
            These Terms shall be governed by the laws of India.
          </Section>
        </div>

        <div className="mt-10 border-t pt-6 text-sm text-gray-600">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Contact Us:</h2>
          <p><strong>Email:</strong> <a href="mailto:hashimhusain313@gmail.com" className="text-violet-600">hashimhusain313@gmail.com</a></p>
          <p><strong>Phone:</strong> <a href="tel:8304025594" className="text-violet-600">8304025594</a></p>
          <p className="mt-2"><strong>Managed by:</strong> MR HASHIM H</p>
        </div>
      </div>
    </div>
  );
};

const Section = ({ number, title, children }) => (
  <div>
    <h2 className="text-xl font-bold text-violet-700 mb-1">{number}. {title}</h2>
    <p className="text-gray-700">{children}</p>
  </div>
);

export default TermsAndConditions;
