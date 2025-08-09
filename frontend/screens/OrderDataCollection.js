import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  Alert,
  Image,
  Linking,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { SERVER_URL } from '../config';
import { useCart } from '../context/CartContext';
import Toast from 'react-native-toast-message';
import RazorpayCheckout from 'react-native-razorpay';

const OrderDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const store = route.params.store|| {};
  const { cart, updateCartQuantity, removeFromCart,clearStoreCart} = useCart();
  const storeId = store.storeId || store._id;
  const products = cart?.[storeId]?.products || [];
  const { user, token } = useAuth() || {};

  // Form states
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState(user?.username || '');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderType, setOrderType] = useState('Dine In');
  const [selectedService, setSelectedService] = useState('Dine In'); // You're using orderType but referencing selectedService
const [serviceError, setServiceError] = useState('');
const [productQuantities, setProductQuantities] = useState({});
const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Validation error states
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [transactionError, setTransactionError] = useState('');
  useEffect(() => {
    if (!orderPlaced && (!cart?.[storeId] || cart[storeId].products.length === 0)) {
      Alert.alert('Cart Empty', 'Your cart is empty. Please add items before proceeding.');
      navigation.goBack();
    }
  }, [cart, storeId, orderPlaced]);

  // Payment options
  const availablePaymentOptions = store?.paymentType || [];

// Check if Razorpay is enabled
const hasRazorpay = availablePaymentOptions.includes('Razorpay');

// Filter out UPI if Razorpay is present
const filteredPaymentOptions = availablePaymentOptions.filter(type => {
  if (type === 'UPI' && hasRazorpay) return false; // skip UPI if Razorpay exists
  return true;
});

const paymentOptions = filteredPaymentOptions.map((type) => {
  if (type === 'Cash on Delivery') {
    return { id: 'cod', name: 'Cash on Delivery', icon: 'cash-outline' };
  } else if (type === 'UPI') {
    return {
      id: 'upi',
      name: 'UPI',
      icon: 'logo-google',
      upi: store?.upi || '',
    };
  } else if (type === 'Razorpay') {
    return {
      id: 'razorpay',
      name: 'Razorpay',
      icon: 'card-outline',
    };
  } else {
    return null;
  }
}).filter(Boolean);

useEffect(() => {
  if (store?.paymentType) {
    let defaultPayment = '';

    if (store.paymentType.includes('Razorpay')) {
      defaultPayment = 'razorpay';
    } else if (store.paymentType.includes('UPI')) {
      defaultPayment = 'upi';
    } else if (store.paymentType.includes('Cash on Delivery')) {
      defaultPayment = 'cod';
    }

    setSelectedPayment(defaultPayment);
  }
}, [store]);


const validateService = () => {
  const isRestaurantOrHotel = 
    store?.category?.toLowerCase().includes('hotel') ||
    store?.category?.toLowerCase().includes('restaurant');
    
  if (isRestaurantOrHotel && selectedService.trim() === '') {
    return 'Please select a service type';
  }
  return '';
};
const getTotalItems = () => {
  return products.reduce((sum, item) => sum + (item.quantity || 1), 0);
};

useEffect(() => {
  if (products && products.length > 0) {
    const initialQuantities = {};
    products.forEach(product => {
      const prod = product.productId || product;
      initialQuantities[prod._id] = product.quantity || 1;
    });
    setProductQuantities(initialQuantities);
  }
}, [products]);



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
    const cleanPhone = phone.replace(/\D/g, ''); // Remove all non-digits
    
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

  // Handle input changes with validation
  const handleNameChange = (text) => {
    setCustomerName(text);
    const error = validateName(text);
    setNameError(error);
  };

  const handlePhoneChange = (text) => {
    // Allow only digits and limit to 10 characters
    const cleanText = text.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(cleanText);
    const error = validatePhone(cleanText);
    setPhoneError(error);
  };

  const handleAddressChange = (text) => {
    setAddress(text);
    const error = validateAddress(text);
    setAddressError(error);
  };

  const handleTransactionIdChange = (text) => {
    setTransactionId(text);
    const error = validateTransactionId(text);
    setTransactionError(error);
  };

  // Check if form is valid
  const isFormValid = () => {
    const nameValid = validateName(customerName) === '';
    const phoneValid = validatePhone(phoneNumber) === '';
    const addressValid = validateAddress(address) === '';
    
    // For digital payments, also check transaction ID
    if (selectedPayment === 'UPI') {
      const transactionValid = validateTransactionId(transactionId) === '';
      return nameValid && phoneValid && addressValid && transactionValid && paymentCompleted;
    }
    
    return nameValid && phoneValid && addressValid;
  };

  // Calculate total
  const calculateTotal = () => {
    return products.reduce((sum, item) => {
      const p = item.productId || item;
      const price = parseFloat(p.price) || 0;
      const qty = item.quantity || 1;
      return sum + (price * qty);
    }, 0).toFixed(2);
  };


  // Handle payment selection
  const handlePaymentSelect = (paymentId) => {
    setSelectedPayment(paymentId);
    setTransactionId('');
    setTransactionError('');
    setPaymentCompleted(false);
    
    // If selecting UPI payment, show payment modal
    if (paymentId === 'upi') {
      setShowPaymentModal(true);
    }
  };
  // Generate payment deep link
