// 🪟 ProductDetailsModal.js
import React from 'react';
import { X } from 'lucide-react';

const ProductDetailsModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center px-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg overflow-hidden">
        <div className="flex justify-between items-center bg-teal-600 p-4 text-white">
          <h2 className="text-xl font-bold">{product.name}</h2>
          <button onClick={onClose} className="hover:text-red-300">
            <X size={24} />
          </button>
        </div>

        {/* Image Carousel */}
        <div className="overflow-x-auto whitespace-nowrap p-4 space-x-2">
          {product.images?.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Image ${idx + 1}`}
              className="inline-block w-48 h-32 object-cover rounded-md shadow"
            />
          ))}
        </div>

        <div className="p-4 space-y-2 text-gray-800">
          <p><span className="font-semibold">Description:</span> {product.description || 'N/A'}</p>
          <p><span className="font-semibold">Category:</span> {product.category}</p>
          <p><span className="font-semibold">Type:</span> {product.type}</p>
          <p><span className="font-semibold">Price:</span> ₹{product.price}</p>
          {product.type === 'product' && (
            <p><span className="font-semibold">Quantity:</span> {product.quantity} pcs</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
