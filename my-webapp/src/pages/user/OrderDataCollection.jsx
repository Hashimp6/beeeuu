import React, { useState, useEffect } from 'react';
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
  Package
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/UserContext';
import toast, { Toaster } from 'react-hot-toast';

const OrderDetails = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { product, store } = location.state || {};
  console.log("datttt", product, store);

  // Form states
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState(user?.username || '');
  const [address, setAddress] = useState(user?.address || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [transactionId, setTransactionId] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Validation error states
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [transactionError, setTransactionError] = useState('');

  // Product details
  const productPrice = parseFloat(product?.price) || 0;
  const productName = product?.name || 'Product';
  const productImage = product?.image || null;

  // Payment options
  const paymentOptions = [
    { id: 'cod', name: 'Cash on Delivery', icon: DollarSign },
    { id: 'gpay', name: 'Google Pay', icon: Smartphone },
    { id: 'phonepe', name: 'PhonePe', icon: CreditCard },
  ];

  useEffect(() => {
    if (!product || !store) {
      alert("Missing product or store information. Redirecting...");
      navigate(-1); // go back
    }
  }, [product, store, navigate]);

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
    if (trimmedAddress.length < 10) {
      return 'Please enter a complete address (minimum 10 characters)';
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

  // Check if form is valid - FIXED LOGIC
  const isFormValid = () => {
    const nameValid = validateName(customerName) === '';
    const phoneValid = validatePhone(phoneNumber) === '';
    const addressValid = validateAddress(address) === '';
    
    // For COD, only basic fields need to be valid
    if (selectedPayment === 'cod') {
      return nameValid && phoneValid && addressValid;
    }
    
    // For digital payments, transaction ID and payment completion required
    const transactionValid = validateTransactionId(transactionId) === '';
    return nameValid && phoneValid && addressValid && transactionValid && paymentCompleted;
  };

  // Calculate total
  const calculateTotal = () => {
    return (productPrice * quantity).toFixed(2);
  };

  // Handle quantity changes
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (e) => {
    const num = parseInt(e.target.value);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    }
  };

  // Handle payment selection
  const handlePaymentSelect = (paymentId) => {
    setSelectedPayment(paymentId);
    setTransactionId('');
    setTransactionError('');
    setPaymentCompleted(false);
    
    if (paymentId !== 'cod') {
      setShowPaymentModal(true);
    }
  };

  // Handle payment process
  const handlePaymentProcess = () => {
    alert(`Opening ${paymentOptions.find(p => p.id === selectedPayment)?.name} app...`);
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

  // Handle order placement
  const handlePlaceOrder = () => {
    const nameValidationError = validateName(customerName);
    const phoneValidationError = validatePhone(phoneNumber);
    const addressValidationError = validateAddress(address);

    setNameError(nameValidationError);
    setPhoneError(phoneValidationError);
    setAddressError(addressValidationError);

    let transactionValidationError = '';
    if (selectedPayment !== 'cod') {
      transactionValidationError = validateTransactionId(transactionId);
      setTransactionError(transactionValidationError);
    }

    if (nameValidationError || phoneValidationError || addressValidationError || transactionValidationError) {
        toast.error('Please fix the errors before placing the order');
        return;
      }
    
      if (selectedPayment !== 'cod' && !paymentCompleted) {
        toast.error('Please complete the payment first');
        return;
      }

    const orderData = {
      productId: product._id,
      productName: productName,
      quantity: quantity,
      unitPrice: productPrice,
      totalAmount: calculateTotal(),
      customerName: customerName.trim(),
      deliveryAddress: address.trim(),
      phoneNumber: phoneNumber,
      paymentMethod: selectedPayment,
      transactionId: selectedPayment !== 'cod' ? transactionId.trim() : null,
      status: 'pending'
    };

    console.log('Order data:', orderData);
  toast.success(`Order placed successfully! Total: ₹${calculateTotal()}`);

  // Navigate to Store Profile page after delay
  setTimeout(() => {
    navigate(`/storeprofile/${store?.storeName}`);
  }, 1500);
};

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      alert('Going back to previous page...');
    }
  };

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
          {/* Left Column - Product & Customer Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Package className="text-teal-700 mr-2" size={24} />
                <h2 className="text-lg font-semibold text-teal-700">Product Details</h2>
              </div>
              <div className="flex items-center bg-gray-50 rounded-xl p-4">
                {productImage && (
                  <img 
                    src={productImage} 
                    alt={productName}
                    className="w-24 h-24 lg:w-32 lg:h-32 rounded-lg mr-4 object-cover bg-gray-200"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-black mb-2 text-lg">{productName}</h3>
                  <p className="text-xl font-bold text-teal-700 mb-2">₹{productPrice.toFixed(2)}</p>
                  {store?.storeName && (
                    <div className="flex items-center text-gray-600">
                      <Store size={16} className="mr-1" />
                      <span className="text-sm">{store.storeName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-teal-700">Quantity</h2>
              <div className="flex items-center justify-center mb-4">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className={`w-12 h-12 rounded-full flex items-center justify-center mx-4 ${
                    quantity <= 1 ? 'bg-gray-200 text-gray-400' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                  } transition-colors`}
                >
                  <Minus size={20} />
                </button>
                
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-20 h-12 text-center border border-gray-300 rounded-lg font-semibold text-lg"
                  min="1"
                />
                
                <button
                  onClick={increaseQuantity}
                  className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 hover:bg-teal-100 flex items-center justify-center mx-4 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <p className="text-xl font-bold text-teal-700 text-center">Total: ₹{calculateTotal()}</p>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-teal-700">Customer Details</h2>
              
              <div className="space-y-4">
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

            {/* Payment Options */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-teal-700">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {paymentOptions.map((option) => {
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

            {/* Transaction Details for Digital Payments */}
            {selectedPayment !== 'cod' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 text-teal-700">Transaction Details</h2>
                {!paymentCompleted && (
                  <div className="flex items-center bg-orange-50 p-4 rounded-lg mb-4">
                    <Info size={24} className="text-orange-500 mr-3 flex-shrink-0" />
                    <p className="text-sm text-orange-700">
                      Complete payment using {paymentOptions.find(p => p.id === selectedPayment)?.name} and enter your transaction ID below.
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
                  <span className="text-gray-600">Product:</span>
                  <span className="font-medium text-gray-900">{productName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium text-gray-900">{quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-medium text-gray-900">₹{productPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium text-gray-900">
                    {paymentOptions.find(p => p.id === selectedPayment)?.name}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-teal-700">
                    <span>Total Amount:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handlePlaceOrder}
                  disabled={!isFormValid()}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isFormValid()
                      ? 'bg-teal-700 text-white hover:bg-teal-800'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Place Order
                </button>
                <button
                  onClick={handleGoBack}
                  className="w-full py-3 px-4 border border-teal-300 text-teal-700 rounded-lg font-medium hover:bg-teal-50 transition-colors"
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
                Pay via {paymentOptions.find(p => p.id === selectedPayment)?.name}
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
                {store?.upiId && (
                  <p className="text-sm text-gray-600">UPI ID: {store.upiId}</p>
                )}
              </div>

              <button
                onClick={handlePaymentProcess}
                className="w-full bg-teal-700 text-white py-4 rounded-xl font-semibold mb-6 flex items-center justify-center hover:bg-teal-800 transition-colors"
              >
                <CreditCard size={24} className="mr-2" />
                Open {paymentOptions.find(p => p.id === selectedPayment)?.name}
              </button>

              <div className="mb-6">
                <h4 className="font-semibold text-teal-700 mb-3">Instructions:</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>1. Click "Open {paymentOptions.find(p => p.id === selectedPayment)?.name}" button above</p>
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
    </div>
  );
};

export default OrderDetails;