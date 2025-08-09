import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  Dimensions,
  SafeAreaView,
  Linking
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SERVER_URL } from '../config';

const { width } = Dimensions.get('window');

const PaymentConfirmationComponent = ({ storeId,type }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(null);

  // Fetch pending payments based on type
  const fetchPendingOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      
      let combinedData = [];
      
      if (type === 'order' ) {
        // Fetch orders
        const ordersRes = await axios.get(`${SERVER_URL}/orders/pending-non-cod/${storeId}`);
      
        const ordersWithType = (ordersRes.data.data || []).map(order => ({
          ...order,
          type: 'order'
        }));
        
        combinedData = [...combinedData, ...ordersWithType];
      }
      
      if (type === 'appointment' ) {
     
        // Fetch appointments
        const appointmentsRes = await axios.get(`${SERVER_URL}/appointments/store/${storeId}/advance-payments`);
       
        const appointmentsWithType = (appointmentsRes.data.data || []).map(appointment => ({
          ...appointment,
          type: 'appointment'
        }));
        
        combinedData = [...combinedData, ...appointmentsWithType];
      }
      
      // Sort by creation date (newest first)
      combinedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setOrders(combinedData);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      Alert.alert('Error', 'Failed to fetch pending payments.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, [storeId, type]); // Added type as dependency

  // Confirm payment based on type
  const handleConfirmPayment = async (item) => {
    const isAppointment = item.type === 'appointment';
    const confirmTitle = isAppointment ? 'Confirm Advance Payment' : 'Confirm Payment';
    const confirmMessage = isAppointment 
      ? 'Are you sure you want to mark this advance payment as confirmed?' 
      : 'Are you sure you want to mark this payment as confirmed?';
    
    Alert.alert(
      confirmTitle,
      confirmMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setConfirmingPayment(item._id);
             
              let apiUrl;
              if (isAppointment) {
                // For appointments, use the advance payments API
                apiUrl = `${SERVER_URL}/appointments/mark-advance/${item._id}`;
              } else {
                // For orders, use the existing orders API
                apiUrl = `${SERVER_URL}/orders/confirm-payment/${item._id}`;
              }
              
              await axios.put(apiUrl);
              
              const successMessage = isAppointment 
                ? 'Advance payment marked as confirmed' 
                : 'Payment marked as completed';
              
              Alert.alert('Success', successMessage);
              fetchPendingOrders();
            } catch (error) {
              console.error('Payment confirmation error:', error.message);
              Alert.alert('Error', 'Failed to confirm payment.');
            } finally {
              setConfirmingPayment(null);
            }
          }
        }
      ]
    );
  };

  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'upi': return 'account-balance-wallet';
      case 'card': return 'credit-card';
      case 'netbanking': return 'account-balance';
      default: return 'payment';
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method.toLowerCase()) {
      case 'upi': return '#4CAF50';
      case 'card': return '#2196F3';
      case 'netbanking': return '#FF9800';
      default: return '#9C27B0';
    }
  };

  // Get type-specific icon and color
  const getTypeIcon = (itemType) => {
    return itemType === 'appointment' ? 'event' : 'shopping-cart';
  };

  const getTypeColor = (itemType) => {
    return itemType === 'appointment' ? '#9C27B0' : '#155366';
  };

  const getTypeName = (itemType) => {
    return itemType === 'appointment' ? 'Appointment' : 'Order';
  };

  // Handle phone call
  const handleCallCustomer = (phoneNumber) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch((error) => {
        console.error('Error making phone call:', error);
        Alert.alert('Error', 'Failed to make phone call');
      });
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' at ' + date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const getTimeAgoColor = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return '#e74c3c'; // Red for very recent
    if (diffInHours < 6) return '#f39c12'; // Orange for recent
    if (diffInHours < 24) return '#3498db'; // Blue for today
    return '#95a5a6'; // Gray for older
  };

  const renderOrderCard = ({ item }) => {
    const isAppointment = item.type === 'appointment';
    const displayName = isAppointment 
      ? (item.serviceName || item.appointmentType || 'Appointment') 
      : item.productName;
    const displayId = isAppointment 
      ? (item.appointmentId || item._id) 
      : item.orderId;
    
    return (
      <View style={styles.orderCard}>
        {/* Header with product/service name and amount */}
        <View style={styles.cardHeader}>
          <View style={styles.headerTop}>
            <View style={styles.productInfo}>
              <View style={styles.typeIndicator}>
                <Icon 
                  name={getTypeIcon(item.type)} 
                  size={16} 
                  color={getTypeColor(item.type)} 
                />
                <Text style={[styles.typeName, { color: getTypeColor(item.type) }]}>
                  {getTypeName(item.type)}
                </Text>
              </View>
              <Text style={styles.productName} numberOfLines={2}>
                {displayName}
              </Text>
              <View style={styles.orderIdContainer}>
                <Text style={styles.orderId}>#{displayId}</Text>
              </View>
            </View>
            <View style={[styles.amountContainer, { backgroundColor: getTypeColor(item.type) }]}>
              <Text style={styles.amount}>₹{item.totalAmount || item.amount}</Text>
              {item.quantity && (
                <Text style={styles.quantity}>Qty: {item.quantity}</Text>
              )}
            </View>
          </View>
          
          {/* Date and Time Info */}
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeRow}>
              <Icon name="schedule" size={16} color={getTimeAgoColor(item.createdAt)} />
              <Text style={[styles.dateTimeText, { color: getTimeAgoColor(item.createdAt) }]}>
                {formatDateTime(item.createdAt)}
              </Text>
            </View>
            <View style={[styles.urgencyBadge, { backgroundColor: getTimeAgoColor(item.createdAt) + '15' }]}>
              <Text style={[styles.urgencyText, { color: getTimeAgoColor(item.createdAt) }]}>
                {new Date(item.createdAt).getTime() > Date.now() - (1000 * 60 * 60) ? 'URGENT' : 
                 new Date(item.createdAt).getTime() > Date.now() - (1000 * 60 * 60 * 6) ? 'HIGH' : 
                 new Date(item.createdAt).getTime() > Date.now() - (1000 * 60 * 60 * 24) ? 'NORMAL' : 'OLD'}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.customerSection}>
          <View style={styles.customerHeader}>
            <Text style={styles.customerSectionTitle}>Customer Details</Text>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCallCustomer(item.phoneNumber)}
            >
              <Icon name="phone" size={18} color="#fff" />
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="person" size={18} color="#666" />
            <Text style={styles.infoText}>{item.customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="phone" size={18} color="#666" />
            <Text style={styles.infoText}>{item.phoneNumber}</Text>
          </View>
          
          {/* Show appointment date/time if it's an appointment */}
          {isAppointment && item.appointmentDate && (
            <View style={styles.infoRow}>
              <Icon name="event" size={18} color="#666" />
              <Text style={styles.infoText}>
                {new Date(item.appointmentDate).toLocaleDateString('en-IN')}
                {item.appointmentTime && ` at ${item.appointmentTime}`}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Information */}
        <View style={styles.paymentSection}>
          <View style={styles.paymentMethodContainer}>
            <View style={[styles.paymentMethodBadge, { backgroundColor: getPaymentMethodColor(item.paymentMethod) + '15' }]}>
              <Icon 
                name={getPaymentMethodIcon(item.paymentMethod)} 
                size={16} 
                color={getPaymentMethodColor(item.paymentMethod)} 
              />
              <Text style={[styles.paymentMethodText, { color: getPaymentMethodColor(item.paymentMethod) }]}>
                {item.paymentMethod.toUpperCase()}
              </Text>
            </View>
          </View>
          
          {item.transactionId && (
            <View style={styles.transactionContainer}>
              <Text style={styles.transactionLabel}>Reference Number:</Text>
              <Text style={styles.transactionId}>{item.transactionId}</Text>
            </View>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            { backgroundColor: getTypeColor(item.type) },
            confirmingPayment === item._id && styles.confirmButtonDisabled
          ]}
          onPress={() => handleConfirmPayment(item)}
          disabled={confirmingPayment === item._id}
        >
          {confirmingPayment === item._id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="check-circle" size={18} color="#fff" />
              <Text style={styles.confirmButtonText}>
                {isAppointment ? 'Confirm Advance Payment' : 'Confirm Payment'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => {
    const getEmptyMessage = () => {
      switch (type) {
        case 'order':
          return 'No pending order payments found.';
        case 'appointment':
          return 'No pending appointment payments found.';
        default:
          return 'All payments have been confirmed or no pending orders/appointments found.';
      }
    };

    return (
      <View style={styles.emptyContainer}>
        <Icon name="payment" size={80} color="#ddd" />
        <Text style={styles.emptyTitle}>No Pending Payments</Text>
        <Text style={styles.emptySubtitle}>
          {getEmptyMessage()}
        </Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => fetchPendingOrders(true)}
        >
          <Icon name="refresh" size={20} color="#155366" />
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => {
    const orderCount = orders.filter(item => item.type === 'order').length;
    const appointmentCount = orders.filter(item => item.type === 'appointment').length;
    
    const getHeaderTitle = () => {
      switch (type) {
        case 'order':
          return 'Order Payment Confirmations';
        case 'appointment':
          return 'Appointment Payment Confirmations';
        default:
          return 'Payment Confirmations';
      }
    };

    const getHeaderSubtitle = () => {
      switch (type) {
        case 'order':
          return `${orderCount} pending order payment${orderCount !== 1 ? 's' : ''}`;
        case 'appointment':
          return `${appointmentCount} pending appointment payment${appointmentCount !== 1 ? 's' : ''}`;
        default:
          return `${orderCount} pending order payment${orderCount !== 1 ? 's' : ''}${appointmentCount > 0 ? `, ${appointmentCount} pending appointment payment${appointmentCount !== 1 ? 's' : ''}` : ''}`;
      }
    };
    
    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        <Text style={styles.headerSubtitle}>
          {getHeaderSubtitle()}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#155366" />
        <Text style={styles.loadingText}>Loading payments...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => `${item.type}-${item._id}`}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchPendingOrders(true)}
            colors={['#155366']}
            tintColor="#155366"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeName: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderIdContainer: {
    alignSelf: 'flex-start',
  },
  orderId: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontFamily: 'monospace',
  },
  amountContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  quantity: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.8,
    marginTop: 2,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  customerSection: {
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  paymentSection: {
    marginBottom: 20,
  },
  paymentMethodContainer: {
    marginBottom: 12,
  },
  paymentMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paymentMethodText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  transactionContainer: {
    backgroundColor: '#f1f3f5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#155366',
  },
  transactionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'monospace',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonDisabled: {
    backgroundColor: '#a8a8a8',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#155366',
  },
  refreshButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#155366',
  },
});

export default PaymentConfirmationComponent;