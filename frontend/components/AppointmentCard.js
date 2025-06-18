import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
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
  
  // Debug: Log initial data
  console.log('=== AppointmentCard Debug ===');
  console.log('appointmentData:', appointmentData);
  console.log('user:', user);
  console.log('user.upi:', user?.upi);
  
  if (!appointmentData || !user) {
    console.log('❌ Missing data - appointmentData:', !!appointmentData, 'user:', !!user);
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
      case 'cancelled': return '#F44336';
      case 'pending': return '#FF9800';
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



  // Try multiple UPI app schemes for better compatibility
  const tryOpenUPIApps = async (recipientUPI, amount, appointmentId, paymentType) => {
    const transactionNote = `Payment for Appointment #${appointmentId.slice(-6)} - ${paymentType}`;
    const transactionRef = `APT${appointmentId.slice(-8)}${Date.now().toString().slice(-4)}`;
    
    // Multiple UPI URL formats to try
    const upiUrls = [
      // PhonePe format
      `phonepe://pay?pa=${recipientUPI}&pn=${encodeURIComponent(appointmentData.storeName || 'Store Owner')}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
      
      // Google Pay format
      `tez://upi/pay?pa=${recipientUPI}&pn=${encodeURIComponent(appointmentData.storeName || 'Store Owner')}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
      
      // Paytm format
      `paytmmp://pay?pa=${recipientUPI}&pn=${encodeURIComponent(appointmentData.storeName || 'Store Owner')}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`,
      
      // Standard UPI format
      `upi://pay?pa=${recipientUPI}&pn=${encodeURIComponent(appointmentData.storeName || 'Store Owner')}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${transactionRef}`,
      
      // BHIM format
      `bhim://pay?pa=${recipientUPI}&pn=${encodeURIComponent(appointmentData.storeName || 'Store Owner')}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`
    ];

    console.log('🔗 Trying UPI URLs:', upiUrls);

    // Try each URL scheme
    for (let i = 0; i < upiUrls.length; i++) {
      const url = upiUrls[i];
      try {
        console.log(`📱 Trying UPI URL ${i + 1}:`, url);
        const canOpen = await Linking.canOpenURL(url);
        
        if (canOpen) {
          console.log(`✅ Successfully opening UPI app with URL ${i + 1}`);
          await Linking.openURL(url);
          return true; // Successfully opened
        } else {
          console.log(`❌ Cannot open URL ${i + 1}`);
        }
      } catch (error) {
        console.log(`❌ Error with URL ${i + 1}:`, error.message);
        continue;
      }
    }
    
    return false; // None of the URLs worked
  };

  // Handle UPI Payment
  const handleUPIPayment = async (paymentType, amount) => {
    try {
      console.log('🔍 Fetching store UPI details...');
      
      // Get store ID from appointment data
      const storeId = appointmentData.store?._id || appointmentData.store;
      
      if (!storeId) {
        Alert.alert(
          'Store Not Found',
          'Unable to find store information for payment.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('🏪 Fetching UPI for store ID:', storeId);
      
      // Fetch UPI from backend
      const upiResponse = await axios.get(`${SERVER_URL}/upi/${storeId}/upi`);
      const recipientUPI = upiResponse.data?.upi;
      
      console.log('💳 Store UPI fetched:', recipientUPI);
      
      if (!recipientUPI) {
        Alert.alert(
          'UPI Not Available',
          'Store owner has not set up UPI payments. Please contact them directly.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('💳 Attempting UPI payment...');
      console.log('Recipient UPI:', recipientUPI);
      console.log('Amount:', amount);
      console.log('Payment Type:', paymentType);

      // Try to open UPI apps
      const upiOpened = await tryOpenUPIApps(recipientUPI, amount, appointmentData._id, paymentType);
      
      if (upiOpened) {
        // Show payment verification dialog after opening UPI app
        setTimeout(() => {
          Alert.alert(
            'Payment Verification',
            'Have you completed the payment successfully?',
            [
              { 
                text: 'No, Cancel', 
                style: 'cancel',
                onPress: () => console.log('❌ Payment cancelled by user')
              },
              { 
                text: 'Yes, Paid', 
                onPress: () => handlePaymentVerification(paymentType, amount)
              }
            ]
          );
        }, 3000); // Wait 3 seconds for UPI app to process
        
      } else {
        // Fallback: Show manual payment options
        Alert.alert(
          'Choose Payment Method',
          `UPI ID: ${recipientUPI}\nAmount: ₹${amount}\nAppointment: #${appointmentData._id.slice(-6)}`,
          [
            { 
              text: 'Copy UPI ID', 
              onPress: () => {
                // You might want to use Clipboard.setString() here
                console.log('📋 UPI ID copied:', recipientUPI);
                Alert.alert('Copied!', 'UPI ID copied to clipboard. You can paste it in your UPI app.');
              }
            },
            { 
              text: 'Open PhonePe', 
              onPress: () => {
                Linking.openURL('phonepe://').catch(() => {
                  Alert.alert('PhonePe not installed', 'Please install PhonePe or use another UPI app.');
                });
              }
            },
            { 
              text: 'Manual Payment', 
              onPress: () => {
                Alert.alert(
                  'Manual Payment',
                  `Please open your UPI app and send ₹${amount} to:\n\n${recipientUPI}\n\nReference: Appointment #${appointmentData._id.slice(-6)}`,
                  [{ text: 'OK' }]
                );
              }
            }
          ]
        );
      }

    } catch (error) {
      console.error('❌ Error handling UPI payment:', error);
      Alert.alert(
        'Payment Error',
        'Unable to process UPI payment. Please try again or contact support.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle payment verification after UPI transaction
  const handlePaymentVerification = async (paymentType, amount) => {
    try {
      console.log('✅ User confirmed payment completion');
      console.log('Payment Type:', paymentType);
      console.log('Amount:', amount);

      // Call your payment callback or API to update payment status
      if (onPayment) {
        await onPayment(appointmentData._id, paymentType, amount);
      }
      
      // You might also want to call an API to update payment status
      // const response = await axios.patch(`${SERVER_URL}/appointments/${appointmentData._id}/payment`, {
      //   paymentType,
      //   amount,
      //   paymentMethod: 'UPI',
      //   transactionId: `UPI_${Date.now()}` // You can generate a proper transaction ID
      // });

      Alert.alert(
        'Payment Recorded',
        'Your payment has been recorded. The store owner will verify the transaction.',
        [{ text: 'OK' }]
      );

      // Refresh the appointment data
      if (onRefresh) {
        onRefresh();
      }

    } catch (error) {
      console.error('❌ Error recording payment:', error);
      Alert.alert(
        'Error',
        'Failed to record payment. Please contact support.',
        [{ text: 'OK' }]
      );
    }
  };

  // SIMPLIFIED: Universal status update function
  const updateAppointmentStatus = async (newStatus, actionName) => {
    console.log(`🔄 ${actionName} appointment:`, appointmentData._id, 'to status:', newStatus);
    
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
              console.log(`✅ ${actionName} appointment:`, appointmentData._id);
              
              const response = await axios.patch(
                `${SERVER_URL}/appointments/${appointmentData._id}`,
                { status: newStatus }
              );
              
              console.log(`✅ Appointment ${actionName.toLowerCase()} successfully:`, response.data);
              
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

  // UPDATED: Handle Pay Advance with UPI
  const handlePayAdvance = () => {
    const totalCost = appointmentData.cost || appointmentData.product?.price || 0;
    const amountPaid = appointmentData.amountPaid || 0;
    const remainingAmount = totalCost - amountPaid;
    const advanceAmount = Math.ceil(totalCost * 0.3); // 30% advance or adjust as needed
    
    console.log('💰 Pay button pressed');
    console.log('Total cost:', totalCost);
    console.log('Amount paid:', amountPaid);
    console.log('Remaining amount:', remainingAmount);
    console.log('Advance amount (30%):', advanceAmount);
    
    Alert.alert(
      'Payment Options',
      `Total: ₹${totalCost}\nPaid: ₹${amountPaid}\nRemaining: ₹${remainingAmount}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: `Pay Advance (₹${advanceAmount})`, 
          onPress: () => {
            console.log('💰 Pay Advance selected');
            handleUPIPayment('advance', advanceAmount);
          }
        },
        { 
          text: `Pay Full (₹${remainingAmount})`, 
          onPress: () => {
            console.log('💸 Pay Full selected');
            handleUPIPayment('full', remainingAmount);
          }
        }
      ]
    );
  };

  const handlePayment = () => {
    const remainingAmount = appointmentData.cost - (appointmentData.amountPaid || 0);
    console.log('💳 Payment button pressed. Remaining amount:', remainingAmount);
    Alert.alert(
      'Payment Options',
      `Total: ₹${appointmentData.cost}\nPaid: ₹${appointmentData.amountPaid || 0}\nRemaining: ₹${remainingAmount}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay Advance', 
          onPress: () => {
            console.log('💰 Pay Advance selected');
            const advanceAmount = Math.ceil(appointmentData.cost * 0.3);
            handleUPIPayment('advance', advanceAmount);
          }
        },
        { 
          text: 'Pay Full', 
          onPress: () => {
            console.log('💸 Pay Full selected');
            handleUPIPayment('full', remainingAmount);
          }
        }
      ]
    );
  };

  const renderActionButtons = () => {
    const { status } = appointmentData;
    
    console.log('--- Button Rendering Logic ---');
    console.log('Current status:', status);
    console.log('isUserSender:', isUserSender);
    console.log('isUserReceiver:', isUserReceiver);
    console.log('appointmentData.cost:', appointmentData.cost);
    console.log('appointmentData.amountPaid:', appointmentData.amountPaid);
  
    // If appointment is cancelled, show no buttons
    if (status === 'cancelled') {
      console.log('🚫 No buttons - status is cancelled');
      return null;
    }
  
    // FOR SENDERS (CUSTOMERS)
    if (isUserSender) {
      console.log('👤 User is SENDER (Customer)');
      
      if (status === 'pending') {
        console.log('⏳ Showing CANCEL button for pending sender');
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
        console.log('✅ Showing PAY + CANCEL buttons for confirmed sender');
        const totalCost = appointmentData.cost || appointmentData.product?.price || 0;
        const amountPaid = appointmentData.amountPaid || 0;
        const remainingAmount = totalCost - amountPaid;
        const hasUnpaidAmount = remainingAmount > 0;
        
        console.log('Total cost:', totalCost);
        console.log('Amount paid:', amountPaid);
        console.log('Remaining amount:', remainingAmount);
        console.log('Has unpaid amount:', hasUnpaidAmount);
        
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
  
    // No buttons for other cases
    console.log('🔇 No buttons shown - no conditions met');
    console.log('Final check - isUserSender:', isUserSender, 'isUserReceiver:', isUserReceiver, 'status:', status);
    return null;
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
                {appointmentData.status?.toUpperCase() || 'PENDING'}
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
    </View>
  );
};

const styles = StyleSheet.create({
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    maxWidth: 280,
    minWidth: 260,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 6,
  },
  roleIndicator: {
    fontSize: 11,
    color: '#757575',
    fontStyle: 'italic',
  },
  content: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  column: {
    flex: 1,
    paddingRight: 8,
  },
  label: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '500',
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '400',
  },
  paidAmount: {
    fontSize: 11,
    color: '#4CAF50',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  statusContainer: {
    alignItems: 'center',
    flex: 1,
  },
  statusLabel: {
    fontSize: 10,
    color: '#757575',
    marginBottom: 4,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  contactText: {
    fontSize: 12,
    color: '#333333',
    marginLeft: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
    gap: 4,
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
    fontWeight: '600',
  },
});

export default AppointmentCard;