import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  Trash2, 
  Search,
  X,
  IndianRupee,
  Star,
  Clock,
  UtensilsCrossed,
  Coffee,
  IceCreamCone,
  Menu,
  ArrowLeft
} from 'lucide-react';
import { SERVER_URL } from '../../Config';
import { useAuth } from '../../context/UserContext';

const RestaurantOrderScreen = ({ store }) => {
    const {token} = useAuth();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Dynamic categories based on actual data
    const [availableCategories, setAvailableCategories] = useState([]);
    
    const getCategoryIcon = (categoryName) => {
      const lowerCategory = categoryName.toLowerCase();
      if (lowerCategory.includes('starter') || lowerCategory.includes('appetizer')) return UtensilsCrossed;
      if (lowerCategory.includes('main') || lowerCategory.includes('course')) return UtensilsCrossed;
      if (lowerCategory.includes('drink') || lowerCategory.includes('beverage')) return Coffee;
      if (lowerCategory.includes('dessert') || lowerCategory.includes('sweet')) return IceCreamCone;
      return UtensilsCrossed;
    };
  
    const getCategoryColor = (categoryName) => {
      const lowerCategory = categoryName.toLowerCase();
      if (lowerCategory.includes('starter') || lowerCategory.includes('appetizer')) return "bg-teal-500";
      if (lowerCategory.includes('main') || lowerCategory.includes('course')) return "bg-gray-800";
      if (lowerCategory.includes('drink') || lowerCategory.includes('beverage')) return "bg-teal-600";
      if (lowerCategory.includes('dessert') || lowerCategory.includes('sweet')) return "bg-gray-700";
      return "bg-purple-600";
    };
    
    const [activeCategory, setActiveCategory] = useState("Starters");
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCart, setShowCart] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [tableNumber, setTableNumber] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const categoryRefs = useRef({});
  
    // Fetch products from API
    useEffect(() => {
      const fetchProducts = async () => {
        if (!store?._id) return;
        
        try {
          setLoading(true);
          const response = await fetch(`${SERVER_URL}/products/store/${store._id}`);
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch products');
          }
          
          // Transform API data to match component structure
          const transformedProducts = data.map(product => ({
            id: product._id,
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description || 'Delicious item from our menu',
            image: product.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
            time: "15 mins", // Default time - you can add this to your schema if needed
            rating: 4.5, // Default rating - you can add this to your schema if needed
            active: product.active,
            type: product.type
          }));
  
          // Only show active products
          const activeProducts = transformedProducts.filter(item => item.active !== false);
          setMenuItems(activeProducts);
          
          // Debug logging
        
          // Get unique categories from actual data and create category objects
          const uniqueCategories = [...new Set(activeProducts.map(item => item.category))];
         
          const categoryObjects = uniqueCategories.map(categoryName => ({
            name: categoryName,
            icon: getCategoryIcon(categoryName),
            color: getCategoryColor(categoryName)
          }));
          
          setAvailableCategories(categoryObjects);
          
          // Set first available category as active
          if (uniqueCategories.length > 0) {
            setActiveCategory(uniqueCategories[0]);
          }
          
        } catch (error) {
          console.error('Error fetching products:', error);
          setError('Failed to load menu items');
        } finally {
          setLoading(false);
        }
      };
  
      fetchProducts();
    }, [store]);
  
    // Scroll to category
    const scrollToCategory = (category) => {
      setActiveCategory(category);
      categoryRefs.current[category]?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    };
  
    // Add to cart
    const addToCart = (item) => {
      setCart(prev => {
        const existing = prev.find(cartItem => cartItem.id === item.id);
        if (existing) {
          return prev.map(cartItem => 
            cartItem.id === item.id 
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        }
        return [...prev, { ...item, quantity: 1 }];
      });
    };
  
    // Update quantity
    const updateQuantity = (id, change) => {
      setCart(prev => prev.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + change);
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean));
    };
  
    // Remove from cart
    const removeFromCart = (id) => {
      setCart(prev => prev.filter(item => item.id !== id));
    };
  
    // Calculate totals
    const getTotalAmount = () => {
      return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };
  
    const getTotalItems = () => {
      return cart.reduce((sum, item) => sum + item.quantity, 0);
    };
  
    // Filter items by search
    const filteredItems = menuItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    // Group filtered items by category
    const itemsByCategory = availableCategories.reduce((acc, category) => {
      acc[category.name] = filteredItems.filter(item => item.category === category.name);
      return acc;
    }, {});
  
    const handlePlaceOrder = async() => {
      if (cart.length === 0) return;
      
      if (!tableNumber.trim()) {
        alert("Please enter table number");
        return;
      }
      
      const orderProducts = cart.map(item => ({
        productId: item.id,
        productName: item.name,
        unitPrice: item.price,
        quantity: item.quantity
      }));
      
      const orderData = {
        products: orderProducts,
        sellerId: store._id,
        buyerId: '688e399e51047e79d15e1476', 
        totalAmount: getTotalAmount(),
        totalItems: getTotalItems(),
        orderType: "dine-in",
        customerName: customerName.trim() || "Customer",
        deliveryAddress: `Table No: ${tableNumber.trim()}`,
        phoneNumber: phoneNumber.trim() || "0000000000",
        paymentMethod: "cod",
        transactionId: null,
        status: "pending",
      };
      
      try {
        const finalRes = await axios.post(`${SERVER_URL}/orders/create`, orderData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      
      
        if (finalRes.data.message === "Order created successfully") {
          alert(`Order placed successfully! Total: ₹${getTotalAmount()}`);
          setCart([]);
          setShowCart(false);
          setTableNumber("");
          setCustomerName("");
          setPhoneNumber("");
          
          // Example redirect: navigate("/orders");
        }
      
      } catch (err) {
        console.error("❌ Error placing order:", err.response?.data || err.message);
        alert("Failed to place order. Please try again.");
      }
    };

    if (loading) {
      return (
        <div className="bg-white rounded-lg p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading menu...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading menu</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-40px)] bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-3 md:p-4 sticky top-0 z-10">
    

          {/* Category Navigation */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {availableCategories.map(category => {
              const Icon = category.icon;
              const itemCount = itemsByCategory[category.name]?.length || 0;
              
              if (itemCount === 0) return null;
              
              return (
                <button
                  key={category.name}
                  onClick={() => scrollToCategory(category.name)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 whitespace-nowrap text-sm ${
                    activeCategory === category.name
                      ? 'bg-teal-50 border-teal-500 text-teal-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{category.name}</span>
                  <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                    {itemCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Floating Cart Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowCart(true)}
            className="relative bg-teal-600 text-white p-4 rounded-full shadow-2xl hover:bg-teal-700 transition-all transform hover:scale-105 border-4 border-white"
          >
            <ShoppingCart className="w-6 h-6" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center animate-pulse">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>

        {/* Menu Items - Full Width */}
        <div className="p-3 md:p-6">
          <div className="space-y-8 pb-24">
            {availableCategories.map(category => {
              const categoryItems = itemsByCategory[category.name] || [];
              if (categoryItems.length === 0) return null;

              return (
                <div 
                  key={category.name} 
                  ref={el => categoryRefs.current[category.name] = el}
                  className="scroll-mt-4"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{categoryItems.length} items available</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {categoryItems.map(item => (
                      <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="relative">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-36 sm:h-40 object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop';
                            }}
                          />
                          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {item.time}
                          </div>
                          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs flex items-center">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                            {item.rating}
                          </div>
                          <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
                            item.type === 'veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.type === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-1">{item.name}</h4>
                          <p className="text-gray-600 text-xs mb-3 line-clamp-2">{item.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-teal-600">₹{item.price}</span>
                            
                            {cart.find(cartItem => cartItem.id === item.id) ? (
                              <div className="flex items-center space-x-2 bg-teal-50 rounded-lg px-2 py-1 border border-teal-200">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-6 h-6 flex items-center justify-center bg-white rounded border hover:bg-gray-50 text-teal-600"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-bold text-sm w-6 text-center text-teal-700">
                                  {cart.find(cartItem => cartItem.id === item.id)?.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-white rounded border hover:bg-gray-50 text-teal-600"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(item)}
                                className="bg-teal-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center space-x-1 shadow-sm hover:shadow-md"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart Modal (Single for both mobile and desktop) */}
        {showCart && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
              <div className="bg-teal-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Your Order</h3>
                  <div className="text-sm opacity-90 mt-1">{getTotalItems()} items • ₹{getTotalAmount()}</div>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center text-gray-500">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <h4 className="font-semibold text-lg mb-2">Cart is Empty</h4>
                    <p className="text-sm">Add some delicious items to get started!</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-3">
                      {cart.map(item => (
                        <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">{item.name}</h5>
                              <p className="text-sm text-gray-600 mt-1">₹{item.price} each</p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-red-500 p-1 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 bg-white rounded-lg p-1 border border-gray-200">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold text-gray-900 w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-bold text-lg text-teal-600">₹{item.price * item.quantity}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t bg-white p-4 rounded-b-2xl space-y-4">
                    {/* Customer Details Form */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name (Optional)</label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-sm"
                          placeholder="Enter customer name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Table Number *</label>
                        <input
                          type="text"
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-sm"
                          placeholder="Enter table number"
                          required
                        />
                      </div>
                      <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
  <input
    type="tel"
    value={phoneNumber}
    onChange={(e) => setPhoneNumber(e.target.value)}
    className="w-full p-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none text-sm"
    placeholder="Enter 10-digit mobile number"
    required
  />
</div>

                    </div>

                    <div className="flex justify-between items-center py-2 border-t border-gray-100">
                      <span className="font-bold text-lg text-gray-900">Total Amount</span>
                      <span className="font-bold text-2xl text-teal-600">₹{getTotalAmount()}</span>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={!tableNumber.trim()}
                      className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Place Order</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
};

export default RestaurantOrderScreen;