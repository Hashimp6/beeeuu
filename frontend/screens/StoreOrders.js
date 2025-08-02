import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Linking,
  TextInput ,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { SERVER_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const StoreOrders = ({ route, navigation }) => {
  const { status, storeId } = route.params;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [otpInputs, setOtpInputs] = useState({});
  const { user, token } = useAuth() || {};

  const validateRequiredData = () => {
    if (!storeId || !status || !token) {
      setError('Missing required data');
      return false;
    }
    return true;
  };

  const fetchOrders = async () => {
    if (!validateRequiredData()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiUrl = `${SERVER_URL}/orders/store/${storeId}/status`;
      const params = { status };
      
      console.log('Fetching orders for status:', status, 'storeId:', storeId);

      const response = await axios.get(apiUrl, {
        params,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 10000
      });
      
      if (response.status === 200) {
        console.log('Orders response:', response.data);
        
        const ordersData = response.data.orders || [];
        setOrders(ordersData);
        console.log(`Fetched ${ordersData.length} orders`);
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);

      if (error.response) {
        if (error.response.status === 404) {
          setOrders([]);
          setError(null);
        } else if (error.response.status === 401) {
          setError('Authentication failed. Please login again.');
        } else if (error.response.status === 403) {
          setError('You do not have permission to view these orders.');
        } else if (error.response.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Error: ${error.response.data?.message || 'Failed to fetch orders'}`);
        }
      } else if (error.request) {
        setError('Network error. Please check your internet connection.');
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);

      const response = await axios.patch(
        `${SERVER_URL}/orders/status/${orderId}`,
        { status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          timeout: 10000
        }
      );

      if (response.status === 200) {
        setOrders(prev => prev.filter(order => order._id !== orderId));
        
        Alert.alert(
          'Success',
          `Order ${newStatus === 'confirmed' ? 'confirmed' : newStatus === 'shipped' ? 'shipped' : newStatus === 'delivered' ? 'delivered' : 'cancelled'} successfully`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update order',
        [{ text: 'OK' }]
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handlePhoneCall = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert('No Phone Number', 'Phone number not available for this customer');
      return;
    }

    const phoneUrl = `tel:${phoneNumber}`;
    
    Alert.alert(
      'Make Call',
      `Call ${phoneNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            Linking.openURL(phoneUrl).catch(err => {
              Alert.alert('Error', 'Unable to make phone call');
              console.error('Error making phone call:', err);
            });
          }
        }
      ]
    );
  };

  const handleConfirmOrder = (orderId) => {
    Alert.alert(
      'Confirm Order',
      'Are you sure you want to confirm this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => updateOrderStatus(orderId, 'processing')
        }
      ]
    );
  };

  const handleShipOrder = (orderId) => {
    Alert.alert(
      'Ship Order',
      'Mark this order as shipped?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Ship', 
          onPress: () => updateOrderStatus(orderId, 'shipped')
        }
      ]
    );
  };

  const handleVerifyOtpAndDeliver = async (orderId, enteredOtp) => {
    if (!enteredOtp || enteredOtp.length !== 4) {
      Alert.alert('Error', 'Please enter a valid 4-digit OTP');
      return;
    }
  
    // Find the order to get the stored OTP
    const order = orders.find(o => o._id === orderId);
    if (!order || !order.otp) {
      Alert.alert('Error', 'Order OTP not found');
      return;
    }
  
    if (enteredOtp !== order.otp) {
      Alert.alert('Error', 'Invalid OTP. Please check and try again.');
      return;
    }
  
    Alert.alert(
      'Mark as Delivered',
      'OTP verified! Mark this order as delivered?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delivered', 
          onPress: () => updateOrderStatus(orderId, 'delivered')
        }
      ]
    );
  };
  const handleDeliverOrder = (orderId) => {
    Alert.alert(
      'Mark as Delivered',
      'Mark this order as delivered?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delivered', 
          onPress: () => updateOrderStatus(orderId, 'delivered')
        }
      ]
    );
  };

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => updateOrderStatus(orderId, 'cancelled')
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return { dateStr: 'No date', timeStr: '', isToday: false, isTomorrow: false };
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    if (date.toDateString() === today.toDateString()) {
      return { dateStr: 'Today', timeStr, isToday: true, isTomorrow: false };
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return { dateStr: 'Tomorrow', timeStr, isToday: false, isTomorrow: true };
    }

    return { dateStr, timeStr, isToday: false, isTomorrow: false };
  };

  const formatPrice = (price) => {
    if (!price) return null;
    
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numPrice)) return null;
    
    return numPrice.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FF9500';
      case 'confirmed': return '#34C759';
      case 'shipped': return '#007AFF';
      case 'delivered': return '#32D74B';
      case 'cancelled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'schedule';
      case 'confirmed': return 'check-circle';
      case 'shipped': return 'local-shipping';
      case 'delivered': return 'done-all';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [status, storeId]);

  const renderOrderCard = ({ item }) => {
    const dateTime = formatDate(item.orderDate);
    const isUpdating = updatingOrder === item._id;
    const formattedPrice = formatPrice(item.totalAmount);
    const phoneNumber = item.phoneNumber;
    const productImage = item.productId?.image;
    const productName = item.productId?.name || item.productName;
    const customerName = item.customerName;
    const customerEmail = item.buyerId?.email;
    const deliveryAddress = item.deliveryAddress;

    return (
      <View style={styles.orderCard}>
        {/* Order ID Header */}
        <View style={styles.orderIdHeader}>
          <Text style={styles.orderId}>#{item.orderId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Icon 
              name={getStatusIcon(item.status)} 
              size={14} 
              color={getStatusColor(item.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
            </Text>
          </View>
        </View>

        {/* Date/Time and Price Header */}
        <View style={styles.cardHeader}>
          <View style={styles.dateTimeContainer}>
            <Text style={[
              styles.dateText,
              dateTime.isToday && styles.todayText,
              dateTime.isTomorrow && styles.tomorrowText
            ]}>
              {dateTime.dateStr}
            </Text>
            <Text style={styles.timeText}>{dateTime.timeStr}</Text>
          </View>
          
          <View style={styles.headerActions}>
            {formattedPrice && (
              <View style={styles.priceChip}>
                <Text style={styles.priceText}>{formattedPrice}</Text>
              </View>
            )}
            {phoneNumber && (
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handlePhoneCall(phoneNumber)}
              >
                <Icon name="phone" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Product Section */}
        <View style={styles.productSection}>
  {item.products?.map((prod, index) => {
    const productName = prod.productId?.name || 'Product';
    const productImage = prod.productId?.image;
    const quantity = prod.quantity;
    const unitPrice = formatPrice(prod.unitPrice);

    return (
      <View key={index} style={styles.productHeader}>
        {productImage && (
          <Image 
            source={{ uri: productImage }} 
            style={styles.productImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{productName}</Text>
          <View style={styles.priceQuantityRow}>
            <Text style={styles.unitPrice}>{unitPrice}</Text>
            <Text style={styles.quantityText}>× {quantity}</Text>
          </View>
        </View>
      </View>
    );
  })}
</View>


        {/* Customer Information Section */}
        <View style={styles.customerSection}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          
          <View style={styles.customerRow}>
            <View style={styles.customerInfo}>
              <Icon name="person" size={18} color="#155366" />
              <Text style={styles.customerName}>{customerName}</Text>
            </View>
            {phoneNumber && (
              <TouchableOpacity onPress={() => handlePhoneCall(phoneNumber)}>
                <Text style={styles.phoneNumber}>{phoneNumber}</Text>
              </TouchableOpacity>
            )}
          </View>

          {customerEmail && (
            <View style={styles.emailRow}>
              <Icon name="email" size={16} color="#666" />
              <Text style={styles.emailText}>{customerEmail}</Text>
            </View>
          )}

          {deliveryAddress && (
            <View style={styles.addressRow}>
              <Icon name="location-on" size={16} color="#666" />
              <Text style={styles.addressText}>{deliveryAddress}</Text>
            </View>
          )}
        </View>
        {status === 'shipped' && (
  <View style={{ marginTop: 10 }}>
    <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>
      Enter Delivery OTP:
    </Text>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{
        flex: 1,
        backgroundColor: '#F1F1F1',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 10,
      }}>
        <TextInput
          placeholder="Enter 4-digit OTP"
          keyboardType="numeric"
          maxLength={4}
          value={otpInputs[item._id] || ''}
          onChangeText={(text) => setOtpInputs(prev => ({ ...prev, [item._id]: text }))}
          style={{ fontSize: 16 }}
        />
      </View>
      <TouchableOpacity
        style={[styles.actionButton, styles.deliverButton]}
        onPress={() => handleVerifyOtpAndDeliver(item._id, otpInputs[item._id])}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Icon name="done-all" size={16} color="#FFFFFF" />
            <Text style={styles.deliverButtonText}>Submit</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  </View>
)}

        {/* Action Buttons based on Status */}
        {status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelOrder(item._id)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <>
                  <Icon name="close" size={16} color="#FF3B30" />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => handleConfirmOrder(item._id)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.confirmButtonText}>Accept</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {status === 'confirmed' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelOrder(item._id)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <>
                  <Icon name="close" size={16} color="#FF3B30" />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.shipButton]}
              onPress={() => handleShipOrder(item._id)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="local-shipping" size={16} color="#FFFFFF" />
                  <Text style={styles.shipButtonText}>Ship</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

{status === 'processing' && (
  <View style={{ marginTop: 10 }}>
    <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>
      Enter Delivery OTP:
    </Text>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{
        flex: 1,
        backgroundColor: '#F1F1F1',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        marginRight: 10,
      }}>
        <TextInput
          placeholder="Enter 4-digit OTP"
          keyboardType="numeric"
          maxLength={4}
          value={otpInputs[item._id] || ''}
          onChangeText={(text) => setOtpInputs(prev => ({ ...prev, [item._id]: text }))}
          style={{ fontSize: 16 }}
        />
      </View>
      <TouchableOpacity
        style={[styles.actionButton, styles.deliverButton]}
        onPress={() => handleVerifyOtpAndDeliver(item._id, otpInputs[item._id])}
        disabled={isUpdating || (otpInputs[item._id]?.length !== 4)}
      >
        {isUpdating ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Icon name="done-all" size={16} color="#FFFFFF" />
            <Text style={styles.deliverButtonText}>Verify & Deliver</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  </View>
)}

{/* Remove the old action buttons section for processing status */}
      </View>
    );
  };

  const getTitle = () => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Pending Orders';
      case 'confirmed': return 'Confirmed Orders';
      case 'shipped': return 'Shipped Orders';
      case 'delivered': return 'Delivered Orders';
      case 'cancelled': return 'Cancelled Orders';
      default: return 'Orders';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#155366" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#155366" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <TouchableOpacity onPress={fetchOrders}>
          <Icon name="refresh" size={24} color="#155366" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.emptyContainer}
        >
          <Icon name="shopping-cart" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No {status} orders found</Text>
          <Text style={styles.emptySubText}>Pull down to refresh</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#155366',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginVertical: 10,
  },
  retryButton: {
    backgroundColor: '#155366',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  listContainer: {
    padding: 12,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  orderIdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155366',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateTimeContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  todayText: {
    color: '#FF9500',
  },
  tomorrowText: {
    color: '#34C759',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#155366',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceChip: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  callButton: {
    backgroundColor: '#155366',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  productSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  priceQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  unitPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#155366',
    marginRight: 8,
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  customerSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#155366',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#155366',
    marginBottom: 8,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#155366',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  confirmButton: {
    backgroundColor: '#155366',
  },
  shipButton: {
    backgroundColor: '#007AFF',
  },
  deliverButton: {
    backgroundColor: '#000000',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  shipButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  deliverButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
});

export default StoreOrders;