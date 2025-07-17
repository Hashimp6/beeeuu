import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, ShoppingBag, Calendar, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';

const ProductDetailModal = ({
  store,
  product,
  onClose,
  likedProducts,
  toggleLike,
  handleOrderProduct,
  handleAppointment,
  autoSlide = true,
  slideInterval = 3000, // 3 seconds
}) => {
  const [currentImage, setCurrentImage] = useState(0);
      const { addToCart } = useCart();

  // Auto slide images
  useEffect(() => {
    if (!autoSlide) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) =>
        product.images && product.images.length > 0
          ? (prev + 1) % product.images.length
          : 0
      );
    }, slideInterval);

    return () => clearInterval(interval);
  }, [product.images, autoSlide, slideInterval]);

  const nextImage = () => {
    if (product.images && product.images.length > 0) {
      setCurrentImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 0) {
      setCurrentImage((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (!product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-auto overflow-hidden relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg z-10"
        >
          <X size={18} />
        </button>
  
        {/* Image Section with Navigation */}
        <div className="relative w-full aspect-[3/2] bg-gray-100">
          {product.images?.length > 0 ? (
            <img
              src={product.images[currentImage]}
              alt={`Product ${currentImage + 1}`}
              className="w-full h-full object-cover rounded-t-xl"
            />
          ) : (
            <img
              src="/placeholder.jpg"
              alt="No image"
              className="w-full h-full object-cover rounded-t-xl"
            />
          )}
  
          {/* Arrows remain same */}
          {product.images?.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white text-black p-1 rounded-full shadow hover:scale-105"
              >
                <ChevronLeft />
              </button>
  
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black p-1 rounded-full shadow hover:scale-105"
              >
                <ChevronRight />
              </button>
            </>
          )}
        </div>
        {/* Product Info */}
        <div className="p-4 sm:p-6 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-black">{product.name}</h2>
              <p className="text-sm text-gray-500">{product.category}</p>
            </div>

        
          </div>

          <p className="text-gray-700 text-sm">{product.description}</p>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star size={16} className="text-yellow-400 fill-current" />
            <span className="text-sm text-gray-700 font-medium">
              {product.rating || '4.5'} {/* Default fallback */}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-black">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm line-through text-gray-400">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {/* Type */}
          <p className="text-sm text-gray-600">
             <span className="font-medium capitalize">{product.type}</span>
          </p>

          {/* Action Button */}
          <div className="pt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (product.type === 'service') {
                  handleAppointment(product);
                } else {
                  addToCart(product, store);
                  toast.success(`${product.name} added to cart 🛒`);
            
                  // Animation trigger
                  const btn = e.currentTarget;
                  btn.classList.add("animate-cart-jump");
                  setTimeout(() => btn.classList.remove("animate-cart-jump"), 400);
                  setTimeout(() => {
                  onClose();
                }, 500); 
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
                  <Calendar size={16} className="inline-block mr-1" />
                  Book Now
                </>
              ) : (
                <>
                  <ShoppingBag size={16} className="inline-block mr-1" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
