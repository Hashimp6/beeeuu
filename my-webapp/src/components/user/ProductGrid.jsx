// src/components/ProductsGrid.jsx
import React from 'react';
import { Heart, Star, ShoppingBag, Calendar, ChefHat, Coffee, Cake, Package } from 'lucide-react';
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

  // Filter only active products
  const activeProducts = products.filter(product => product.active !== false);

  // Check if this is a Hotel/Restaurant store
  const isRestaurant = store?.category === 'Hotel / Restaurent';

  // Restaurant categories with icons
  const restaurantCategories = [
    { key: 'starter', label: 'Starter', icon: Star },
    { key: 'main-course', label: 'Main Course', icon: ChefHat },
    { key: 'drinks', label: 'Drinks', icon: Coffee },
    { key: 'desserts', label: 'Desserts', icon: Cake },
    { key: 'combo-meal', label: 'Combo Meal', icon: Package }
  ];

  // Group products by category for restaurants (using filtered active products)
  const groupedProducts = isRestaurant ? 
    restaurantCategories.reduce((acc, category) => {
      acc[category.key] = activeProducts.filter(product => 
        product.category === category.key || product.category === category.label
      );
      return acc;
    }, {}) : null;

  // Render product card
  const renderProductCard = (product) => (
    <div
      key={product._id}
      onClick={() => onProductClick(product)}
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

        {/* Category Badge for non-restaurant stores */}
        {!isRestaurant && (
          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium shadow-md">
              {product.category}
            </span>
          </div>
        )}

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

        <p className="text-gray-600 text-xs leading-relaxed hidden sm:block">
          {product.description?.slice(0, 60)}{product.description?.length > 70 ? '.....' : ''}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (product.type === 'service') {
              handleAppointment(product);
            } else {
              if (!store?.isActive) {
                toast.error('Shop is closed. Try again later.');
                return;
              }
              addToCart(product, store);
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
  );

  // Render category section for restaurants
  const renderCategorySection = (category, categoryProducts) => {
    if (categoryProducts.length === 0) return null;

    const IconComponent = category.icon;

    return (
      <div key={category.key} className="space-y-4 sm:space-y-6">
        {/* Category Header */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-2 rounded-xl">
            <IconComponent size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-black">{category.label}</h3>
            <p className="text-sm text-gray-600">{categoryProducts.length} items available</p>
          </div>
        </div>

        {/* Products Grid for this category */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {categoryProducts.map(renderProductCard)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3 sm:mb-4">
          {isRestaurant ? 'Our Menu' : 'Our Products & Services'}
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          {isRestaurant 
            ? 'Discover our delicious collection of food and beverages, freshly prepared just for you'
            : 'Discover our premium collection of products and professional services designed to meet your needs'
          }
        </p>
      </div>

      {/* Products Display */}
      {activeProducts && activeProducts.length > 0 ? (
        isRestaurant ? (
          // Restaurant view with categorized sections
          <div className="space-y-8 sm:space-y-12">
            {restaurantCategories.map(category => 
              renderCategorySection(category, groupedProducts[category.key] || [])
            )}
            
            {/* Show uncategorized products if any */}
            {(() => {
              const categorizedProductIds = new Set();
              Object.values(groupedProducts).forEach(categoryProducts => 
                categoryProducts.forEach(product => categorizedProductIds.add(product._id))
              );
              const uncategorizedProducts = activeProducts.filter(product => 
                !categorizedProductIds.has(product._id)
              );
              
              if (uncategorizedProducts.length > 0) {
                return (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-2 rounded-xl">
                        <ShoppingBag size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-black">Other Items</h3>
                        <p className="text-sm text-gray-600">{uncategorizedProducts.length} items available</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {uncategorizedProducts.map(renderProductCard)}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        ) : (
          // Regular store view - all products in one grid
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {activeProducts.map(renderProductCard)}
          </div>
        )
      ) : (
        // No products found
        <div className="col-span-full text-center py-8 sm:py-12">
          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 max-w-sm mx-auto border border-gray-100">
            <ShoppingBag size={40} className="sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-black mb-3">
              {isRestaurant ? 'No Menu Items Found' : 'No Products Found'}
            </h3>
            <p className="text-gray-600 text-sm">
              {isRestaurant 
                ? "This restaurant hasn't added any menu items yet. Check back later for delicious options!"
                : "This store hasn't added any products yet. Check back later for amazing deals!"
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;