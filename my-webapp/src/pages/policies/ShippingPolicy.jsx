// import React, { useState, useEffect } from 'react';
// import { Truck, Package, Clock, MapPin, Mail, Phone, AlertTriangle, CheckCircle, Users, DollarSign, Eye, AlertCircle } from 'lucide-react';

// const ShippingPolicy = () => {
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
//     { id: 'responsibility', title: 'Shipping Responsibility', icon: Users },
//     { id: 'timeframe', title: 'Shipping Timeframe', icon: Clock },
//     { id: 'charges', title: 'Shipping Charges', icon: DollarSign },
//     { id: 'tracking', title: 'Order Tracking', icon: Eye },
//     { id: 'delivery', title: 'Delivery Areas', icon: MapPin },
//     { id: 'delays', title: 'Delays and Issues', icon: AlertTriangle },
//     { id: 'damaged', title: 'Damaged or Lost Items', icon: Package },
//     { id: 'contact', title: 'Contact Information', icon: Mail }
//   ];

//   const PolicySection = ({ id, title, icon: Icon, children, highlight = false }) => (
//     <div
//       data-section={id}
//       className={`mb-8 p-6 md:p-8 rounded-2xl transition-all duration-500 transform ${
//         isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
//       } ${
//         highlight
//           ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-xl'
//           : 'bg-white/80 backdrop-blur-sm border border-teal-100 hover:border-teal-200 shadow-lg hover:shadow-xl'
//       } ${
//         activeSection === id ? 'ring-2 ring-teal-400 ring-opacity-50' : ''
//       }`}
//     >
//       <div className="flex items-center gap-3 mb-4">
//         <div className={`p-2 rounded-lg ${
//           highlight ? 'bg-white/20' : 'bg-teal-100'
//         }`}>
//           <Icon className={`w-5 h-5 ${
//             highlight ? 'text-white' : 'text-teal-600'
//           }`} />
//         </div>
//         <h2 className={`text-xl md:text-2xl font-bold ${
//           highlight ? 'text-white' : 'text-gray-900'
//         }`}>
//           {title}
//         </h2>
//       </div>
//       <div className={`space-y-4 ${
//         highlight ? 'text-white/90' : 'text-gray-700'
//       }`}>
//         {children}
//       </div>
//     </div>
//   );

//   const InfoCard = ({ icon: Icon, title, description, color = 'teal' }) => (
//     <div className={`flex items-start gap-3 p-4 bg-${color}-50 rounded-xl border border-${color}-100`}>
//       <div className={`p-2 bg-${color}-100 rounded-lg flex-shrink-0`}>
//         <Icon className={`w-4 h-4 text-${color}-600`} />
//       </div>
//       <div>
//         <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
//         <p className="text-gray-600 text-sm">{description}</p>
//       </div>
//     </div>
//   );

//   const TimelineItem = ({ time, description, isLast = false }) => (
//     <div className="flex items-start gap-4">
//       <div className="flex flex-col items-center">
//         <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
//         {!isLast && <div className="w-0.5 h-8 bg-teal-200 mt-2"></div>}
//       </div>
//       <div className="pb-8">
//         <p className="font-semibold text-gray-900">{time}</p>
//         <p className="text-gray-600 text-sm mt-1">{description}</p>
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
//               <Truck className="w-12 h-12 text-teal-400" />
//             </div>
//           </div>
//           <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-teal-100 bg-clip-text text-transparent">
//             Shipping Policy
//           </h1>
//           <p className="text-xl md:text-2xl text-gray-300 mb-2">Serchby</p>
//           <p className="text-gray-400 max-w-2xl mx-auto">
//             Fast, reliable, and transparent shipping for your marketplace experience.
//           </p>
//         </div>
//       </header>

//       {/* Navigation */}
//       <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-teal-100 shadow-sm">
//         <div className="container mx-auto max-w-6xl px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Truck className="w-6 h-6 text-teal-600" />
//               <span className="font-bold text-gray-900">Shipping Policy</span>
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
//             Committed to reliable shipping
//           </div>
//           <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
//             At Serchby, we are committed to providing a smooth and reliable shipping experience for both buyers and sellers. 
//             As a marketplace platform, shipping responsibilities may vary depending on the seller and product involved.
//           </p>
//         </div>

//         {/* Shipping Responsibility */}
//         <PolicySection id="responsibility" title="Shipping Responsibility" icon={Users}>
//           <div className="space-y-4">
//             <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
//               <Users className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-gray-900 mb-1">Sellers</p>
//                 <p className="text-gray-600">Sellers on Serchby are responsible for packaging and dispatching orders to buyers.</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
//               <AlertCircle className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-gray-900 mb-1">Buyers</p>
//                 <p className="text-gray-600">Buyers are advised to check the individual seller's shipping timelines and methods before placing an order.</p>
//               </div>
//             </div>
//           </div>
//         </PolicySection>

