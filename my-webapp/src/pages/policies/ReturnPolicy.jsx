// import React from 'react';

const ReturnRefundPolicy = () => {
  return (
    <div className="bg-white min-h-screen py-10 px-4 md:px-16 text-gray-800 font-sans">
      <div className="max-w-4xl mx-auto shadow-md rounded-2xl bg-white p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-8 text-violet-700">Return & Refund Policy</h1>

        <p className="text-center text-gray-500 mb-10">
          At Serchby, we aim to ensure a smooth and trustworthy shopping experience for both buyers and sellers. As a marketplace, return and refund processes may vary depending on the individual seller’s policies. Please read the following terms carefully.
        </p>

        <div className="space-y-6">
          <Section number="1" title="Return Eligibility">
            Return requests must be raised within 7 days of receiving the product.<br /><br />
            To be eligible for a return, the item must be:
            <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
              <li>Unused and in the same condition as received</li>
              <li>In its original packaging with tags, accessories, or documents (if any)</li>
           
            </ul>
          </Section>

          <Section number="2" title="Damaged or Defective Products">
            If you receive a damaged, defective, or wrong item:<br /><br />
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>Inform the seller directly or contact us at <a href="mailto:hashimhusain313@gmail.com" className="text-violet-600">hashimhusain313@gmail.com</a> within 48 hours of receiving the product.</li>
              <li>Provide clear photos or videos as proof of the issue.</li>
              <li>Upon seller approval, you will be asked to return the item to the original shipping address.</li>
            </ul>
            <p className="mt-2">
              As we do not provide replacements or exchanges, if you receive any damaged or defective products, you must notify us within 48 hours of receiving the product to raise a return request. Once approved, you should send the item back to the original shipping address to initiate a refund.
            </p>
          </Section>

          <Section number="3" title="Refund Process">
            Once the returned item is received and inspected, and if approved by the seller, your refund will be credited to your original method of payment within 7–10 business days.<br />
            Refunds may be subject to deductions (e.g., shipping or handling charges) depending on the seller’s policy.
          </Section>

          <Section number="4" title="Non-Returnable Items">
            The following items are typically non-returnable:
            <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
              {/* <li>Downloadable software or digital products</li>
              <li>Custom-made or personalized items</li>
              <li>Perishable goods</li> */}
              <li>Items marked as “Final Sale” or “Non-returnable” by the seller</li>
            </ul>
          </Section>

          <Section number="5" title="Seller-Specific Policies">
            Each seller on Serchby may have individual return and refund rules.<br />
            Buyers are encouraged to read the seller’s return terms on the product page before placing an order.
          </Section>
          <Section number="5" title="Cancellation and Refund Policy"> 
            If you cancel the appointment within 24 hours of the booking date, 80% of the amount paid will be refunded.

          </Section>
         
        </div>

        <div className="mt-10 border-t pt-6 text-sm text-gray-600">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Contact Information</h2>
          <p>📧 <a href="mailto:hashimhusain313@gmail.com" className="text-violet-600">hashimhusain313@gmail.com</a></p>
          <p>📞 <a href="tel:8304025594" className="text-violet-600">8304025594</a></p>
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

export default ReturnRefundPolicy;
