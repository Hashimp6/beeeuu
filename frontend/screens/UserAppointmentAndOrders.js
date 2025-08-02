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
  Image,
  TextInput,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { SERVER_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

const UserAppointmentsOrders = ({ route, navigation }) => {
  const { user, status } = route.params;
  const [activeTab, setActiveTab] = useState(status === 'appointment' ? 'appointments' : 'orders');
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Rating and feedback states
  const [expandedCards, setExpandedCards] = useState({});
  const [ratings, setRatings] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [submittingFeedback, setSubmittingFeedback] = useState({});

  const { token } = useAuth() || {};

  const validateRequiredData = () => {
    if (!user?._id || !token || !status) {
      setError('Missing required data');
      return false;
    }
    return true;
  };

  const fetchAppointments = async () => {
    if (!validateRequiredData()) return;

    try {
      console.log('Fetching appointments for user:', user._id);

      const response = await axios.get(
        `${SERVER_URL}/appointments/user/${user._id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          timeout: 10000
        }
      );

      if (response.status === 200) {
        const appointmentsData = response.data.appointments || [];
        setAppointments(appointmentsData);
        console.log(`Fetched ${appointmentsData.length} appointments`);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      if (error.response?.status === 404) {
        setAppointments([]);
      } else {
        handleApiError(error, 'appointments');
      }
    }
  };

  const fetchOrders = async () => {
    if (!validateRequiredData()) return;

    try {
      console.log('Fetching orders for user:', user._id);

      const response = await axios.get(
        `${SERVER_URL}/orders/store/${user._id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          timeout: 10000
        }
      );

      if (response.status === 200) {
        const ordersData = response.data.orders || [];
        setOrders(ordersData);
        console.log(`Fetched ${ordersData.length} orders`);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 404) {
        setOrders([]);
      } else {
        handleApiError(error, 'orders');
      }
    }
  };

  const handleApiError = (error, type) => {
    if (error.response) {
      if (error.response.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response.status === 403) {
        setError(`You do not have permission to view these ${type}.`);
      } else if (error.response.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(`Error: ${error.response.data?.message || `Failed to fetch ${type}`}`);
      }
    } else if (error.request) {
      setError('Network error. Please check your internet connection.');
    } else if (error.code === 'ECONNABORTED') {
      setError('Request timeout. Please try again.');
    } else {
      setError('An unexpected error occurred.');
    }
  };

  const fetchData = async () => {
    if (!validateRequiredData()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Only fetch the data for the initial status
      if (status === 'appointment') {
        await fetchAppointments();
        setActiveTab('appointments');
      } else {
        await fetchOrders();
        setActiveTab('orders');
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
    } finally {
      setLoading(false);
    }
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
    switch (status) {
      case 'pending': return '#FF9500';
      case 'confirmed': return '#34C759';
      case 'completed': return '#007AFF';
      case 'cancelled': return '#FF3B30';
      case 'not_attended': return '#FF6B35';
      case 'processing': return '#FF9500';
      case 'shipped': return '#007AFF';
      case 'delivered': return '#34C759';
      case 'returned': return '#FF3B30';
      case 'refunded': return '#8E44AD';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'schedule';
      case 'confirmed': return 'check-circle';
      case 'completed': return 'done-all';
      case 'cancelled': return 'cancel';
      case 'not_attended': return 'person-off';
      case 'processing': return 'hourglass-empty';
      case 'shipped': return 'local-shipping';
      case 'delivered': return 'check-circle';
      case 'returned': return 'keyboard-return';
      case 'refunded': return 'account-balance-wallet';
      default: return 'help';
    }
  };

  // Rating and feedback functions
  const toggleRatingSection = (itemId) => {
    setExpandedCards(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const setRating = (itemId, rating) => {
    setRatings(prev => ({
      ...prev,
      [itemId]: rating
    }));
  };

  const setFeedback = (itemId, feedback) => {
    setFeedbacks(prev => ({
      ...prev,
      [itemId]: feedback
    }));
  };

  const markAsDelivered = async (orderId) => {
    try {
      const payload = {
        status: 'delivered', // or whatever status you want
      };
  
      const response = await axios.patch(`${SERVER_URL}/orders/status/${orderId}`, payload);
  
      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: '✅ Delivered',
          text2: 'Order marked as delivered',
          position: 'bottom', // or 'top'
          visibilityTime: 3000,
        });
         fetchOrders();
      } else {
        Toast.show({
          type: 'error',
          text1: '❌ Failed',
          text2: 'Could not update order status',
        }); }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: '❌ Error',
        text2: 'Something went wrong',
      }); }
  };

  
  const submitRatingFeedback = async (item) => {
    const itemId = item._id;
    const rating = ratings[itemId];
    const feedback = feedbacks[itemId];
  
    if (!rating) {
      Alert.alert('Rating Required', 'Please provide a rating before submitting.');
      return;
    }
  
    try {
      setSubmittingFeedback(prev => ({ ...prev, [itemId]: true }));
  
      // Use the correct endpoint: /rating/add
      const endpoint = `${SERVER_URL}/rating/add`;
  
      const requestBody = {
        userId: user._id,
        store: item.store?._id || item.storeId||item.sellerId._id, // Make sure to get the store ID
        type: status, // 'appointment' or 'order'
        rating: rating,
        feedback: feedback || ''
      };
  
      // Add the specific ID based on type
      if (status === 'appointment') {
        requestBody.appointment = itemId;
      } else {
        requestBody.order = itemId;
      }
  console.log("reqbody",requestBody);
  
      const response = await axios.post(
        endpoint,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 201) { // Note: Your controller returns 201, not 200
        Alert.alert('Success', 'Thank you for your feedback!');
        
        // Update the item to show it has been rated
        if (status === 'appointment') {
          setAppointments(prev => prev.map(apt => 
            apt._id === itemId 
              ? { ...apt, rating: rating, feedback: feedback, hasRated: true }
              : apt
          ));
        } else {
          setOrders(prev => prev.map(order => 
            order._id === itemId 
              ? { ...order, rating: rating, feedback: feedback, hasRated: true }
              : order
          ));
        }
  
        // Collapse the rating section
        setExpandedCards(prev => ({ ...prev, [itemId]: false }));
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      let errorMessage = 'Failed to submit rating. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmittingFeedback(prev => ({ ...prev, [itemId]: false }));
    }
  };

  
  const renderStars = (itemId, currentRating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(itemId, star)}
            style={styles.starButton}
          >
            <Icon
              name={star <= currentRating ? 'star' : 'star-border'}
              size={32}
              color={star <= currentRating ? '#FFD700' : '#DDD'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderRatingFeedbackSection = (item) => {
    const itemId = item._id;
    const isExpanded = expandedCards[itemId];
    const currentRating = ratings[itemId] || item.rating || 0;
    const currentFeedback = feedbacks[itemId] || item.feedback || '';
    const isSubmitting = submittingFeedback[itemId];
    const hasAlreadyRated = item.hasRated || item.rating;

    if (item.status !== 'completed' && item.status !== 'delivered') {
      return null;
    }
    return (
      <View style={styles.ratingSection}>
        {hasAlreadyRated ? (
          <View style={styles.alreadyRatedContainer}>
            <View style={styles.ratedStarsContainer}>
              <Text style={styles.ratedLabel}>Your Rating:</Text>
              <View style={styles.displayStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name="star"
                    size={20}
                    color={star <= (item.rating || currentRating) ? '#FFD700' : '#DDD'}
                  />
                ))}
              </View>
            </View>
            {(item.feedback || currentFeedback) && (
              <Text style={styles.ratedFeedback}>"{item.feedback || currentFeedback}"</Text>
            )}
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.ratingToggle}
              onPress={() => toggleRatingSection(itemId)}
            >
              <Icon name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingToggleText}>
                {isExpanded ? 'Hide Rating' : 'Rate & Review'}
              </Text>
              <Icon 
                name={isExpanded ? 'expand-less' : 'expand-more'} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.ratingForm}>
                <Text style={styles.ratingLabel}>How was your experience?</Text>
                {renderStars(itemId, currentRating)}
                
                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Share your feedback (optional)"
                  value={currentFeedback}
                  onChangeText={(text) => setFeedback(itemId, text)}
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                />
                
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!currentRating || isSubmitting) && styles.submitButtonDisabled
                  ]}
                  onPress={() => submitRatingFeedback(item)}
                  disabled={!currentRating || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Icon name="send" size={16} color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Submit Review</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'appointments') {
      await fetchAppointments();
    } else {
      await fetchOrders();
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderAppointmentCard = ({ item }) => {
    const dateTime = formatDate(item.date);
    const formattedPrice = formatPrice(item.product?.price || item.price); // Use product price first, then fallback to item price
    const phoneNumber = item.contactNo || item.user?.contactNo || item.phone;
    const shopName = item.store?.name || item.store?.storeName || item.store?.businessName || 'Shop';
    const productImage = item.product?.image; // Get product image
    const productName = item.productName || item.product?.name || 'Service'; // Get product name
  
    return (
      <View style={styles.card}>
        {/* Header with Date/Time and Price */}
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
          </View>
        </View>
  
        {/* Status Badge - More Prominent */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Icon 
            name={getStatusIcon(item.status)} 
            size={16} 
            color="#FFFFFF" 
          />
          <Text style={styles.statusBadgeText}>
            {item.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
  
        {/* Product Info with Image - NEW SECTION */}
        <View style={styles.productSection}>
          {productImage && (
            <Image 
              source={{ uri: productImage }} 
              style={styles.productImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={2}>
              {productName}
            </Text>
            {formattedPrice && (
              <Text style={styles.appointmentPriceText}>{formattedPrice}</Text>
            )}
          </View>
        </View>
  
        {/* Service Info */}
        <View style={styles.infoSection}>
          {/* Shop Name */}
          <View style={styles.shopRow}>
            <Icon name="store" size={16} color="#666" />
            <Text style={styles.shopText}>{shopName}</Text>
          </View>
  
          {(item.locationName || item.store?.location || item.location) && (
            <View style={styles.locationRow}>
              <Icon name="place" size={16} color="#666" />
              <Text style={styles.locationText}>
                {item.locationName || item.store?.location || item.location}
              </Text>
            </View>
          )}
  
          {/* {item.address && (
            <View style={styles.locationRow}>
              <Icon name="home" size={16} color="#666" />
              <Text style={styles.locationText}>
                {item.address}
              </Text>
            </View>
          )}
  
          {item.contactNo && (
            <View style={styles.serviceRow}>
              <Icon name="phone" size={16} color="#666" />
              <Text style={styles.serviceText}>{item.contactNo}</Text>
            </View>
          )}
   */}
          {item.notes && (
            <View style={styles.notesRow}>
              <Icon name="note" size={16} color="#666" />
              <Text style={styles.notesText} numberOfLines={2}>
                {item.notes}
              </Text>
            </View>
          )}
        </View>
  
        {/* Rating and Feedback Section */}
        {renderRatingFeedbackSection(item)}
      </View>
    );
  };

  const renderOrderCard = ({ item }) => {
    const dateTime = formatDate(item.createdAt || item.orderDate);
    const formattedPrice = formatPrice(item.totalAmount);
    const storeName = item.sellerName || item.seller?.name || item.store?.name || 'Store';
    const location = item.location || 'location';
  
    return (
      <View style={styles.card}>
        {/* Header with Order ID and Price */}
        <View style={styles.cardHeader}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.orderIdText}> Order #{item.orderId || item._id?.slice(-6)}</Text>
            <Text style={[
              styles.dateText,
              dateTime.isToday && styles.todayText,
              dateTime.isTomorrow && styles.tomorrowText
            ]}>
              {dateTime.dateStr} {dateTime.timeStr}
            </Text>
          </View>
  
          <View style={styles.headerActions}>
            {formattedPrice && (
              <View style={styles.priceChip}>
                <Text style={styles.priceText}>{formattedPrice}</Text>
              </View>
            )}
          </View>
        </View>
  
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Icon name={getStatusIcon(item.status)} size={16} color="#FFFFFF" />
          <Text style={styles.statusBadgeText}>
            {item.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
       

  
        {/* Loop over all products */}
        {item.products?.map((product, index) => {
          const productImage = product.productId?.image; // If populated via ref
          const productName = product.productName;
          const unitPrice = formatPrice(product.unitPrice);
          const totalPrice = formatPrice(product.totalPrice);
          const quantity = product.quantity;
  
          return (
            <View key={index} style={styles.productSection}>
              {productImage && (
                <Image
                  source={{ uri: productImage }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={2}>
                  {productName}
                </Text>
                <View style={styles.quantityPriceRow}>
                  <Text style={styles.quantityText}>Qty: {quantity}</Text>
                  {unitPrice && (
                    <Text style={styles.unitPriceText}>{unitPrice} each</Text>
                  )}
                </View>
                {totalPrice && (
                  <Text style={styles.totalPriceText}>Total: {totalPrice}</Text>
                )}
              </View>
            </View>
          );
        })}
  
        {/* Order Details */}
        <View style={styles.infoSection}>
          {/* Store Name */}
          <View style={styles.shopRow}>
            <Icon name="store" size={16} color="#666" />
            <Text style={styles.shopText}>{storeName}</Text>
          </View>
  
          {item.orderType && (
  <View style={styles.locationRow}>
    <Icon name="restaurant-menu" size={16} color="#666" />
    <Text style={styles.locationText}>
      {item.orderType}
    </Text>
  </View>
)}


          {/* Delivery Address */}
          {item.deliveryAddress && (
            <View style={styles.locationRow}>
              <Icon name="location-on" size={16} color="#666" />
              <Text style={styles.locationText} numberOfLines={2}>
                {item.deliveryAddress}
              </Text>
            </View>
          )}
  
          {/* Phone Number */}
          {item.phoneNumber && (
            <View style={styles.serviceRow}>
              <Icon name="phone" size={16} color="#666" />
              <Text style={styles.serviceText}>{item.phoneNumber}</Text>
            </View>
          )}
  
          {/* Payment Method */}
          {item.paymentMethod && (
            <View style={styles.paymentRow}>
              <Icon name="payment" size={16} color="#666" />
              <Text style={styles.paymentText}>
                Payment: {item.paymentMethod.toUpperCase()}
              </Text>
            </View>
          )}
  
          {/* Transaction ID */}
          {item.transactionId && (
            <View style={styles.notesRow}>
              <Icon name="receipt" size={16} color="#666" />
              <Text style={styles.notesText}>
                Transaction ID: {item.transactionId}
              </Text>
            </View>
          )}
        </View>
        {(item.status === 'pending' || item.status === 'processing') && (
  <TouchableOpacity
    style={styles.statusButton}
    onPress={() =>
      Alert.alert(
        'Confirm Delivery',
        'Are you sure you want to mark this order as delivered?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Deliver',
            onPress: () => markAsDelivered(item._id),
            style: 'default',
          },
        ]
      )
    }
  >
     <Icon name="check-circle" size={20} color="#fff" />
    <Text style={styles.statusButtonText}>Mark as Delivered</Text>
  </TouchableOpacity>
)}

        {/* Rating and Feedback Section */}
        {renderRatingFeedbackSection(item)}
      </View>
    );
  };
  

  // Function to get the current data based on active tab and status
  const getCurrentData = () => {
    if (status === 'appointment') {
      return activeTab === 'appointments' ? appointments : [];
    } else {
      return activeTab === 'orders' ? orders : [];
    }
  };

  // Function to check if tab should be visible
  const shouldShowTab = (tabType) => {
    return status === 'appointment' ? tabType === 'appointments' : tabType === 'orders';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#155366" />
        <Text style={styles.loadingText}>Loading user data...</Text>
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
        {/* <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{user.name || 'User'}</Text>
          <Text style={styles.headerSubtitle}>{user.phone || user.contactNo}</Text>
        </View> */}
        <TouchableOpacity onPress={onRefresh}>
          <Icon name="refresh" size={24} color="#155366" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector - Only show relevant tab */}
      <View style={styles.tabContainer}>
        {shouldShowTab('appointments') && (
          <TouchableOpacity
            style={[styles.tab, styles.activeTab]}
            disabled={true}
          >
            <Icon name="event" size={20} color="#FFFFFF" />
            <Text style={[styles.tabText, styles.activeTabText]}>
              Appointments ({appointments.length})
            </Text>
          </TouchableOpacity>
        )}

        {shouldShowTab('orders') && (
          <TouchableOpacity
            style={[styles.tab, styles.activeTab]}
            disabled={true}
          >
            <Icon name="shopping-bag" size={20} color="#FFFFFF" />
            <Text style={[styles.tabText, styles.activeTabText]}>
              Orders ({orders.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={getCurrentData()}
          renderItem={status === 'appointment' ? renderAppointmentCard : renderOrderCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={getCurrentData().length === 0 ? styles.emptyContainer : styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyStateContainer}>
              <Icon 
                name={status === 'appointment' ? 'event-busy' : 'shopping-bag'} 
                size={64} 
                color="#CCC" 
              />
              <Text style={styles.emptyText}>
                No {status === 'appointment' ? 'appointments' : 'orders'} found for this user
              </Text>
              <Text style={styles.emptySubText}>Pull down to refresh</Text>
            </View>
          )}
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#155366',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAED',
  },
  appointmentPriceText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#F5F5F5',
  },
  activeTab: {
    backgroundColor: '#155366',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#FFFFFF',
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
  },
  emptyStateContainer: {
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flex: 1,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155366',
    marginBottom: 4,
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
    fontSize: 20,
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
    fontSize: 12,
    fontWeight: '600',
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
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  infoSection: {
    marginTop: 4,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
    flex: 1,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  shopText: {
    fontSize: 14,
    color: '#155366',
    marginLeft: 8,
    fontWeight: '600',
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  productSection: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E8EAED',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  quantityPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  unitPriceText: {
    fontSize: 12,
    color: '#666',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  // Rating and Feedback Styles
  ratingSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8EAED',
  },
  ratingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  ratingToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#155366',
    marginLeft: 8,
    flex: 1,
  },
  ratingForm: {
    paddingTop: 16,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    paddingHorizontal: 4,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#E8EAED',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    marginBottom: 16,
    minHeight: 80,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#155366',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  alreadyRatedContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  ratedStarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ratedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#155366',
    marginRight: 8,
  },
  displayStars: {
    flexDirection: 'row',
  },
  ratedFeedback: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
});
export default UserAppointmentsOrders