// Replace the generatePaymentDeepLink function with this fixed version:

const generatePaymentDeepLink = (paymentMethod) => {
  const amount = calculateTotal();
  const merchantName = store.storeName || 'Merchant';
  const merchantUPI = store.upi || store.upiId || 'merchant@paytm'; // Fix UPI ID reference
  
  // Generate a proper transaction note
  const transactionNote = products.length === 1 
    ? `Payment for ${products[0].productId?.name || products[0].name || 'Product'}`
    : `Payment for ${products.length} items from ${merchantName}`;

  let deepLink = '';
  
  switch (paymentMethod) {
    case 'gpay':
      deepLink = `upi://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
      break;
    case 'phonepe':
      deepLink = `upi://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
      break;
    case 'paytm':
      deepLink = `paytmmp://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
      break;
    case 'upi':
    default:
      deepLink = `upi://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
      break;
  }
  
return deepLink;
};

  // Handle payment app opening
  const openPaymentApp = async (paymentMethod) => {
    try {
      const deepLink = generatePaymentDeepLink(paymentMethod);
      
      if (deepLink) {
    
        const supported = await Linking.canOpenURL(deepLink);
        if (supported) {
          await Linking.openURL(deepLink);
          
          // Show success message and instructions
          Toast.show({
            type: 'info',
            text1: '💳 Payment App Opened',
            text2: 'Complete payment and return to enter transaction ID',
            position: 'top',
            visibilityTime: 4000,
          });
          
          return true;
        } else {
          // Try alternative deep links
          const alternativeLinks = getAlternativeDeepLinks(paymentMethod);
          for (const altLink of alternativeLinks) {
            try {
              const altSupported = await Linking.canOpenURL(altLink);
              if (altSupported) {
                await Linking.openURL(altLink);
                
                Toast.show({
                  type: 'info',
                  text1: '💳 Payment App Opened',
                  text2: 'Complete payment and return to enter transaction ID',
                  position: 'top',
                  visibilityTime: 4000,
                });
                
                return true;
              }
            } catch (altError) {
             continue;
            }
          }
          
          // If no apps work, show install message
          Alert.alert(
            'App Not Found', 
            `${paymentMethod.toUpperCase()} app is not installed. Please install a UPI app or use a different payment method.`,
            [
              {
                text: 'OK',
                onPress: () => console.log('User acknowledged app not found')
              }
            ]
          );
          return false;
        }
      }
    } catch (error) {
      console.error('Payment app error:', error);
      Alert.alert('Error', 'Failed to open payment app. Please try again or use a different payment method.');
      return false;
    }
  };

  // Get alternative deep links for better compatibility
  const getAlternativeDeepLinks = (paymentMethod) => {
    const amount = calculateTotal();
    const merchantName = store.storeName || 'Merchant';
    const merchantUPI = store.upi || store.upiId || 'merchant@paytm';
    
    switch (paymentMethod) {
      case 'gpay':
        return [
          `gpay://upi/pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`,
          `tez://upi/pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`
        ];
      case 'phonepe':
        return [
          `phonepe://upi/pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`,
          `phonepe://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`
        ];
      case 'paytm':
        return [
          `paytmmp://upi/pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`,
          `paytm://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`
        ];
      default:
        return [
          `upi://pay?pa=${merchantUPI}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`
        ];
    }
  };

  // Handle payment process
  const handlePaymentProcess = async () => {
    try {
      // For UPI, we'll show a list of available payment apps
      Alert.alert(
        'Choose Payment App',
        'Select your preferred UPI app to complete the payment',
        [
          {
            text: 'Google Pay',
            onPress: () => openPaymentApp('gpay')
          },
          {
            text: 'PhonePe', 
            onPress: () => openPaymentApp('phonepe')
          },
          {
            text: 'Paytm',
            onPress: () => openPaymentApp('paytm')
          },
          {
            text: 'Other UPI App',
            onPress: () => openPaymentApp('upi')
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Payment process error:', error);
      Alert.alert('Error', 'Failed to initiate payment. Please try again.');
    }
  };
  

  // Confirm payment completion
  const confirmPaymentCompletion = () => {
    const error = validateTransactionId(transactionId);
    setTransactionError(error);
    
    if (!error) {
      setPaymentCompleted(true);
      setShowPaymentModal(false);
      Toast.show({
        type: 'success',
        text1: '✅ Payment Confirmed!',
        text2: 'Placing your order...',
        position: 'top',
        visibilityTime: 3000,
      });
      
    
      handlePlaceOrder(); // call order placement
    }
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
 
    setIsPlacingOrder(true);
    
    // Step 1: Validate all inputs
    const nameValidationError = validateName(customerName);
    const phoneValidationError = validatePhone(phoneNumber);
    const addressValidationError = validateAddress(address);
    const serviceValidationError = validateService();
    
    setNameError(nameValidationError);
    setPhoneError(phoneValidationError);
    setAddressError(addressValidationError);
    setServiceError(serviceValidationError);
    
    if (nameValidationError || phoneValidationError || addressValidationError || serviceValidationError) {
      Toast.show({
        type: 'error',
        text1: '❌ Validation Error',
        text2: 'Please fix the errors before placing the order',
      });
      setIsPlacingOrder(false);
      return;
    }
    
    // Razorpay Payment Flow
    if (selectedPayment === "razorpay") {
      try {
      const totalAmount = parseFloat(calculateTotal());
      
        // Step 1: Create Razorpay order
        const res = await axios.post(`${SERVER_URL}/stores/razorpay/create-order`, {
          amount: totalAmount * 100, // Convert to paise
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            storeId: store._id,
            customer: user.username || user.name,
          },
        });
        
        const { order } = res.data;
        
        // Step 2: Configure Razorpay options
        const options = {
          description: `Order Paymentfrpm ${user.username||" "}`,
          image: store.profileImage || 'https://via.placeholder.com/100',
          currency: order.currency,
          key: order.key_id,
          amount: order.amount,
          name: store.storeName,
          order_id: order.id,
          prefill: {
            email: user.email || '',
            contact: user.phone || phoneNumber,
            name: user.username || user.name || customerName,
          },
          theme: { color: '#3399cc' }
        };
        
    
        // Step 3: Open Razorpay checkout
        RazorpayCheckout.open(options)
          .then(async (data) => {
            // Payment successful
           
            try  {
              // Step 4: Verify payment
              const verifyRes = await axios.post(`${SERVER_URL}/stores/razorpay/verify-payment`, {
                razorpay_order_id: data.razorpay_order_id,
                razorpay_payment_id: data.razorpay_payment_id,
                razorpay_signature: data.razorpay_signature,
              });
              
              if (verifyRes.data.success) {
                // Step 5: Create order after successful payment
                const orderProducts = products.map(item => {
                  const product = item.productId || item;
                  return {
                    productId: product._id,
                    productName: product.name || product.productName,
                    quantity: productQuantities[product._id] || item.quantity || 1,
                    unitPrice: parseFloat(product.price) || 0,
                  };
                });
                
                const orderData = {
                  products: orderProducts,
                  sellerId: store._id,
                  buyerId: user._id,
                  totalAmount: parseFloat(calculateTotal()),
                  totalItems: getTotalItems(),
                  orderType: selectedService,
                  customerName: customerName.trim(),
                  deliveryAddress: address.trim(),
                  phoneNumber: phoneNumber,
                  paymentMethod: selectedPayment,
                  transactionId: data.razorpay_payment_id,
                  status: 'pending',
                };
                
                const finalRes = await axios.post(`${SERVER_URL}/orders/create`, orderData, {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                });
                
                Toast.show({
                  type: 'success',
                  text1: '✅ Order Placed!',
                  text2: `Order ID: ${finalRes.data.orderId}`,
                });
                
                setOrderPlaced(true);
                clearStoreCart(storeId);
                navigation.goBack();
                
              } else {
                Toast.show({
                  type: 'error',
                  text1: '❌ Payment Verification Failed',
                  text2: 'Please contact support',
                });
                setIsPlacingOrder(false);
              }
              
            } catch (err) {
              console.error("❌ Payment verification error:", err);
              Toast.show({
                type: 'error',
                text1: '❌ Payment Verification Failed',
                text2: 'Please try again',
              });
              setIsPlacingOrder(false);
            }
          })
          .catch((error) => {
            // Payment failed or cancelled
          Toast.show({
              type: 'error',
              text1: '❌ Payment Failed',
              text2: error.description || 'Payment was cancelled',
            });
            setIsPlacingOrder(false);
          });
          
        return; // Exit here for Razorpay flow
        
      } catch (err) {
        console.error("❌ Razorpay initialization error:", err);
        Toast.show({
          type: 'error',
          text1: '❌ Payment Setup Failed',
          text2: 'Please try again',
        });
        setIsPlacingOrder(false);
        return;
      }
    }
    
    // COD and UPI Payment Flow
    if (selectedPayment === 'cod' || (selectedPayment === 'upi' && paymentCompleted)) {
      try {
        const orderProducts = products.map(item => {
          const product = item.productId || item;
          return {
            productId: product._id,
            productName: product.name || product.productName,
            quantity: productQuantities[product._id] || item.quantity || 1,
            unitPrice: parseFloat(product.price) || 0,
          };
        });
        
        const orderData = {
          products: orderProducts,
          sellerId: store._id,
          buyerId: user._id,
          totalAmount: parseFloat(calculateTotal()),
          totalItems: getTotalItems(),
          orderType: selectedService,
          customerName: customerName.trim(),
          deliveryAddress: address.trim(),
          phoneNumber: phoneNumber,
          paymentMethod: selectedPayment,
          transactionId: selectedPayment === 'cod' ? null : transactionId.trim(),
          status: 'pending',
        };
        
        const response = await axios.post(`${SERVER_URL}/orders/create`, orderData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.data) {
          setOrderPlaced(true);
          Toast.show({
            type: 'success',
            text1: '✅ Order Placed!',
            text2: `Order ID: ${response.data.orderId || 'N/A'}`,
          });
          
          clearStoreCart(storeId);
          navigation.goBack();
        }
        
      } catch (err) {
        console.error("❌ Order error:", err);
        Toast.show({
          type: 'error',
          text1: '❌ Order Failed',
          text2: 'Failed to place order. Please try again.',
        });
      } finally {
        setIsPlacingOrder(false);
      }
    }
  };
  

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >    
          {/* Product Details */}
          <View style={styles.productContainer}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            {products.map((item, index) => {
  const p = item.productId || item;
  return (
    <View key={index} style={styles.productCard}>
  <Image 
    source={{ uri: p.images?.[0] || p.image || p.imageUrl }} 
    style={styles.productImage} 
  />
  <View style={styles.productInfo}>
    <Text style={styles.productName}>{p.name || p.productName}</Text>
    <Text style={styles.productPrice}>₹{p.price}</Text>

    {/* Quantity controls */}
    <View style={styles.quantityControls}>
      <TouchableOpacity
        onPress={() => updateCartQuantity(store._id, p._id, Math.max((item.quantity || 1) - 1, 1))}
        style={styles.qtyBtn}
      >
        <Ionicons name="remove" size={18} color="#333" />
      </TouchableOpacity>
      <Text style={styles.qtyText}>{item.quantity || 1}</Text>
      <TouchableOpacity
        onPress={() => updateCartQuantity(store._id, p._id, (item.quantity || 1) + 1)}
        style={styles.qtyBtn}
      >
        <Ionicons name="add" size={18} color="#333" />
      </TouchableOpacity>
    </View>

    {/* Delete Button */}
    <TouchableOpacity
      onPress={() => removeFromCart(store._id, p._id)}
      style={styles.deleteBtn}
    >
      <Ionicons name="trash" size={18} color="#fff" />
      <Text style={{ color: "#fff", marginLeft: 4 }}>Remove</Text>
    </TouchableOpacity>
  </View>
</View>

  );
})}

          </View>

          {/* Quantity Selection */}
          <View style={styles.quantityContainer}>
            <Text style={styles.totalAmount}>Total: ₹{calculateTotal()}</Text>
          </View>

          {/* Customer Details */}
          <View style={styles.customerDetailsContainer}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={[
                  styles.textInput,
                  nameError ? styles.textInputError : null
                ]}
                placeholder="Enter your full name"
                value={customerName}
                onChangeText={handleNameChange}
                placeholderTextColor="#999999"
              />
              {nameError ? (
                <Text style={styles.errorText}>{nameError}</Text>
              ) : null}
            </View>


            {store?.category === 'Restaurant' && (
  <View style={[styles.inputContainer, { marginBottom: 12 }]}>
    <Text style={[styles.inputLabel, { color: '#00796B' }]}>Order Type</Text>
    <View style={styles.radioGroup}>
      {['Eat In', 'Parcel', 'Collection'].map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.radioOption,
            orderType === type && styles.radioOptionActive
          ]}
          onPress={() => setOrderType(type)}
        >
          <Ionicons
            name={orderType === type ? 'radio-button-on' : 'radio-button-off'}
            size={18}
            color={orderType === type ? '#004D40' : '#999'}
          />
          <Text
            style={[
              styles.radioLabel,
              { color: orderType === type ? '#004D40' : '#666' }
            ]}
          >
            {type}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
)}

            <View style={styles.inputContainer}>
            {store?.category === 'Restaurant' && (orderType === 'Eat In' || orderType === 'Parcel') 
  ? <Text style={styles.inputLabel}>Table Number</Text> 
  : <Text style={styles.inputLabel}>Delivery Address</Text>}
              <TextInput
                style={[
                  styles.textInput, 
                  styles.addressInput,
                  addressError ? styles.textInputError : null
                ]}
                placeholder="Enter complete delivery address"
                value={address}
                onChangeText={handleAddressChange}
                multiline={true}
                numberOfLines={3}
                placeholderTextColor="#999999"
              />
              {addressError ? (
                <Text style={styles.errorText}>{addressError}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={[
                  styles.textInput,
                  phoneError ? styles.textInputError : null
                ]}
                placeholder="Enter 10-digit phone number"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                keyboardType="numeric"
                placeholderTextColor="#999999"
                maxLength={10}
              />
              {phoneError ? (
                <Text style={styles.errorText}>{phoneError}</Text>
              ) : null}
            </View>
          </View>

          {/* Payment Options */}
          <View style={styles.paymentContainer}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentOptions}>
              {paymentOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.paymentOption,
                    selectedPayment === option.id && styles.paymentOptionSelected
                  ]}
                  onPress={() => handlePaymentSelect(option.id)}
                >
                  <Ionicons 
                    name={option.icon} 
                    size={24} 
                    color={selectedPayment === option.id ? "#FFFFFF" : "#155366"} 
                  />
                  <Text style={[
                    styles.paymentOptionText,
                    selectedPayment === option.id && styles.paymentOptionTextSelected
                  ]}>
                    {option.name}
                  </Text>
                  {selectedPayment === option.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Transaction ID Input for Digital Payments */}
          {selectedPayment === 'UPI' && (
            <View style={styles.transactionContainer}>
              <Text style={styles.sectionTitle}>Transaction Details</Text>
              {!paymentCompleted && (
                <View style={styles.paymentInstructions}>
                  <Ionicons name="information-circle" size={24} color="#FF9800" />
                  <Text style={styles.instructionText}>
                    Complete payment using {paymentOptions.find(p => p.id === selectedPayment)?.name} and enter your transaction ID below.
                  </Text>
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Transaction ID / Reference Number</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    transactionError ? styles.textInputError : null
                  ]}
                  placeholder="Enter transaction ID after payment"
                  value={transactionId}
                  onChangeText={handleTransactionIdChange}
                  placeholderTextColor="#999999"
                />
                {transactionError ? (
                  <Text style={styles.errorText}>{transactionError}</Text>
                ) : null}
              </View>

              {paymentCompleted && (
                <View style={styles.paymentSuccess}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={styles.successText}>Payment details confirmed!</Text>
                </View>
              )}
            </View>
          )}

          {/* Order Summary */}
          {products.map((item, index) => {
  const p = item.productId || item;
  return (
    <View key={index} style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{p.name || p.productName} x {item.quantity || 1}</Text>
      <Text style={styles.summaryValue}>₹{(parseFloat(p.price) * (item.quantity || 1)).toFixed(2)}</Text>
    </View>
  );
})}
<View style={[styles.summaryRow, styles.totalRow]}>
  <Text style={styles.totalLabel}>Total Amount:</Text>
  <Text style={styles.totalValue}>₹{calculateTotal()}</Text>
</View>


        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
  style={[
    styles.placeOrderButton,
    (!isFormValid() || isLoading) && styles.placeOrderButtonDisabled
  ]}
  onPress={handlePlaceOrder}
  disabled={!isFormValid() || isLoading}
>
  {isLoading ? (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name="reload" size={18} color="#fff" style={{ marginRight: 8 }} />
      <Text style={styles.placeOrderButtonText}>Placing...</Text>
    </View>
  ) : (
    <Text style={styles.placeOrderButtonText}>Place Order</Text>
  )}
</TouchableOpacity>

        </View>
      </KeyboardAvoidingView>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Pay via {paymentOptions.find(p => p.id === selectedPayment)?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color="#155366" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentAmount}>Amount: ₹{calculateTotal()}</Text>
                <Text style={styles.paymentMerchant}>Pay to: {store.storeName || 'Merchant'}</Text>
                {store.upiId && (
                  <Text style={styles.paymentUPI}>UPI ID: {store.upiId}</Text>
                )}
              </View>

              <TouchableOpacity 
                style={styles.openPaymentAppButton}
                onPress={handlePaymentProcess}
              >
                <Ionicons name="card" size={24} color="#FFFFFF" />
                <Text style={styles.openPaymentAppText}>
                  Open {paymentOptions.find(p => p.id === selectedPayment)?.name}
                </Text>
              </TouchableOpacity>

              <View style={styles.paymentInstructions}>
                <Text style={styles.instructionTitle}>Instructions:</Text>
                <Text style={styles.instructionText}>
                  1. Click "Open {paymentOptions.find(p => p.id === selectedPayment)?.name}" button above
                </Text>
                <Text style={styles.instructionText}>
                  2. Complete the payment in the app
                </Text>
                <Text style={styles.instructionText}>
                  3. Copy the transaction ID/reference number
                </Text>
                <Text style={styles.instructionText}>
                  4. Enter it below and click "Confirm Payment"
                </Text>
              </View>

              <View style={styles.transactionInputContainer}>
                <Text style={styles.inputLabel}>Transaction ID</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    transactionError ? styles.textInputError : null
                  ]}
                  placeholder="Paste transaction ID here"
                  value={transactionId}
                  onChangeText={handleTransactionIdChange}
                  placeholderTextColor="#999999"
                />
                {transactionError ? (
                  <Text style={styles.errorText}>{transactionError}</Text>
                ) : null}
              </View>

              <TouchableOpacity 
                style={[
                  styles.confirmPaymentButton,
                  !transactionId.trim() && styles.confirmPaymentButtonDisabled
                ]}
                onPress={confirmPaymentCompletion}
                disabled={!transactionId.trim()}
              >
                <Text style={styles.confirmPaymentText}>Confirm Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#155366',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#155366',
  },
  productContainer: {
    marginBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#E0E0E0',
  },
  productInfo: {
    flex: 1,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  qtyBtn: {
    backgroundColor: '#ddd',
    padding: 6,
    borderRadius: 4,
  },
  qtyText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d9534f',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },  
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#155366',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
    color: '#666666',
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    width: 60,
    height: 40,
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#FFFFFF',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#155366',
    textAlign: 'center',
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  customerDetailsContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#155366',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  textInputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1.5,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 10,
  },
  
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#F0F0F0',
  },
  
  radioOptionActive: {
    backgroundColor: '#E0F2F1',
    borderColor: '#00796B',
  },
  
  radioLabel: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  paymentContainer: {
    marginBottom: 20,
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
  },
  paymentOptionSelected: {
    backgroundColor: '#155366',
    borderColor: '#155366',
  },
  paymentOptionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#155366',
  },
  paymentOptionTextSelected: {
    color: '#FFFFFF',
  },
  transactionContainer: {
    marginBottom: 20,
  },
  paymentInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  instructionText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#E65100',
  },
  paymentSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  successText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  orderSummary: {
    backgroundColor: '#E0F2F1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryDetails: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#155366',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#155366',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#155366',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155366',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#155366',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B2DFDB',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#155366',
    fontWeight: '500',
  },
  placeOrderButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#155366',
    alignItems: 'center',
    marginLeft: 8,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#B2DFDB',
  },
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#155366',
  },
  modalContent: {
    padding: 20,
  },
  paymentDetails: {
    backgroundColor: '#E0F2F1',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#155366',
    marginBottom: 8,
  },
  paymentMerchant: {
    fontSize: 16,
    color: '#155366',
    marginBottom: 4,
  },
  paymentUPI: {
    fontSize: 14,
    color: '#666666',
  },
  openPaymentAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#155366',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  openPaymentAppText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#155366',
    marginBottom: 8,
  },
  transactionInputContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  confirmPaymentButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmPaymentButtonDisabled: {
    backgroundColor: '#C8E6C9',
  },
  confirmPaymentText: { 
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
export default OrderDetails;