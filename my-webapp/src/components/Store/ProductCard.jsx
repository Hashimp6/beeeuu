// 📦 ProductCard.js
import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

const ProductCard = ({ product, onEdit, onDelete, onView, onToggleActive }) => {
  // Check if product is active (handle nullish values)
  const isActive = product.active ?? true;
  
  return (
    <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer relative ${
      !isActive ? 'opacity-75' : ''
    }`}>
      {/* Inactive overlay - lighter for better visibility */}
      {!isActive && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-10 rounded-lg z-10 pointer-events-none" />
      )}
      
      <div onClick={() => onView(product)} className="relative">
        <img
          src={product.images?.[0] || 'https://picsum.photos/400/300?random=default'}
          alt={product.name}
          className={`w-full h-40 object-cover rounded-t-lg transition-all ${
            !isActive ? 'opacity-70' : ''
          }`}
        />
        <div className="p-3">
          <h3 className={`font-semibold text-gray-900 text-sm truncate ${
            !isActive ? 'text-gray-500' : ''
          }`}>
            {product.name}
          </h3>
          <p className={`text-gray-500 text-xs line-clamp-1 ${
            !isActive ? 'text-gray-400' : ''
          }`}>
            {product.description}
          </p>
          <div className="flex gap-1 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded ${
              !isActive 
                ? 'bg-gray-100 text-gray-500' 
                : 'bg-teal-100 text-teal-800'
            }`}>
              {product.category}
            </span>
            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
              {product.type}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className={`text-sm font-bold ${
              !isActive ? 'text-gray-500' : 'text-teal-600'
            }`}>
              ₹{product.price}
            </div>
            {product.type === 'product' && (
              <div className={`text-xs ${
                !isActive ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {product.quantity} pcs
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status Badge */}
      <div className="absolute top-2 right-2 z-20">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between items-center p-3 border-t relative z-20">
        {/* Toggle Switch with Label */}
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(product._id, !isActive);
            }}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
              isActive ? 'bg-teal-600' : 'bg-gray-400'
            }`}
            title={isActive ? 'Click to deactivate' : 'Click to activate'}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
              isActive ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
          <span className={`text-xs font-medium ${
            isActive ? 'text-green-700' : 'text-red-600'
          }`}>
            {isActive ? 'ON' : 'OFF'}
          </span>
        </div>
        
        <div className="flex gap-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }} 
            className={`text-blue-600 hover:bg-blue-50 rounded p-1.5 transition-colors ${
              !isActive ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!isActive}
            title={!isActive ? 'Enable product to edit' : 'Edit product'}
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product._id);
            }} 
            className="text-red-600 hover:bg-red-50 rounded p-1.5 transition-colors"
            title="Delete product"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;