//         {/* Shipping Timeframe */}
//         <PolicySection id="timeframe" title="Shipping Timeframe" icon={Clock}>
//           <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-100 mb-6">
//             <div className="flex items-center gap-3 mb-4">
//               <Clock className="w-6 h-6 text-teal-600" />
//               <h3 className="text-lg font-semibold text-gray-900">Typical Delivery Timeline</h3>
//             </div>
//             <div className="space-y-4">
//               <TimelineItem 
//                 time="2-7 Business Days" 
//                 description="Most orders are processed and delivered within this timeframe after order confirmation"
//               />
//               <TimelineItem 
//                 time="Extended Delivery" 
//                 description="Delivery times may extend due to unforeseen factors such as high demand, courier delays, or regional restrictions"
//                 isLast={true}
//               />
//             </div>
//           </div>
//           <div className="bg-gray-50 p-4 rounded-xl">
//             <p className="text-sm text-gray-600">
//               <strong>Note:</strong> Estimated delivery times vary by product and seller. Always check individual seller timelines.
//             </p>
//           </div>
//         </PolicySection>

//         {/* Shipping Charges */}
//         <PolicySection id="charges" title="Shipping Charges" icon={DollarSign}>
//           <div className="grid gap-4 md:grid-cols-2">
//             <div className="p-4 bg-green-50 rounded-xl border border-green-100">
//               <div className="flex items-center gap-2 mb-2">
//                 <CheckCircle className="w-5 h-5 text-green-600" />
//                 <h4 className="font-semibold text-gray-900">Free Shipping</h4>
//               </div>
//               <p className="text-sm text-gray-600">Some products may offer free shipping</p>
//             </div>
//             <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
//               <div className="flex items-center gap-2 mb-2">
//                 <DollarSign className="w-5 h-5 text-orange-600" />
//                 <h4 className="font-semibold text-gray-900">Paid Shipping</h4>
//               </div>
//               <p className="text-sm text-gray-600">Charges based on location, weight, or delivery speed</p>
//             </div>
//           </div>
//           <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-gray-900 mb-1">Pricing Information</p>
//                 <p className="text-gray-600">Shipping fees (if any) are set by the seller and displayed during checkout.</p>
//               </div>
//             </div>
//           </div>
//         </PolicySection>

//         {/* Order Tracking */}
//         <PolicySection id="tracking" title="Order Tracking" icon={Eye}>
//           <div className="space-y-4">
//             <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
//               <Package className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-gray-900 mb-1">Tracking Number</p>
//                 <p className="text-gray-600">Once the seller ships your order, a tracking number (if applicable) may be shared with you via email or platform notification.</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
//               <Eye className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-gray-900 mb-1">Monitor Status</p>
//                 <p className="text-gray-600">Buyers can use this information to monitor the shipment status.</p>
//               </div>
//             </div>
//           </div>
//         </PolicySection>

//         {/* Delivery Areas */}
//         <PolicySection id="delivery" title="Delivery Areas" icon={MapPin}>
//           <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
//             <div className="flex items-start gap-3">
//               <MapPin className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
//               <div className="space-y-3">
//                 <div>
//                   <p className="font-semibold text-gray-900 mb-1">Pan-India Coverage</p>
//                   <p className="text-gray-600">Most sellers offer pan-India shipping, but availability may vary by location.</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-900 mb-1">Remote Areas</p>
//                   <p className="text-gray-600">Remote or restricted areas may experience longer delivery times or limited delivery services.</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </PolicySection>

//         {/* Delays and Issues */}
//         <PolicySection id="delays" title="Delays and Issues" icon={AlertTriangle}>
//           <div className="bg-red-50 border border-red-100 rounded-xl p-6">
//             <div className="flex items-start gap-3">
//               <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
//               <div className="space-y-3">
//                 <div>
//                   <p className="font-semibold text-gray-900 mb-1">Platform Liability</p>
//                   <p className="text-gray-600">Serchby is not liable for shipping delays, courier errors, or delivery failures caused by third-party logistics providers.</p>
//                 </div>
//                 <div>
//                   <p className="font-semibold text-gray-900 mb-1">Support Available</p>
//                   <p className="text-gray-600">In case of any delay or non-delivery, please contact the seller directly or reach out to us at{' '}
//                     <a href="mailto:hashimhusain313@gmail.com" className="text-red-700 hover:text-red-900 underline">
//                       hashimhusain313@gmail.com
//                     </a>{' '}for assistance.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </PolicySection>

