// src/components/ProductsGrid.jsx
import React from 'react';
import { Heart, Star, ShoppingBag, Calendar } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const ProductsGrid = ({
  products = [],
  store,
  likedProducts = new Set(),
  toggleLike = () => {},
  handleOrderProduct = () => {},
  handleAppointment = () => {},
  onProductClick 
}) => {
    const { addToCart } = useCart();
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3 sm:mb-4">
          Our Products & Services
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          Discover our premium collection of products and professional services designed to meet your needs
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {products && products.length > 0 ? (
          products.map((product) => (
            <div
            key={product._id}
            onClick={() => onProductClick(product)} // ✅ Add this line
            className="cursor-pointer group bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-teal-200 transform hover:-translate-y-1"
          >
          
              {/* Image Section */}
              <div className="relative aspect-[4/3] sm:aspect-[4/3] overflow-hidden">
                <img
                  src={product.images?.[0] || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                {/* Badges */}
                <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 flex flex-col gap-1">
                  {product.popular && (
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-sm">
                      🔥
                    </span>
                  )}
                  {product.premium && (
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-sm">
                      ✨
                    </span>
                  )}
                  {product.discount && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-sm">
                      -{product.discount}%
                    </span>
                  )}
                </div>

                {/* Category */}
                <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium shadow-md">
                    {product.category}
                  </span>
                </div>

                {/* Like Button */}
                <button
                  onClick={() => toggleLike(product._id)}
                  className={`absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border ${
                    likedProducts.has(product._id)
                      ? 'bg-red-500 text-white shadow-md border-red-500 scale-110'
                      : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 border-white/50 hover:scale-110'
                  }`}
                >
                  <Heart size={12} className={likedProducts.has(product._id) ? 'fill-current' : ''} />
                </button>

                {/* Price */}
                <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2">
                  <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 shadow-md">
                    <span className="text-xs sm:text-sm font-bold text-black">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-500 line-through hidden sm:inline">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-black group-hover:text-teal-600 transition-colors line-clamp-2 flex-1 leading-tight">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 ml-1">
                    <Star size={10} className="sm:w-3 sm:h-3 text-yellow-400 fill-current" />
                    <span className="text-xs font-semibold text-gray-600">{product.rating}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed hidden sm:block">
                  {product.description}
                </p>

                <button
 onClick={(e) => {
    e.stopPropagation();
    if (product.type === 'service') {
      handleAppointment(product);
    } else {
      addToCart(product, store); // ✅ Add to cart
      toast.success(`${product.name} added to cart 🛒`);
      
      // Animation trigger
      const btn = e.currentTarget;
      btn.classList.add("animate-cart-jump");
      setTimeout(() => btn.classList.remove("animate-cart-jump"), 400);
    }
  }}
  className={`w-full py-1.5 sm:py-2 rounded-md sm:rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 shadow-md hover:shadow-lg transform hover:scale-105 text-xs sm:text-sm ${
    product.type === 'service'
      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700'
      : 'bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-black'
  }`}
>
  {product.type === 'service' ? (
    <>
      <Calendar size={12} className="sm:w-4 sm:h-4" />
      <span className="hidden sm:inline">Book Now</span>
      <span className="sm:hidden">Book</span>
    </>
  ) : (
    <>
      <ShoppingBag size={12} className="sm:w-4 sm:h-4" />
      <span className="hidden sm:inline">Add to Cart</span>
      <span className="sm:hidden">Add</span>
    </>
  )}
</button>

              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 sm:py-12">
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 max-w-sm mx-auto border border-gray-100">
              <ShoppingBag size={40} className="sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-bold text-black mb-3">No Products Found</h3>
              <p className="text-gray-600 text-sm">
                This store hasn't added any products yet. Check back later for amazing deals!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsGrid;
