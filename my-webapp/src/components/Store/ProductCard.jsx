// 📦 ProductCard.js
import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

const ProductCard = ({ product, onEdit, onDelete, onView }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div onClick={() => onView(product)}>
        <img
          src={product.images?.[0] || 'https://picsum.photos/400/300?random=default'}
          alt={product.name}
          className="w-full h-40 object-cover rounded-t-lg"
        />
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
          <p className="text-gray-500 text-xs line-clamp-1">{product.description}</p>
          <div className="flex gap-1 mt-1">
            <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded">{product.category}</span>
            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">{product.type}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm font-bold text-teal-600">₹{product.price}</div>
            {product.type === 'product' && (
              <div className="text-xs text-gray-500">{product.quantity} pcs</div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-1 p-2 border-t">
        <button onClick={() => onEdit(product)} className="text-blue-600 hover:bg-blue-50 rounded p-1">
          <Edit3 size={16} />
        </button>
        <button onClick={() => onDelete(product._id)} className="text-red-600 hover:bg-red-50 rounded p-1">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
