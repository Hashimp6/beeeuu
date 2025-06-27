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
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { SERVER_URL } from '../config';

const OrderDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const store = route.params.store|| {};
  const product =route.params.itemDetails
  console.log("fss",product);
  console.log("lss",store);
  
  const { user, token } = useAuth() || {};
console.log("authuser",user);

  // Form states
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState(user?.username || '');
  const [address, setAddress] = useState(user?.address ||'');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [selectedPayment, setSelectedPayment] = useState('cod');

  // Validation error states
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');

  // Product details
  const productPrice = parseFloat(product.price) || 0;
  const productName = product.name || product.productName || 'Product';
  const productImage = product.image || product.imageUrl || null;
  const storeId = store.storeId || store._id;

  // Payment options
  const paymentOptions = [
    { id: 'cod', name: 'Cash on Delivery', icon: 'cash-outline' },
    { id: 'gpay', name: 'Google Pay', icon: 'logo-google' },
    { id: 'phonepe', name: 'PhonePe', icon: 'card-outline' },
    { id: 'paytm', name: 'Paytm', icon: 'wallet-outline' },
    { id: 'upi', name: 'Other UPI', icon: 'qr-code-outline' }
  ];

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
    if (trimmedAddress.length < 10) {
      return 'Please enter a complete address (minimum 10 characters)';
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

  // Check if form is valid
  const isFormValid = () => {
    const nameValid = validateName(customerName) === '';
    const phoneValid = validatePhone(phoneNumber) === '';
    const addressValid = validateAddress(address) === '';
    return nameValid && phoneValid && addressValid;
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

  const handleQuantityChange = (text) => {
    const num = parseInt(text);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    }
  };

  // Handle payment selection
  const handlePaymentSelect = (paymentId) => {
    setSelectedPayment(paymentId);
  };

  // Handle payment processing
  const processPayment = async () => {
    if (selectedPayment === 'cod') {
      return { success: true, method: 'cod' };
    }

    // For digital payments, open respective apps
    try {
      let paymentUrl = '';
      const amount = calculateTotal();
      
      switch (selectedPayment) {
        case 'gpay':
          paymentUrl = `gpay://pay?pa=${store.upiId || 'merchant@paytm'}&pn=${store.storeName || 'Store'}&am=${amount}&cu=INR`;
          break;
        case 'phonepe':
          paymentUrl = `phonepe://pay?pa=${store.upiId || 'merchant@paytm'}&pn=${store.storeName || 'Store'}&am=${amount}&cu=INR`;
          break;
        case 'paytm':
          paymentUrl = `paytmmp://pay?pa=${store.upiId || 'merchant@paytm'}&pn=${store.storeName || 'Store'}&am=${amount}&cu=INR`;
          break;
        case 'upi':
          paymentUrl = `upi://pay?pa=${store.upiId || 'merchant@paytm'}&pn=${store.storeName || 'Store'}&am=${amount}&cu=INR`;
          break;
      }

      if (paymentUrl) {
        const supported = await Linking.canOpenURL(paymentUrl);
        if (supported) {
          await Linking.openURL(paymentUrl);
          return { success: true, method: selectedPayment };
        } else {
          Alert.alert('Error', 'Payment app not installed');
          return { success: false };
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Failed to process payment');
      return { success: false };
    }
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    // Validate all fields
    const nameValidationError = validateName(customerName);
    const phoneValidationError = validatePhone(phoneNumber);
    const addressValidationError = validateAddress(address);

    setNameError(nameValidationError);
    setPhoneError(phoneValidationError);
    setAddressError(addressValidationError);

    // Check if any validation errors exist
    if (nameValidationError || phoneValidationError || addressValidationError) {
      Alert.alert('Validation Error', 'Please fix the errors before placing the order');
      return;
    }

    const orderData = {
      productId: product._id || product.id,
      productName: productName,
      quantity: quantity,
      unitPrice: productPrice,
      totalAmount: calculateTotal(),
      buyerId:user._id,
      customerName: customerName.trim(),
      deliveryAddress: address.trim(),
      phoneNumber: phoneNumber,
      paymentMethod: selectedPayment,
      storeId: storeId,
      sellerId: store._id,
      status: 'pending'
    };

    try {
      console.log("order data ",orderData);
      
      // Process payment first (except for COD)
      if (selectedPayment !== 'cod') {
        const paymentResult = await processPayment();
        if (!paymentResult.success) {
          return;
        }
      }

      // Send order to server
      const response = await axios.post(`${SERVER_URL}/orders/create`, orderData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        console.log("✅ Order placed successfully", response.data);
        
        // Show success message
        Alert.alert(
          'Order Placed Successfully!',
          `Your order for ${productName} has been placed. Order ID: ${response.data.orderId || 'N/A'}`,
          [
            {
              text: 'OK',
             
            }
          ]
        );
      }

    } catch (error) {
      console.error("❌ Failed to place order:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to place order. Please try again.");
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
  keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // optional tweak for iOS
>
<ScrollView
    contentContainerStyle={styles.scrollContent}
    keyboardShouldPersistTaps="handled"
  >    
          {/* Product Details */}
          <View style={styles.productContainer}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <View style={styles.productCard}>
              {productImage && (
                <Image source={{ uri: productImage }} style={styles.productImage} />
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{productName}</Text>
                <Text style={styles.productPrice}>₹{productPrice.toFixed(2)}</Text>
                {store.storeName && (
                  <Text style={styles.storeName}>Store: {store.storeName}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Quantity Selection */}
          <View style={styles.quantityContainer}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Ionicons name="remove" size={20} color={quantity <= 1 ? "#ccc" : "#155366"} />
              </TouchableOpacity>
              
              <TextInput
                style={styles.quantityInput}
                value={quantity.toString()}
                onChangeText={handleQuantityChange}
                keyboardType="numeric"
                textAlign="center"
              />
              
              <TouchableOpacity 
                style={styles.quantityButton} 
                onPress={increaseQuantity}
              >
                <Ionicons name="add" size={20} color="#155366" />
              </TouchableOpacity>
            </View>
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

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Delivery Address</Text>
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

          {/* Order Summary */}
          <View style={styles.orderSummary}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryDetails}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Product:</Text>
                <Text style={styles.summaryValue}>{productName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Quantity:</Text>
                <Text style={styles.summaryValue}>{quantity}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Unit Price:</Text>
                <Text style={styles.summaryValue}>₹{productPrice.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>₹{calculateTotal()}</Text>
              </View>
            </View>
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
          !isFormValid() && styles.placeOrderButtonDisabled
        ]}
        onPress={handlePlaceOrder}
        disabled={!isFormValid()}
      >
        <Text style={styles.placeOrderButtonText}>Place Order</Text>
      </TouchableOpacity>
    </View>
      </KeyboardAvoidingView>

      {/* Bottom buttons */}
     
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
});

export default OrderDetails;