//         {/* Damaged or Lost Items */}
//         <PolicySection id="damaged" title="Damaged or Lost Items" icon={Package}>
//           <div className="space-y-4">
//             <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
//               <Package className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-gray-900 mb-1">Immediate Action Required</p>
//                 <p className="text-gray-600">If your order arrives damaged or is lost in transit, please contact the seller immediately.</p>
//               </div>
//             </div>
//             <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-xl border border-teal-100">
//               <CheckCircle className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
//               <div>
//                 <p className="font-semibold text-gray-900 mb-1">Resolution Process</p>
//                 <p className="text-gray-600">Resolution (such as replacement or refund) is at the seller's discretion, though Serchby may step in to mediate when required.</p>
//               </div>
//             </div>
//           </div>
//         </PolicySection>

//         {/* Contact Information */}
//         <PolicySection id="contact" title="Contact Information" icon={Mail} highlight={true}>
//           <p className="mb-6">
//             For any questions or concerns related to shipping, feel free to contact us:
//           </p>
//           <div className="grid gap-4 md:grid-cols-2">
//             <a
//               href="mailto:hashimhusain313@gmail.com"
//               className="flex items-center gap-3 p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-200"
//             >
//               <Mail className="w-5 h-5" />
//               <div>
//                 <p className="font-semibold">Email Support</p>
//                 <p className="text-sm opacity-90">hashimhusain313@gmail.com</p>
//               </div>
//             </a>
//             <a
//               href="tel:8304025594"
//               className="flex items-center gap-3 p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-200"
//             >
//               <Phone className="w-5 h-5" />
//               <div>
//                 <p className="font-semibold">Phone Support</p>
//                 <p className="text-sm opacity-90">8304025594</p>
//               </div>
//             </a>
//           </div>
//         </PolicySection>
//       </main>

//       {/* Footer */}
//       <footer className="bg-gray-900 text-white py-8 px-4">
//         <div className="container mx-auto max-w-4xl text-center">
//           <div className="flex justify-center mb-4">
//             <div className="p-3 bg-teal-500/20 rounded-xl">
//               <Truck className="w-8 h-8 text-teal-400" />
//             </div>
//           </div>
//           <p className="text-gray-400 mb-2">© 2025 Serchby. All rights reserved.</p>
//           <p className="text-sm text-gray-500">
//             Committed to providing reliable shipping solutions for our marketplace community.
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default ShippingPolicy;
import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="bg-white min-h-screen py-10 px-4 md:px-16 text-gray-800 font-sans">
      <div className="max-w-4xl mx-auto shadow-md rounded-2xl bg-white p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-8 text-violet-700">Shipping Policy</h1>

        <p className="text-center text-gray-500 mb-10">
          At Serchby, we are committed to providing a smooth and reliable shipping experience for both buyers and sellers. As a marketplace platform, shipping responsibilities may vary depending on the seller and product involved.
        </p>

        <div className="space-y-6">
          <Section number="1" title="Shipping Responsibility">
            Sellers on Serchby are responsible for packaging and dispatching orders to buyers.<br />
            Buyers are advised to check the individual seller’s shipping timelines and methods before placing an order.
          </Section>

          <Section number="2" title="Shipping Timeframe">
            Estimated delivery times vary by product and seller.<br />
            Most orders are processed and delivered within 2–7 business days after order confirmation.<br />
            Delivery times may extend due to unforeseen factors such as high demand, courier delays, or regional restrictions.
          </Section>

          <Section number="3" title="Shipping Charges">
            Shipping fees (if any) are set by the seller and displayed during checkout.<br />
            Some products may offer free shipping, while others may have a charge based on location, weight, or delivery speed.
          </Section>

          <Section number="4" title="Order Tracking">
            Once the seller ships your order, a tracking number (if applicable) may be shared with you via email or platform notification.<br />
            Buyers can use this information to monitor the shipment status.
          </Section>

          <Section number="5" title="Delivery Areas">
            Most sellers offer pan-India shipping, but availability may vary by location.<br />
            Remote or restricted areas may experience longer delivery times or limited delivery services.
          </Section>

          <Section number="6" title="Delays and Issues">
            Serchby is not liable for shipping delays, courier errors, or delivery failures caused by third-party logistics providers.<br />
            In case of any delay or non-delivery, please contact the seller directly or reach out to us at <a href="mailto:hashimhusain313@gmail.com" className="text-violet-600">hashimhusain313@gmail.com</a> for assistance.
          </Section>

          <Section number="7" title="Damaged or Lost Items">
            If your order arrives damaged or is lost in transit, please contact the seller immediately.<br />
            Resolution (such as replacement or refund) is at the seller’s discretion, though Serchby may step in to mediate when required.
          </Section>

          <Section number="8" title="Contact Information">
            For any questions or concerns related to shipping, feel free to contact us:<br />
            📧 <a href="mailto:hashimhusain313@gmail.com" className="text-violet-600">hashimhusain313@gmail.com</a><br />
            📞 <a href="tel:8304025594" className="text-violet-600">8304025594</a>
          </Section>
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

export default ShippingPolicy;
