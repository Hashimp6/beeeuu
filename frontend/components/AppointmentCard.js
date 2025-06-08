import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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

  const handleAccept = async () => {
    console.log('🟢 Accept button pressed for appointment:', appointmentData._id);
    Alert.alert(
      'Accept Appointment',
      'Are you sure you want to accept this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: async () => {
            try {
              console.log('✅ Accepting appointment:', appointmentData._id);
              const appointmentId = appointmentData._id;
              const response = await axios.patch(
                `${SERVER_URL}/appointments/${appointmentId}/approve`
              );
              
              console.log('✅ Appointment accepted successfully:', response.data);
              
              // Update the appointment state immediately
              if (onAppointmentUpdate) {
                onAppointmentUpdate(appointmentData._id, { status: 'confirmed' });
              }
              
              // Force refresh immediately
              if (onRefresh) {
                onRefresh();
              }
              
              // Show success message
              Alert.alert(
                'Success',
                'Appointment has been accepted successfully!',
                [{ text: 'OK' }]
              );
              
            } catch (error) {
              console.error('❌ Error accepting appointment:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to accept appointment. Please try again.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };
  
  const handleCancel = async () => {
    console.log('🔴 Cancel button pressed for appointment:', appointmentData._id);
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('❌ Cancelling appointment:', appointmentData._id);
              const appointmentId = appointmentData._id;
              const response = await axios.patch(
                `${SERVER_URL}/appointments/${appointmentId}/cancel`
              );
              
              console.log('✅ Appointment cancelled successfully:', response.data);
              
              // Update the appointment state immediately
              if (onAppointmentUpdate) {
                onAppointmentUpdate(appointmentData._id, { status: 'cancelled' });
              }
              
              // Force refresh immediately
              if (onRefresh) {
                onRefresh();
              }
              
              // Show success message
              Alert.alert(
                'Success',
                'Appointment has been cancelled successfully!',
                [{ text: 'OK' }]
              );
              
            } catch (error) {
              console.error('❌ Error cancelling appointment:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to cancel appointment. Please try again.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

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
            if (onPayment) {
              onPayment(appointmentData._id, 'advance', advanceAmount);
            }
          }
        },
        { 
          text: `Pay Full (₹${remainingAmount})`, 
          onPress: () => {
            console.log('💸 Pay Full selected');
            if (onPayment) {
              onPayment(appointmentData._id, 'full', remainingAmount);
            }
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
            onPayment?.(appointmentData._id, 'advance');
          }
        },
        { 
          text: 'Pay Full', 
          onPress: () => {
            console.log('💸 Pay Full selected');
            onPayment?.(appointmentData._id, 'full');
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
              onPress={handleCancel}
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
              onPress={handleCancel}
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
            onPress={handleAccept}
          >
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]} 
            onPress={handleCancel}
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
              ₹{appointmentData.cost || 0}
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