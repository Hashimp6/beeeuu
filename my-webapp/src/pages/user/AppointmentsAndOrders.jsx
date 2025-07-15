import React, { useState, useEffect } from 'react';
import { Calendar, ShoppingBag, Star, Phone, MapPin, Store, Clock, Package, CreditCard, Truck, ArrowLeft, RefreshCw, Send, ChevronDown, ChevronUp, User, Home, FileText } from 'lucide-react';
import { useAuth } from '../../context/UserContext';
import { SERVER_URL } from '../../Config';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const UserAppointmentsOrders = ({ type,setHistory }) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  // Default user data if not provided
  const [userData] = useState(user);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Rating and feedback states
  const [expandedCards, setExpandedCards] = useState({});
  const [ratings, setRatings] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [submittingFeedback, setSubmittingFeedback] = useState({});

  // Default values if not provided via props
  const authToken = token || 'your-auth-token-here';

  const validateRequiredData = () => {
    if (!userData?._id || !authToken) {
      setError('Missing required data');
      return false;
    }
    return true;
  };

  const fetchData = async () => {
    if (!validateRequiredData()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching ${type} for user:`, userData._id);

      const endpoint = type === 'appointments' 
        ? `${SERVER_URL}/appointments/user/${userData._id}`
        : `${SERVER_URL}/orders/store/${userData._id}`;

      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        const items = responseData[type] || [];
        setData(items);
        console.log(`Fetched ${items.length} ${type}`);
      } else if (response.status === 404) {
        setData([]);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      handleApiError(error, type);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error, dataType) => {
    if (error.message.includes('401')) {
      setError('Authentication failed. Please login again.');
    } else if (error.message.includes('403')) {
      setError(`You do not have permission to view these ${dataType}.`);
    } else if (error.message.includes('5')) {
      setError('Server error. Please try again later.');
    } else {
      setError(`Error: Failed to fetch ${dataType}`);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
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
      case 'pending': return Clock;
      case 'confirmed': return Calendar;
      case 'completed': return Calendar;
      case 'cancelled': return Calendar;
      case 'not_attended': return User;
      case 'processing': return Package;
      case 'shipped': return Truck;
      case 'delivered': return Package;
      case 'returned': return Package;
      case 'refunded': return CreditCard;
      default: return Package;
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

  const submitRatingFeedback = async (item) => {
    const itemId = item._id;
    const rating = ratings[itemId];
    const feedback = feedbacks[itemId];

    if (!rating) {
      alert('Please provide a rating before submitting.');
      return;
    }

    try {
      setSubmittingFeedback(prev => ({ ...prev, [itemId]: true }));

      const endpoint = `${SERVER_URL}/rating/add`;

      const requestBody = {
        userId: userData._id,
        store: item.store?._id || item.storeId || item.sellerId?._id,
        type: type.slice(0, -1), // Remove 's' from 'appointments' or 'orders'
        rating: rating,
        feedback: feedback || ''
      };

      if (type === 'appointments') {
        requestBody.appointment = itemId;
      } else {
        requestBody.order = itemId;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody)
      });

      if (response.status === 201) {
        alert('Thank you for your feedback!');
        
        // Update the item to show it has been rated
        setData(prev => prev.map(dataItem => 
          dataItem._id === itemId 
            ? { ...dataItem, rating: rating, feedback: feedback, hasRated: true }
            : dataItem
        ));

        setExpandedCards(prev => ({ ...prev, [itemId]: false }));
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmittingFeedback(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const renderStars = (itemId, currentRating) => {
    return (
      <div className="flex justify-center space-x-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(itemId, star)}
            className="p-1 transition-colors duration-200 hover:scale-110"
          >
            {star <= currentRating ? (
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
            ) : (
              <Star className="w-6 h-6 text-gray-300" />
            )}
          </button>
        ))}
      </div>
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
      <div className="mt-3 pt-3 border-t border-gray-200">
        {hasAlreadyRated ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-center mb-2">
              <span className="text-xs font-semibold text-blue-800 mr-2">Your Rating:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= (item.rating || currentRating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            {(item.feedback || currentFeedback) && (
              <p className="text-xs text-gray-600 italic text-center">
                "{item.feedback || currentFeedback}"
              </p>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => toggleRatingSection(itemId)}
              className="w-full flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-2" />
                <span className="text-xs font-semibold text-teal-700">
                  {isExpanded ? 'Hide Rating' : 'Rate & Review'}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>

            {isExpanded && (
              <div className="mt-3 space-y-3">
                <p className="text-center text-sm font-semibold text-gray-800">
                  How was your experience?
                </p>
                {renderStars(itemId, currentRating)}
                
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
                  placeholder="Share your feedback (optional)"
                  value={currentFeedback}
                  onChange={(e) => setFeedback(itemId, e.target.value)}
                  rows={2}
                  maxLength={500}
                />
                
                <button
                  onClick={() => submitRatingFeedback(item)}
                  disabled={!currentRating || isSubmitting}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg font-semibold transition-colors duration-200 text-sm ${
                    !currentRating || isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderAppointmentCard = (item) => {
    const dateTime = formatDate(item.date);
    const formattedPrice = formatPrice(item.product?.price || item.price);
    const shopName = item.store?.name || item.store?.storeName || item.store?.businessName || 'Shop';
    const productImage = item.product?.image;
    const productName = item.productName || item.product?.name || 'Service';
    const StatusIcon = getStatusIcon(item.status);

   

    const handleCancelAppointment = async (appointmentId) => {
      console.log("Clicked cancel for:", appointmentId,token);
      if (!appointmentId || !token) {
        alert("Missing appointment ID or auth token.");
        return;
      }
    
      const confirmed = window.confirm("Are you sure you want to cancel this appointment?");
      if (!confirmed) return;
    
      try {
        const response = await fetch(`${SERVER_URL}/appointments/${appointmentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'cancelled' }),
        });
    
        if (response.ok) {
          // Optimistically update UI
          setData(prev =>
            prev.map(appointment =>
              appointment._id === appointmentId
                ? { ...appointment, status: 'cancelled' }
                : appointment
            )
          );
          alert('Appointment has been cancelled.');
          await fetchData();
        } else {
          throw new Error(`Failed to cancel. Status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        alert("Something went wrong while cancelling. Please try again.");
      }
    };
    
    return (
      <div key={item._id} className="bg-white rounded-xl p-3 mb-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        {/* Compact Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <p className={`text-xs font-semibold ${
              dateTime.isToday ? 'text-orange-600' : 
              dateTime.isTomorrow ? 'text-green-600' : 'text-gray-600'
            }`}>
              {dateTime.dateStr}
            </p>
            <p className="text-lg font-bold text-teal-700 leading-tight">{dateTime.timeStr}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {formattedPrice && (
              <div className="bg-green-100 px-2 py-1 rounded-full">
                <span className="text-xs font-semibold text-green-800">{formattedPrice}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div 
          className="inline-flex items-center px-2 py-1 rounded-full text-white text-xs font-bold mb-2"
          style={{ backgroundColor: getStatusColor(item.status) }}
        >
          <StatusIcon className="w-3 h-3 mr-1" />
          {item.status.replace('_', ' ').toUpperCase()}
        </div>

        {/* Compact Product Section */}
        <div className="flex bg-gray-50 rounded-lg p-2 mb-2">
          {productImage && (
            <img 
              src={productImage} 
              alt={productName}
              className="w-12 h-12 rounded-lg mr-3 object-cover bg-gray-200 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 text-sm truncate">{productName}</h3>
            {formattedPrice && (
              <p className="text-sm font-semibold text-green-600 mt-1">{formattedPrice}</p>
            )}
          </div>
        </div>

        {/* Compact Info Section */}
        <div className="space-y-1">
          <div className="flex items-center">
            <Store className="w-3 h-3 text-gray-500 mr-2 flex-shrink-0" />
            <span className="text-sm font-semibold text-teal-700 truncate">{shopName}</span>
          </div>

          {(item.locationName || item.store?.location || item.location) && (
            <div className="flex items-center">
              <MapPin className="w-3 h-3 text-gray-500 mr-2 flex-shrink-0" />
              <span className="text-xs text-gray-600 truncate">
                {item.locationName || item.store?.location || item.location}
              </span>
            </div>
          )}

          {item.notes && (
            <div className="flex items-start">
              <FileText className="w-3 h-3 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-gray-600 line-clamp-2">{item.notes}</span>
            </div>
          )}
        </div>
        {item.status === 'pending' && (
  <div className="pt-3">
    <button
      onClick={() => handleCancelAppointment(item._id)}
      className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-md transition duration-200"
    >
      Cancel
    </button>
  </div>
)}


        {renderRatingFeedbackSection(item)}
      </div>
    );
  };

  const renderOrderCard = (item) => {
    const dateTime = formatDate(item.createdAt || item.orderDate);
    const formattedPrice = formatPrice(item.totalAmount || item.amount);
    const storeName = item.sellerName || item.seller?.name || item.store?.name || 'Store';
    const StatusIcon = getStatusIcon(item.status);
  
    const handleCancelOrder = async (orderId) => {
      if (!orderId || !token) {
        alert("Missing order ID or auth token.");
        return;
      }
  
      const confirmed = window.confirm("Are you sure you want to cancel this order?");
      if (!confirmed) return;
  
      try {
        const response = await axios.patch(
          `${SERVER_URL}/orders/status/${orderId}`,
          { status: 'cancelled' },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
  
        if (response.status === 200 || response.status === 204) {
          setData(prev =>
            prev.map(order =>
              order._id === orderId
                ? { ...order, status: 'cancelled' }
                : order
            )
          );
          alert('Order has been cancelled.');
          await fetchData();
        } else {
          throw new Error(`Failed to cancel. Status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert("Something went wrong while cancelling. Please try again.");
      }
    };
  
    return (
      <div key={item._id} className="bg-white rounded-lg p-4 mb-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-md">
              <Package className="w-3 h-3 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Order #{item.orderId || item._id?.slice(-6)}
              </h3>
              <p className={`text-xs font-medium ${
                dateTime.isToday ? 'text-orange-600' : 
                dateTime.isTomorrow ? 'text-green-600' : 'text-gray-500'
              }`}>
                {dateTime.dateStr} • {dateTime.timeStr}
              </p>
            </div>
          </div>
          {formattedPrice && (
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1 rounded-lg shadow-md">
              <span className="text-xs font-bold">{formattedPrice}</span>
            </div>
          )}
        </div>
  
        {/* Status */}
        <div className="mb-3">
          <div 
            className="inline-flex items-center px-3 py-1 rounded-lg text-white text-xs font-bold shadow-md"
            style={{ backgroundColor: getStatusColor(item.status) }}
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {item.status.replace('_', ' ').toUpperCase()}
          </div>
        </div>
  
        {/* Products Loop */}
        {item.products?.map((prod, index) => {
          const unitPrice = formatPrice(prod.unitPrice);
          const totalPrice = formatPrice(prod.totalPrice);
          return (
            <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 mb-3 border border-gray-200">
              <div className="flex items-center space-x-3">
                {prod.productId?.image && (
                  <div className="relative flex-shrink-0">
                    <img 
                      src={prod.productId.image} 
                      alt={prod.productName}
                      className="w-12 h-12 rounded-lg object-cover shadow-md border-2 border-white"
                    />
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                      {prod.quantity}
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm mb-1">{prod.productName}</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 font-medium">Qty: {prod.quantity}</span>
                    {unitPrice && (
                      <span className="text-xs text-gray-700 font-semibold bg-white px-2 py-0.5 rounded shadow-sm">
                        {unitPrice} each
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
  
        {/* Info Section */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center bg-teal-50 p-2 rounded-lg border border-teal-200">
            <div className="bg-teal-500 p-1.5 rounded-lg mr-2 shadow-sm">
              <Store className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Store</p>
              <p className="text-sm font-bold text-teal-700">{storeName}</p>
            </div>
          </div>
  
          {item.paymentMethod && (
            <div className="flex items-center bg-blue-50 p-2 rounded-lg border border-blue-200">
              <div className="bg-blue-500 p-1.5 rounded-lg mr-2 shadow-sm">
                <CreditCard className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Payment</p>
                <p className="text-sm font-bold text-blue-700">
                  {item.paymentMethod.toUpperCase()}
                  {item.paymentStatus && ` (${item.paymentStatus})`}
                </p>
              </div>
            </div>
          )}
  
          {item.trackingNumber && (
            <div className="flex items-center bg-purple-50 p-2 rounded-lg border border-purple-200">
              <div className="bg-purple-500 p-1.5 rounded-lg mr-2 shadow-sm">
                <Truck className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Tracking</p>
                <p className="text-sm font-bold text-purple-700">{item.trackingNumber}</p>
              </div>
            </div>
          )}
        </div>
  
        {/* Cancel Button */}
        {item.status === 'pending' && (
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={() => handleCancelOrder(item._id)}
              className="w-full px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Cancel Order
            </button>
          </div>
        )}
  
        {renderRatingFeedbackSection(item)}
      </div>
    );
  };
  

  useEffect(() => {
    fetchData();
  }, [type]); // Refetch when type changes

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading {type}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-3">
          <button 
 onClick={() => setHistory(null)} // or whatever your parent route is
  className="text-teal-600 hover:text-teal-700 transition-colors"
>
  <ArrowLeft className="w-5 h-5" />
</button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-semibold text-teal-700 truncate">
                {type === 'appointments' ? 'My Appointments' : 'My Orders'}
              </h1>
              <p className="text-xs text-gray-600">{userData.phone || userData.contactNo}</p>
            </div>
          </div>
          <button 
            onClick={onRefresh}
            className="text-teal-600 hover:text-teal-700 transition-colors"
            disabled={refreshing}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              <Package className="w-12 h-12" />
            </div>
            <p className="text-red-600 text-center mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              {type === 'appointments' ? (
                <Calendar className="w-12 h-12" />
              ) : (
                <ShoppingBag className="w-12 h-12" />
              )}
            </div>
            <p className="text-gray-600 text-base mb-2">
              No {type === 'appointments' ? 'appointments' : 'orders'} found for this user
            </p>
            <p className="text-gray-500 text-sm">Pull down to refresh</p>
          </div>
        ) : (
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map(item => 
              type === 'appointments' 
                ? renderAppointmentCard(item) 
                : renderOrderCard(item)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAppointmentsOrders;