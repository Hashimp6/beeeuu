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

const PaymentConfirmationComponent = ({ storeId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(null);

  // Fetch pending non-COD orders
  const fetchPendingOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await axios.get(`${SERVER_URL}/orders/pending-non-cod/${storeId}`);
      console.log("Orders data:", res.data.data);
      setOrders(res.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error.message);
      Alert.alert('Error', 'Failed to fetch orders.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, [storeId]);

  // Confirm payment
  const handleConfirmPayment = async (orderId) => {
    Alert.alert(
      'Confirm Payment',
      'Are you sure you want to mark this payment as confirmed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setConfirmingPayment(orderId);
              console.log("orderId",orderId);
              
              await axios.put(`${SERVER_URL}/orders/confirm-payment/${orderId}`);
              Alert.alert('Success', 'Payment marked as completed');
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

  const renderOrderCard = ({ item }) => (
    <View style={styles.orderCard}>
      {/* Header with product name and amount */}
      <View style={styles.cardHeader}>
        <View style={styles.headerTop}>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.productName}
            </Text>
            <View style={styles.orderIdContainer}>
              <Text style={styles.orderId}>#{item.orderId}</Text>
            </View>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>₹{item.totalAmount}</Text>
            <Text style={styles.quantity}>Qty: {item.quantity}</Text>
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
          confirmingPayment === item._id && styles.confirmButtonDisabled
        ]}
        onPress={() => handleConfirmPayment(item._id)}
        disabled={confirmingPayment === item._id}
      >
        {confirmingPayment === item._id ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Icon name="check-circle" size={18} color="#fff" />
            <Text style={styles.confirmButtonText}>Confirm Payment</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="payment" size={80} color="#ddd" />
      <Text style={styles.emptyTitle}>No Pending Payments</Text>
      <Text style={styles.emptySubtitle}>
        All payments have been confirmed or no non-COD orders found.
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

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Payment Confirmations</Text>
      <Text style={styles.headerSubtitle}>
        {orders.length} pending payment{orders.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );

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
        keyExtractor={(item) => item._id}
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
    backgroundColor: '#155366',
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
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#28a745',
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