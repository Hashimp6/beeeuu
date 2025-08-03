import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  ArrowLeft, 
  Minus, 
  Plus, 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  CheckCircle, 
  Info,
  X,
  Check,
  Store,
  Package,
  ShoppingCart,
  Trash2,
  IndianRupee
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/UserContext';
import toast, { Toaster } from 'react-hot-toast';
import { SERVER_URL } from '../../Config';
import axios from 'axios';
import { useCart} from '../../context/CartContext';

const OrderDetails = () => {
  const { user, token } = useAuth();
  const authToken=token||" "
  // const user = { _id: "688e399e51047e79d15e1476" };
  // const token="";
  const location = useLocation();
  const navigate = useNavigate();

  // Get order data from context/state (products array and store info)
  const { cart, removeFromCart, clearStoreCart, updateCartQuantity  } = useCart();
  const locationState = location.state || {};
  const storeId = locationState.storeId;
  const storeProducts = cart[storeId]?.products || [];
  
  const [store, setStore] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // Add loading state
  console.log("Order data:", storeProducts, store);

  // Form states
  const [productQuantities, setProductQuantities] = useState({});
  const [customerName, setCustomerName] = useState(user?.username || '');
  const [address, setAddress] = useState('');  
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [selectedPayment, setSelectedPayment] = useState('razorpay');
  const [transactionId, setTransactionId] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
const [upiLinkToShow, setUpiLinkToShow] = useState('');
 const [selectedService, setSelectedService] = useState('');
 const [serviceError, setServiceError] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [transactionError, setTransactionError] = useState('');
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [buyerId, setBuyerId] = useState(null); 
  

  useEffect(() => {
    if (user && user._id) {
      setBuyerId(user._id);
    } else {
      setShowGuestModal(true); // Ask user to login or continue as guest
    }
  }, [user]);

  useEffect(() => {
    // Don't redirect if we're in the process of placing an order
    if (isPlacingOrder) return;
    
    if (!storeId || !storeProducts || storeProducts.length === 0) {
      alert("Missing products or store information. Redirecting...");
      navigate(-1);
      return;
    }
    
    const fetchStoreDetails = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/stores/${storeId}`);
        console.log("Fetched store:", response.data.store); 
        setStore(response.data.store);
      } catch (error) {
        console.error("Error fetching store data:", error);
        toast.error("Failed to fetch store information.");
      }
    };
  
    fetchStoreDetails();
  }, [storeId, storeProducts, navigate, isPlacingOrder]); // Add isPlacingOrder to dependencies
  
  // Initialize quantities for each product
  useEffect(() => {
    if (storeProducts && storeProducts.length > 0) {
      const initialQuantities = {};
      storeProducts.forEach(product => {
        initialQuantities[product._id] = product.quantity || 1;
      });
      setProductQuantities(initialQuantities);
    }
  }, [storeProducts]);
console.log("llo",store);

const paymentOptions = [
  { id: 'cod', name: 'Cash on Delivery', icon: IndianRupee },
  { id: 'upi', name: 'UPI', icon: Smartphone },
  { id: 'razorpay', name: 'Razorpay', icon: CreditCard },
  { id: 'phonepe', name: 'PhonePe', icon: CreditCard }
];


let allowedPayments = paymentOptions.filter(option =>
  store?.paymentType?.includes(option.name)
);

// Priority: if Razorpay is present, remove UPI
const hasRazorpay = allowedPayments.some(p => p.id === 'razorpay');
const hasUPI = allowedPayments.some(p => p.id === 'upi');

if (hasRazorpay && hasUPI) {
  allowedPayments = allowedPayments.filter(p => p.id !== 'upi');
}


useEffect(() => {
  // Detect if user is on mobile
  const mobileCheck = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  setIsMobile(mobileCheck);
}, []);
  // Validation functions
  const validateName = (name) => {
    const trimmedName = name.trim();
    const letterCount = trimmedName.replace(/[^a-zA-Z]/g, '').length;
    
    if (trimmedName.length === 0) {
      return 'Name is required';
    }
    if (letterCount < 3) {
      return 'Name must contain at least 3 letters';
    }
    return '';
  };

  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length === 0) {
      return 'Phone number is required';
    }
    if (cleanPhone.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    if (!/^[6-9]/.test(cleanPhone)) {
      return 'Phone number must start with 6, 7, 8, or 9';
    }
    return '';
  };

  const validateAddress = (address) => {
    const trimmedAddress = address.trim();
    
    if (trimmedAddress.length === 0) {
      return 'Address is required';
    }
 
    return '';
  };

  const validateTransactionId = (txnId) => {
    const trimmedId = txnId.trim();
    
    if (trimmedId.length === 0) {
      return 'Transaction ID is required for digital payments';
    }
    if (trimmedId.length < 8) {
      return 'Please enter a valid transaction ID';
    }
    return '';
  };
  
  const decreaseQuantity = (productId) => {
    setProductQuantities((prev) => {
      const currentQty = prev[productId] || 1;
      const newQty = Math.max(1, currentQty - 1);
      return { ...prev, [productId]: newQty };
    });
  };
  
  const increaseQuantity = (productId) => {
    setProductQuantities((prev) => {
      const currentQty = prev[productId] || 1;
      return { ...prev, [productId]: currentQty + 1 };
    });
  };
  
  // Handle input changes with validation
  const handleNameChange = (e) => {
    const text = e.target.value;
    setCustomerName(text);
    const error = validateName(text);
    setNameError(error);
  };

  const handlePhoneChange = (e) => {
    const text = e.target.value;
    const cleanText = text.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleanText);
    const error = validatePhone(cleanText);
    setPhoneError(error);
  };

  const handleAddressChange = (e) => {
    const text = e.target.value;
    setAddress(text);
    const error = validateAddress(text);
    setAddressError(error);
  };

  const handleTransactionIdChange = (e) => {
    const text = e.target.value;
    setTransactionId(text);
    const error = validateTransactionId(text);
    setTransactionError(error);
  };

  // Check if form is valid
  const isFormValid = () => {
    const nameValid = validateName(customerName) === '';
    const phoneValid = validatePhone(phoneNumber) === '';
    const addressValid = validateAddress(address) === '';
    
    if (selectedPayment !== 'upi') {
      return nameValid && phoneValid && addressValid;
    }
    
    const transactionValid = validateTransactionId(transactionId) === '';
    return nameValid && phoneValid && addressValid && transactionValid && paymentCompleted;
  };

  // Calculate total for all products
  const calculateTotal = () => {
    if (!storeProducts || storeProducts.length === 0) return '0.00';
  
    const total = storeProducts.reduce((sum, product) => {
      const price = parseFloat(product.price) || 0;
      const quantity = productQuantities[product._id] || 1;
      return sum + (price * quantity);
    }, 0);
  
    return total.toFixed(2);
  };
  

  // Calculate total items
  const getTotalItems = () => {
    return Object.values(productQuantities).reduce((sum, qty) => sum + qty, 0);
  };

  // Handle quantity changes for specific product
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity > 0) {
      setProductQuantities(prev => ({
        ...prev,
        [productId]: newQuantity
      }));
    }
  };

  const handleQuantityChange = (productId, e) => {
    const num = parseInt(e.target.value);
    if (!isNaN(num) && num > 0) {
      updateQuantity(productId, num);
    }
  };

  // Handle payment selection
  const handlePaymentSelect = (paymentId) => {
    setSelectedPayment(paymentId);
    setTransactionId('');
    setTransactionError('');
    setPaymentCompleted(false);
    
    if (paymentId === 'upi') {
      setShowPaymentModal(true);
    }
  };
  const generateUPILink = (upiId, storeName, amount, transactionNote) => {
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(storeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  };
  
  
  // Handle payment process
  const handlePaymentProcess = () => {
    const upiId = store?.upi;
    const amount = calculateTotal();
    const name = store?.storeName || "Merchant";
  
    if (!upiId) {
      toast.error("❌ Store does not have a UPI ID.");
      return;
    }
  
    const note = `Order by ${customerName} | ${storeProducts.slice(0, 2).map(p => p.name).join(", ")}${storeProducts.length > 2 ? '...' : ''}`;
    const upiLink = generateUPILink(upiId, name, amount, note);
  
    if (isMobile) {
      // Open payment app
      window.location.href = upiLink;
    } else {
      // Show QR code
      setShowQRCode(true);
      setUpiLinkToShow(upiLink); // Set UPI link for QR
    }
  };
  

  // Confirm payment completion
  const confirmPaymentCompletion = () => {
    const error = validateTransactionId(transactionId);
    setTransactionError(error);
    
    if (!error) {
      setPaymentCompleted(true);
      setShowPaymentModal(false);
      alert('Payment Confirmed! Payment details saved. You can now place your order.');
    }
  };
  const handlePlaceOrder = async () => {
    if (!buyerId) return;
    setIsPlacingOrder(true);
  
    // Step 1: Validate inputs
    const nameValidationError = validateName(customerName);
    const phoneValidationError = validatePhone(phoneNumber);
    const addressValidationError = validateAddress(address);
    const serviceValidationError =
      store?.category?.toLowerCase().includes('hotel') ||
      store?.category?.toLowerCase().includes('restaurant')
        ? selectedService.trim() === ''
          ? 'Please select a service type'
          : ''
        : '';
  
    setNameError(nameValidationError);
    setPhoneError(phoneValidationError);
    setAddressError(addressValidationError);
    setServiceError(serviceValidationError);
  
    if (nameValidationError || phoneValidationError || addressValidationError || serviceValidationError) {
      toast.error('❌ Please fix the errors before placing the order');
      setIsPlacingOrder(false);
      return;
    }
  
    // Razorpay Payment Flow
    if (selectedPayment === "razorpay") {
      try {
        console.log("Oiewfewent started");
        const totalAmount = parseFloat(calculateTotal());
  console.log("ttt",totalAmount);
  
        const res = await axios.post(`${SERVER_URL}/stores/razorpay/create-order`, {
          amount: totalAmount * 100,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            storeId: store._id,
            customer: customerName,
          },
        });
  
        const { order } = res.data;
  
        const options = {
          key: order.key_id,
          amount: order.amount,
          currency: order.currency,
          name: store.storeName,
          description: "Order Payment",
          image: store.profileImage,
          order_id: order.id,
          handler: async function (response) {
            try {
              const verifyRes = await axios.post(`${SERVER_URL}/stores/razorpay/verify-payment`, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
  
              if (verifyRes.data.success) {
                // Proceed to place order
                const orderProducts = storeProducts.map(product => ({
                  productId: product._id,
                  productName: product.name,
                  quantity: productQuantities[product._id] || 1,
                  unitPrice: parseFloat(product.price) || 0,
                }));
  
                const orderData = {
                  products: orderProducts,
                  sellerId: store._id,
                  buyerId: buyerId,
                  totalAmount: parseFloat(calculateTotal()),
                  totalItems: getTotalItems(),
                  orderType: selectedService,
                  customerName: customerName.trim(),
                  deliveryAddress: address.trim(),
                  phoneNumber: phoneNumber,
                  paymentMethod: selectedPayment,
                  transactionId: response.razorpay_payment_id,
                  status: 'pending',
                };
  
                const finalRes = await axios.post(`${SERVER_URL}/orders/create`, orderData, {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                  },
                });
 
                const result =finalRes.data.data
                toast.success(`✅ Order placed! Order ID: ${finalRes.data.orderId}`);
                clearStoreCart(store._id);
                navigate(`/receipt/${result.orderId}`, { 
                  state: { orderData: result } 
                });
              } else {
                toast.error("❌ Razorpay payment verification failed");
                setIsPlacingOrder(false);
              }
            } catch (err) {
              toast.error("❌ Payment verification failed");
              setIsPlacingOrder(false);
            }
          },
          prefill: {
            name: customerName,
            email: user?.email||"hashimhusain313@gmail.com",
            contact: phoneNumber,
          },
          theme: {
            color: "#3399cc",
          },
        };
  
        console.log("✅ Opening Razorpay popup");
        const rzp = new window.Razorpay(options);
        rzp.open();
        console.log("✅ Razorpay popup command issued");
        
  
        setIsPlacingOrder(false); // Razorpay popup is now handling flow
        return;
  
      } catch (err) {
        console.error("❌ Razorpay error:", err);
        toast.error("❌ Razorpay initialization failed");
        setIsPlacingOrder(false);
        return;
      }
    }
  
    // COD or other methods
    if (selectedPayment === 'cod') {
      try {
        const orderProducts = storeProducts.map(product => ({
          productId: product._id,
          productName: product.name,
          quantity: productQuantities[product._id] || 1,
          unitPrice: parseFloat(product.price) || 0,
        }));
  
        const orderData = {
          products: orderProducts,
          sellerId: store._id,
          buyerId: buyerId,
          totalAmount: parseFloat(calculateTotal()),
          totalItems: getTotalItems(),
          orderType: selectedService,
          customerName: customerName.trim(),
          deliveryAddress: address.trim(),
          phoneNumber: phoneNumber,
          paymentMethod: selectedPayment,
          transactionId: null,
          status: 'pending',
        };
  
        const response = await axios.post(`${SERVER_URL}/orders/create`, orderData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

  const result =response.data.data
        toast.success(`✅ Order placed! Order ID: ${response.data.orderId}`);
        clearStoreCart(store._id);
        navigate(`/receipt/${result.orderId}`, { 
          state: { orderData: result } 
        });
      } catch (err) {
        console.error("❌ Order error:", err);
        toast.error("❌ Failed to place order");
        setIsPlacingOrder(false);
      }
    }
  };
  

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      alert('Going back to previous page...');
    }
  };

  // Show loading state if placing order
  if (isPlacingOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Placing your order...</h2>
          <p className="text-gray-600">Please wait while we process your order</p>
        </div>
      </div>
    );
  }

  if (!storeProducts || storeProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No products found</h2>
          <button onClick={handleGoBack} className="text-teal-700 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Header */}
      <div className="bg-teal-700 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={handleGoBack} className="p-2 hover:bg-teal-600 rounded-lg transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Order Details</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Products & Customer Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <ShoppingCart className="text-teal-700 mr-2" size={24} />
                <h2 className="text-lg font-semibold text-teal-700">Products ({storeProducts.length})</h2>
              </div>
              
              <div className="space-y-4">
                {storeProducts.map((product, index) => {
                  const price = parseFloat(product.price) || 0;
                  const quantity = productQuantities[product._id] || 1;
                  const subtotal = (price * quantity).toFixed(2);
                  
                  return (
                    <div key={product._id} className="flex items-center bg-gray-50 rounded-xl p-4">
                      {product.images && (
                        <img 
                          src={product.images?.[0]} 
                          alt={product.name} 
                          className="w-20 h-20 rounded-lg mr-4 object-cover bg-gray-200"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-black mb-1">{product.name}</h3>
                        <p className="text-lg font-bold text-teal-700 mb-2">₹{price.toFixed(2)}</p>
                        <div className="flex items-center">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => decreaseQuantity(product._id)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Minus size={16} className="text-gray-600" />
                            </button>
                            <span className="px-3 py-1 bg-gray-200 rounded text-sm font-semibold text-gray-700">
                              {quantity}
                            </span>
                            <button
                              onClick={() => increaseQuantity(product._id)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Plus size={16} className="text-gray-600" />
                            </button>
                          </div>
                          <span className="ml-4 font-semibold text-teal-700">₹{subtotal}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(store?._id, product._id)}
                        className="ml-4 text-red-500 hover:text-red-700"
                        title="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {/* Store Info */}
              {store?.storeName && (
                <div className="mt-4 flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Store size={18} className="mr-2" />
                  <span>Sold by: <span className="font-medium">{store.storeName}</span></span>
                </div>
              )}
            </div>

            {/* Customer Details */}
            {store?.category?.toLowerCase().includes('hotel') ||
 store?.category?.toLowerCase().includes('restaurant') ? (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h2 className="text-lg font-semibold mb-4 text-teal-700">Customer Details</h2>

    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-teal-700 mb-2">Full Name</label>
        <input
          type="text"
          value={customerName}
          onChange={handleNameChange}
          placeholder="Enter your full name"
          className={`w-full p-3 border rounded-lg text-base ${
            nameError ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
        />
        {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
      </div>

      {/* Service Type (Radio buttons) */}
     {/* Service Type (Radio buttons) */}
<div>
  <label className="block text-sm font-medium text-teal-700 mb-2">Service Type</label>
  <div className="flex gap-4 flex-wrap">
    {store?.serviceType?.map((type) => (
      <label key={type} className="inline-flex items-center gap-2">
        <input
          type="radio"
          name="serviceType"
          value={type}
          checked={selectedService === type}
          onChange={(e) => {
            setSelectedService(e.target.value);
            setServiceError(''); // clear error on change
          }}
        />
        <span className="text-sm text-gray-700">{type}</span>
      </label>
    ))}
  </div>
  {serviceError && <p className="text-red-500 text-sm mt-1">{serviceError}</p>}
</div>


      {/* Address or Table Number */}
      <div>
        <label className="block text-sm font-medium text-teal-700 mb-2">
          {selectedService.toLowerCase() === 'eat in' || selectedService.toLowerCase() === 'dine in'
            ? 'Table Number'
            : 'Address'}
        </label>
        <textarea
          value={address}
          onChange={handleAddressChange}
          placeholder={
            selectedService.toLowerCase() === 'eat in' || selectedService.toLowerCase() === 'dine in'
              ? 'Enter your table number'
              : 'Enter complete delivery address'
          }
          rows="3"
          className={`w-full p-3 border rounded-lg text-base resize-none ${
            addressError ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
        />
        {addressError && <p className="text-red-500 text-sm mt-1">{addressError}</p>}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-teal-700 mb-2">Phone Number</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="Enter 10-digit phone number"
          maxLength="10"
          className={`w-full p-3 border rounded-lg text-base ${
            phoneError ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
        />
        {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
      </div>
    </div>
  </div>
) : (
  // Default layout for non-hotel categories
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h2 className="text-lg font-semibold mb-4 text-teal-700">Customer Details</h2>

    <div className="space-y-4">
      {/* Same fields as above but without service type selection and always show address */}
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-teal-700 mb-2">Full Name</label>
        <input
          type="text"
          value={customerName}
          onChange={handleNameChange}
          placeholder="Enter your full name"
          className={`w-full p-3 border rounded-lg text-base ${
            nameError ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
        />
        {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-teal-700 mb-2">Delivery Address</label>
        <textarea
          value={address}
          onChange={handleAddressChange}
          placeholder="Enter complete delivery address"
          rows="3"
          className={`w-full p-3 border rounded-lg text-base resize-none ${
            addressError ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
        />
        {addressError && <p className="text-red-500 text-sm mt-1">{addressError}</p>}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-teal-700 mb-2">Phone Number</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="Enter 10-digit phone number"
          maxLength="10"
          className={`w-full p-3 border rounded-lg text-base ${
            phoneError ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
        />
        {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
      </div>
    </div>
  </div>
)}


            {/* Payment Options */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-teal-700">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allowedPayments.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handlePaymentSelect(option.id)}
                      className={`flex items-center p-4 border rounded-xl transition-all ${
                        selectedPayment === option.id
                          ? 'bg-teal-700 border-teal-700 text-white'
                          : 'bg-gray-50 border-gray-300 text-teal-700 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent size={24} />
                      <span className="ml-3 font-medium">{option.name}</span>
                      {selectedPayment === option.id && <CheckCircle size={20} className="ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedPayment === 'razorpay' && (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <h2 className="text-lg font-semibold mb-4 text-teal-700">Razorpay Payment</h2>
    <p className="text-sm text-gray-600 mb-4">Click the place order button after filling all field to proceed with Razorpay payment.</p>
  </div>
)}


            {/* Transaction Details for Digital Payments */}
            {selectedPayment === 'upi' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 text-teal-700">Transaction Details</h2>
                {!paymentCompleted && (
                  <div className="flex items-center bg-orange-50 p-4 rounded-lg mb-4">
                    <Info size={24} className="text-orange-500 mr-3 flex-shrink-0" />
                    <p className="text-sm text-orange-700">
                      Complete payment using {allowedPayments.find(p => p.id === selectedPayment)?.name} and enter your transaction ID below.
                    </p>
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-teal-700 mb-2">Transaction ID / Reference Number</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={handleTransactionIdChange}
                    placeholder="Enter transaction ID after payment"
                    className={`w-full p-3 border rounded-lg text-base ${
                      transactionError ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                  />
                  {transactionError && <p className="text-red-500 text-sm mt-1">{transactionError}</p>}
                </div>

                {paymentCompleted && (
                  <div className="flex items-center bg-green-50 p-4 rounded-lg">
                    <CheckCircle size={24} className="text-green-500 mr-3" />
                    <p className="text-sm text-green-700 font-medium">Payment details confirmed!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4 text-teal-700">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium text-gray-900">{getTotalItems()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Products:</span>
                  <span className="font-medium text-gray-900">{storeProducts.length}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium text-gray-900">
                    {allowedPayments.find(p => p.id === selectedPayment)?.name}
                  </span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-teal-700">
                    <span>Total Amount:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>
              </div>

              {/* Product Breakdown */}
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Items:</h3>
                {storeProducts.map((product) => {
                  const price = parseFloat(product.price) || 0;
                  const quantity = productQuantities[product._id] || 1;
                  const subtotal = (price * quantity).toFixed(2);

                  return (
                    <div key={product._id} className="flex justify-between text-xs text-gray-600">
                      <span>{product.name} x{quantity}</span>
                      <span>₹{subtotal}</span>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handlePlaceOrder}
                  disabled={!isFormValid() || isPlacingOrder}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isFormValid() && !isPlacingOrder
                      ? 'bg-teal-700 text-white hover:bg-teal-800'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                </button>
                <button
                  onClick={handleGoBack}
                  disabled={isPlacingOrder}
                  className={`w-full py-3 px-4 border border-teal-300 text-teal-700 rounded-lg font-medium transition-colors ${
                    isPlacingOrder 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-teal-50'
                  }`}
                >
                  Cancel
                </button>
              </div>

              {/* Debug Info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs">
                <p className="font-medium text-gray-700 mb-1">Form Status:</p>
                <p>Name Valid: {validateName(customerName) === '' ? '✓' : '✗'}</p>
                <p>Phone Valid: {validatePhone(phoneNumber) === '' ? '✓' : '✗'}</p>
                <p>Address Valid: {validateAddress(address) === '' ? '✓' : '✗'}</p>
                <p>Payment: {selectedPayment}</p>
                <p>Form Valid: {isFormValid() ? '✓' : '✗'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-teal-700">
                Pay via {allowedPayments.find(p => p.id === selectedPayment)?.name}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-teal-700" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-teal-50 p-4 rounded-xl mb-6">
                <p className="text-2xl font-bold text-teal-700 mb-2">Amount: ₹{calculateTotal()}</p>
                <p className="text-base text-teal-700 mb-1">Pay to: {store?.storeName || 'Merchant'}</p>
                <p className="text-sm text-gray-600">Items: {getTotalItems()}</p>
                {store?.upiId && (
                  <p className="text-sm text-gray-600">UPI ID: {store.upiId}</p>
                )}
              </div>

              <button
                onClick={handlePaymentProcess}
                className="w-full bg-teal-700 text-white py-4 rounded-xl font-semibold mb-6 flex items-center justify-center hover:bg-teal-800 transition-colors"
              >
                <CreditCard size={24} className="mr-2" />
                Open {allowedPayments.find(p => p.id === selectedPayment)?.name}
              </button>

              <div className="mb-6">
                <h4 className="font-semibold text-teal-700 mb-3">Instructions:</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>1. Click "Open {allowedPayments.find(p => p.id === selectedPayment)?.name}" button above</p>
                  <p>2. Complete the payment in the app</p>
                  <p>3. Copy the transaction ID/reference number</p>
                  <p>4. Enter it below and click "Confirm Payment"</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-teal-700 mb-2">Transaction ID</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={handleTransactionIdChange}
                  placeholder="Paste transaction ID here"
                  className={`w-full p-3 border rounded-lg text-base ${
                    transactionError ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                />
                {transactionError && <p className="text-red-500 text-sm mt-1">{transactionError}</p>}
              </div>

              <button
                onClick={confirmPaymentCompletion}
                disabled={!transactionId.trim()}
                className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                  transactionId.trim()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-green-200 text-green-500 cursor-not-allowed'
                }`}
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}


{showGuestModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-xl shadow-xl text-center">
      <h2 className="text-xl font-semibold text-gray-800">You are not logged in</h2>
      <p className="text-gray-600">Would you like to continue as guest or login?</p>
      <div className="mt-4 flex justify-center gap-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => {
            setBuyerId("688e399e51047e79d15e1476"); // guest ID locally
            setShowGuestModal(false);
          }}
        >
          Continue as Guest
        </button>
        <button
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>
    </div>
  </div>
)}



      {showQRCode && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
      <h2 className="text-lg font-bold text-teal-700 mb-2">Scan to Pay</h2>
      <p className="text-gray-600 mb-4">Use Google Pay / PhonePe to scan & pay</p>
      <QRCodeCanvas value={upiLinkToShow} size={200} />

      <div className="mt-4">
        <button
          onClick={() => setShowQRCode(false)}
          className="text-sm text-teal-700 hover:underline mt-2"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default OrderDetails;