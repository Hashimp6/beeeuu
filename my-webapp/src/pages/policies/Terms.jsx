
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
          <Section number="13" title="Disclaimer Regarding Services">
          Our platform/business facilitates the provision of services offered by independent sellers. Please note that all services are operated solely by the respective sellers. We do not have any responsibility or liability for the quality, delivery, or any other aspect of the services provided by these sellers.
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
