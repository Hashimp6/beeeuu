import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import axios from 'axios';
import { SERVER_URL } from '../config';

const AppointmentCard = ({ 
  appointmentData, 
  onRefresh, // Changed from individual callbacks to single refresh function
  onPayment,
  onAppointmentUpdate // New prop to update appointment state directly
}) => {
  const { user } = useAuth() || {};
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  
  // Debug: Log initial data

  if (!appointmentData || !user) {
  return null;
  }

  // FIXED: Determine if current user is the sender (customer) or receiver (store owner)
  const isUserSender = appointmentData.user === user._id || appointmentData.user?._id === user._id;
  
  // FIXED: Check if user is store owner by comparing store._id with user.storeId
  const isUserReceiver = (appointmentData.store === user.storeId || appointmentData.store?._id === user.storeId);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'advance-recieved': return '#2196F3';
      case 'cancelled': return '#F44336';
      case 'pending': return '#FF9800';
      case 'completed': return '#8BC34A';
      case 'not-attended': return '#9E9E9E';
      default: return '#757575';
    }
  };

  const getPaymentStatusColor = (payment) => {
    switch (payment) {
      case 'full': return '#4CAF50';
      case 'advance': return '#FF9800';
      case 'none': return '#757575';
      default: return '#757575';
    }
  };

  // Get store UPI and generate deep link
  const getStoreUPIAndGenerateLink = async (paymentMethod) => {
    try {

      // Get store ID from appointment data
      const storeId = appointmentData.store?._id || appointmentData.store;
      
      if (!storeId) {
        Alert.alert(
          'Store Not Found',
          'Unable to find store information for payment.',
          [{ text: 'OK' }]
        );
        return null;
      }

   
      // Fetch UPI from backend
      const upiResponse = await axios.get(`${SERVER_URL}/stores/${storeId}/upi`);
      const recipientUPI = upiResponse.data?.upi;
      
      
    
      if (!recipientUPI) {
        Alert.alert(
          'UPI Not Available',
          'Store owner has not set up UPI payments. Please contact them directly.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Calculate 30% advance amount
      const totalCost = appointmentData.cost || appointmentData.product?.price || 0;
      const advanceAmount = Math.ceil(totalCost * 0.3);
      
      const transactionNote = `Payment for Appointment #${appointmentData._id.slice(-6)} - Advance`;
      const transactionRef = `APT${appointmentData._id.slice(-8)}${Date.now().toString().slice(-4)}`;
      
      let deepLink = '';
      
      if (paymentMethod === 'phonepe') {
        deepLink = `phonepe://pay?pa=${recipientUPI}&pn=${encodeURIComponent(appointmentData.storeName || 'Store Owner')}&am=${advanceAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
      } else if (paymentMethod === 'googlepay') {
        deepLink = `tez://upi/pay?pa=${recipientUPI}&pn=${encodeURIComponent(appointmentData.storeName || 'Store Owner')}&am=${advanceAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
      }

      return {
        deepLink,
        amount: advanceAmount,
        upi: recipientUPI
      };

    } catch (error) {
      console.error('❌ Error fetching store UPI:', error);
      Alert.alert(
        'Error',
        'Unable to fetch payment details. Please try again.',
        [{ text: 'OK' }]
      );
      return null;
    }
  };

  // Handle payment method selection and deep link generation
  const handlePaymentMethodSelect = async (method) => {
    setSelectedPaymentMethod(method);
    
    const paymentData = await getStoreUPIAndGenerateLink(method);
    
    if (paymentData) {
      console.log(`📱 Opening ${method} with amount: ₹${paymentData.amount}`);
      
      try {
        const canOpen = await Linking.canOpenURL(paymentData.deepLink);
        
        if (canOpen) {
          await Linking.openURL(paymentData.deepLink);
        } else {
          Alert.alert(
            `${method === 'phonepe' ? 'PhonePe' : 'Google Pay'} Not Found`,
            `Please install ${method === 'phonepe' ? 'PhonePe' : 'Google Pay'} app to continue with payment.`,
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error(`❌ Error opening ${method}:`, error);
        Alert.alert(
          'Error',
          `Unable to open ${method === 'phonepe' ? 'PhonePe' : 'Google Pay'}. Please try again.`,
          [{ text: 'OK' }]
        );
      }
    }
  };

  // NEW: Handle transaction ID submission with API call
  const handleTransactionSubmit = async () => {
    if (!transactionId.trim()) {
      Alert.alert('Missing Transaction ID', 'Please enter the transaction ID to complete the payment.');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Payment Method Not Selected', 'Please select a payment method first.');
      return;
    }

    setIsSubmittingPayment(true);

    try {
     
      const totalCost = appointmentData.cost || appointmentData.product?.price || 0;
      const advanceAmount = Math.ceil(totalCost * 0.3);
      
      // NEW: API call to update appointment with payment details
      const response = await axios.put(`${SERVER_URL}/appointments/advance-payment/${appointmentData._id}`, {
        transactionId: transactionId.trim(),
        paymentMethod: selectedPaymentMethod,
        amountPaid: advanceAmount,
        payment: 'advance', // Update payment status to advance
        status: 'advance-recieved' // Update status to advance-recieved
      });

    
      // Call payment callback if provided (for additional handling)
      if (onPayment) {
        await onPayment(appointmentData._id, 'advance', advanceAmount, {
          transactionId: transactionId.trim(),
          paymentMethod: selectedPaymentMethod,
          amount: advanceAmount
        });
      }

      // Update the appointment state immediately with new data
      if (onAppointmentUpdate) {
        onAppointmentUpdate(appointmentData._id, {
          transactionId: transactionId.trim(),
          amountPaid: advanceAmount,
          payment: 'advance',
          status: 'advance-recieved'
        });
      }

      Alert.alert(
        'Payment Submitted Successfully',
        'Your advance payment has been recorded. The store owner has been notified.',
        [{ 
          text: 'OK',
          onPress: () => {
            setShowPaymentModal(false);
            setTransactionId('');
            setSelectedPaymentMethod('');
            
            // Refresh the appointment data
            if (onRefresh) {
              onRefresh();
            }
          }
        }]
      );

    } catch (error) {
      console.error('❌ Error submitting payment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit payment details. Please try again.';
      Alert.alert(
        'Payment Submission Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // SIMPLIFIED: Universal status update function
  const updateAppointmentStatus = async (newStatus, actionName) => {
 
    Alert.alert(
      `${actionName} Appointment`,
      `Are you sure you want to ${actionName.toLowerCase()} this appointment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: actionName, 
          style: newStatus === 'cancelled' ? 'destructive' : 'default',
          onPress: async () => {
            try {
             
              const response = await axios.patch(
                `${SERVER_URL}/appointments/mark-advance/${appointmentData._id}` );
            
              // Update the appointment state immediately
              if (onAppointmentUpdate) {
                onAppointmentUpdate(appointmentData._id, { status: newStatus });
              }
              
              // Force refresh immediately
              if (onRefresh) {
                onRefresh();
              }
              
              // Show success message
              Alert.alert(
                'Success',
                `Appointment has been ${actionName.toLowerCase()} successfully!`,
                [{ text: 'OK' }]
              );
              
            } catch (error) {
              console.error(`❌ Error ${actionName.toLowerCase()} appointment:`, error);
              Alert.alert(
                'Error',
                error.response?.data?.message || `Failed to ${actionName.toLowerCase()} appointment. Please try again.`,
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  // Show payment modal
  const handlePayAdvance = () => {
    const totalCost = appointmentData.cost || appointmentData.product?.price || 0;
    const advanceAmount = Math.ceil(totalCost * 0.3);
    
 
    setShowPaymentModal(true);
  };

  const renderActionButtons = () => {
    const { status } = appointmentData;
  
    // If appointment is cancelled, show no buttons
    if (status === 'cancelled') {
    return null;
    }
  
    // FOR SENDERS (CUSTOMERS)
    if (isUserSender) {
     
      if (status === 'pending') {
       return (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={() => updateAppointmentStatus('cancelled', 'Cancel')}
            >
              <Ionicons name="close" size={14} color="#FFFFFF" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        );
      } else if (status === 'confirmed') {
      const totalCost = appointmentData.cost || appointmentData.product?.price || 0;
        const amountPaid = appointmentData.amountPaid || 0;
        const remainingAmount = totalCost - amountPaid;
        const hasUnpaidAmount = remainingAmount > 0;
        
     
        return (
          <View style={styles.buttonContainer}>
            {hasUnpaidAmount && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.payButton]} 
                onPress={handlePayAdvance}
              >
                <Ionicons name="card" size={14} color="#FFFFFF" />
                <Text style={styles.buttonText}>Pay Now</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={() => updateAppointmentStatus('cancelled', 'Cancel')}
            >
              <Ionicons name="close" size={14} color="#FFFFFF" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        );
      } else if (status === 'advance-recieved') {
        return (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={() => updateAppointmentStatus('cancelled', 'Cancel')}
            >
              <Ionicons name="close" size={14} color="#FFFFFF" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        );
      } else {
        console.log('❓ Sender with unknown status:', status);
      }
    }
  
    // FOR RECEIVERS (STORE OWNERS) - Show approve/decline when pending
    if (isUserReceiver && status === 'pending') {
      console.log('🏪 User is RECEIVER (Store Owner) - Showing APPROVE + DECLINE buttons');
      return (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]} 
            onPress={() => updateAppointmentStatus('confirmed', 'Approve')}
          >
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]} 
            onPress={() => updateAppointmentStatus('cancelled', 'Decline')}
          >
            <Ionicons name="close" size={14} color="#FFFFFF" />
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (isUserReceiver && status !== 'pending') {
      console.log('🏪 User is RECEIVER but status is not pending:', status);
    }
  
  return null;
  };

  // Payment Modal Component
  const renderPaymentModal = () => {
    const totalCost = appointmentData.cost || appointmentData.product?.price || 0;
    const advanceAmount = Math.ceil(totalCost * 0.3);

    return (
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Options</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowPaymentModal(false);
                  setTransactionId('');
                  setSelectedPaymentMethod('');
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.paymentAmount}>
                Advance Amount: ₹{advanceAmount} (30% of ₹{totalCost})
              </Text>

              <Text style={styles.sectionTitle}>Select Payment Method:</Text>
              
              <View style={styles.paymentMethodContainer}>
                <TouchableOpacity
                  style={[
                    styles.paymentMethodButton,
                    selectedPaymentMethod === 'phonepe' && styles.selectedPaymentMethod
                  ]}
                  onPress={() => handlePaymentMethodSelect('phonepe')}
                >
                  <View style={styles.paymentMethodContent}>
                    <Ionicons name="phone-portrait" size={24} color="#673AB7" />
                    <Text style={styles.paymentMethodText}>PhonePe</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentMethodButton,
                    selectedPaymentMethod === 'googlepay' && styles.selectedPaymentMethod
                  ]}
                  onPress={() => handlePaymentMethodSelect('googlepay')}
                >
                  <View style={styles.paymentMethodContent}>
                    <Ionicons name="card" size={24} color="#4285F4" />
                    <Text style={styles.paymentMethodText}>Google Pay</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {selectedPaymentMethod && (
                <View style={styles.transactionSection}>
                  <Text style={styles.sectionTitle}>Enter Transaction ID:</Text>
                  <Text style={styles.instructionText}>
                    Complete the payment in {selectedPaymentMethod === 'phonepe' ? 'PhonePe' : 'Google Pay'} and enter the transaction ID below:
                  </Text>
                  <TextInput
                    style={styles.transactionInput}
                    placeholder="Enter transaction ID after payment"
                    value={transactionId}
                    onChangeText={setTransactionId}
                    autoCapitalize="characters"
                  />
                  
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (!transactionId.trim() || isSubmittingPayment) && styles.disabledButton
                    ]}
                    onPress={handleTransactionSubmit}
                    disabled={!transactionId.trim() || isSubmittingPayment}
                  >
                    <Text style={[
                      styles.submitButtonText,
                      (!transactionId.trim() || isSubmittingPayment) && styles.disabledButtonText
                    ]}>
                      {isSubmittingPayment ? 'Submitting...' : 'Submit Payment'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.appointmentCard}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar" size={16} color="#000" />
          <Text style={styles.title}>Appointment</Text>
        </View>
        <Text style={styles.roleIndicator}>
          {isUserSender ? 'Requested' : 'Received'}
        </Text>
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Service & Date Row */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Service</Text>
            <Text style={styles.value} numberOfLines={1}>
              {appointmentData.productName || 'Not specified'}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Date & Time</Text>
            <Text style={styles.value} numberOfLines={1}>
              {formatDateTime(appointmentData.date)}
            </Text>
          </View>
        </View>
        
        {/* Location & Cost Row */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value} numberOfLines={1}>
              {appointmentData.locationName || 'Not specified'}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Cost</Text>
            <Text style={styles.value}>
              ₹{appointmentData.price|| 0}
              {appointmentData.amountPaid > 0 && (
                <Text style={styles.paidAmount}> (₹{appointmentData.amountPaid} paid)</Text>
              )}
            </Text>
          </View>
        </View>
        
        {/* Status Row */}
        <View style={styles.statusRow}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointmentData.status) }]}>
              <Text style={styles.statusText}>
                {appointmentData.status?.toUpperCase().replace('-', ' ') || 'PENDING'}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Payment</Text>
            <View style={[styles.statusBadge, { backgroundColor: getPaymentStatusColor(appointmentData.payment) }]}>
              <Text style={styles.statusText}>
                {appointmentData.payment?.toUpperCase() || 'NONE'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Transaction ID (if available) */}
        {appointmentData.transactionId && (
          <View style={styles.transactionRow}>
            <Ionicons name="receipt-outline" size={14} color="#757575" />
            <Text style={styles.transactionText}>Transaction ID: {appointmentData.transactionId}</Text>
          </View>
        )}
        
        {/* Contact (if available) */}
        {appointmentData.contactNo && (
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={14} color="#757575" />
            <Text style={styles.contactText}>{appointmentData.contactNo}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {renderActionButtons()}

      {/* Payment Modal */}
      {renderPaymentModal()}
    </View>
  );
};

// Add styles for new elements
const styles = StyleSheet.create({
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  roleIndicator: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  content: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  column: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  paidAmount: {
    color: '#4CAF50',
    fontSize: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusContainer: {
    flex: 1,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  payButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    // Content styles
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paymentMethodButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedPaymentMethod: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  paymentMethodContent: {
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    fontWeight: '500',
  },
  transactionSection: {
    marginTop: 20,
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    lineHeight: 16,
  },

  transactionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999999',
  },
});

export default AppointmentCard;