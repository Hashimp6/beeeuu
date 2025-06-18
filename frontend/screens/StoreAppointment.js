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
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { SERVER_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const StoreAppointments = ({ route, navigation }) => {
  const { status, storeId } = route.params;
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingAppointment, setUpdatingAppointment] = useState(null);

  const { user, token } = useAuth() || {};

  const validateRequiredData = () => {
    if (!storeId || !status || !token) {
      setError('Missing required data');
      return false;
    }
    return true;
  };

  const fetchAppointments = async () => {
    if (!validateRequiredData()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let apiUrl = '';
      let params = { status };
      
      if (status === 'today') {
        apiUrl = `${SERVER_URL}/appointments/user/${storeId}`;
        
        // Get today’s date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        params.date = today;
      } else {
        apiUrl = `${SERVER_URL}/appointments/store/${storeId}/status`;
      }
      
      console.log('Fetching appointments for status:', status, 'storeId:', storeId);

      const response = await axios.get(apiUrl, {
        params,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 10000
      });
      

      if (response.status === 200) {
        console.log(response.data.appointments );
        
        const appointmentsData = response.data.appointments || [];
        setAppointments(appointmentsData);
        console.log(`Fetched ${appointmentsData.length} appointments`);
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);

      if (error.response) {
        if (error.response.status === 404) {
          setAppointments([]);
          setError(null);
        } else if (error.response.status === 401) {
          setError('Authentication failed. Please login again.');
        } else if (error.response.status === 403) {
          setError('You do not have permission to view these appointments.');
        } else if (error.response.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(`Error: ${error.response.data?.message || 'Failed to fetch appointments'}`);
        }
      } else if (error.request) {
        setError('Network error. Please check your internet connection.');
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }

      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      setUpdatingAppointment(appointmentId);

      const response = await axios.put(
        `${SERVER_URL}/appointments/${appointmentId}`,
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
        setAppointments(prev => prev.filter(app => app._id !== appointmentId));
        
        Alert.alert(
          'Success',
          `Appointment ${newStatus === 'confirmed' ? 'confirmed' : 'cancelled'} successfully`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update appointment',
        [{ text: 'OK' }]
      );
    } finally {
      setUpdatingAppointment(null);
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

  const handleConfirmAppointment = (appointmentId) => {
    Alert.alert(
      'Confirm Appointment',
      'Are you sure you want to confirm this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => updateAppointmentStatus(appointmentId, 'confirmed')
        }
      ]
    );
  };

  const handleCancelAppointment = (appointmentId) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => updateAppointmentStatus(appointmentId, 'cancelled')
        }
      ]
    );
  };
  const handleCompleteAppointment = (appointmentId) => {
    Alert.alert(
      'Mark as Completed',
      'Mark this appointment as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          onPress: () => updateAppointmentStatus(appointmentId, 'completed')
        }
      ]
    );
  };
  
  const handleNotAttended = (appointmentId) => {
    Alert.alert(
      'Mark as Not Attended',
      'Mark this appointment as not attended?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Not Attended', 
          style: 'destructive',
          onPress: () => updateAppointmentStatus(appointmentId, 'not_attended')
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
  const isAppointmentPast = (dateString) => {
    if (!dateString) return false;
    const appointmentDate = new Date(dateString);
    const now = new Date();
    return appointmentDate < now;
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'confirmed': return '#34C759';
      case 'completed': return '#007AFF';
      case 'cancelled': return '#FF3B30';
      case 'not_attended': return '#FF9500'; 
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
      default: return 'help';
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [status, storeId]);

  const renderAppointmentCard = ({ item }) => {
    const dateTime = formatDate(item.date);
    const isUpdating = updatingAppointment === item._id;
    const formattedPrice = formatPrice( item.price );
    const phoneNumber = item.contactNo || item.user?.contactNo || item.phone;

    return (
      <View style={styles.appointmentCard}>
        {/* Header with Date/Time and Call Button */}
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

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Icon 
            name={getStatusIcon(item.status)} 
            size={14} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>

        {/* Customer and Service Info */}
        <View style={styles.infoSection}>
          <View style={styles.customerRow}>
            <View style={styles.customerInfo}>
              <Icon name="phone" size={16} color="#666" />
              {phoneNumber && (
              <Text style={styles.phoneNumber}>{phoneNumber}</Text>
            )}
            </View>
        
          </View>

          <View style={styles.serviceRow}>
            <Icon name="shopping-bag" size={16} color="#666" />
            <Text style={styles.serviceText}>
              {item.productName || item.product?.name || item.serviceName || 'Service'}
            </Text>
          </View>

          {(item.locationName || item.store?.location || item.location) && (
            <View style={styles.locationRow}>
              <Icon name="place" size={16} color="#666" />
              <Text style={styles.locationText}>
                {item.locationName || item.store?.location || item.location}
              </Text>
            </View>
          )}

          {item.notes && (
            <View style={styles.notesRow}>
              <Icon name="note" size={16} color="#666" />
              <Text style={styles.notesText} numberOfLines={2}>
                {item.notes}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons for Pending Appointments */}
        {status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelAppointment(item._id)}
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
              onPress={() => handleConfirmAppointment(item._id)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        {/* Action Buttons for Past Confirmed Appointments */}
{status === 'confirmed' && isAppointmentPast(item.date) && (
  <View style={styles.actionButtons}>
    <TouchableOpacity
      style={[styles.actionButton, styles.notAttendedButton]}
      onPress={() => handleNotAttended(item._id)}
      disabled={isUpdating}
    >
      {isUpdating ? (
        <ActivityIndicator size="small" color="#FF9500" />
      ) : (
        <>
          <Icon name="person-off" size={16} color="#FF9500" />
          <Text style={styles.notAttendedButtonText}>Not Attended</Text>
        </>
      )}
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.actionButton, styles.completeButton]}
      onPress={() => handleCompleteAppointment(item._id)}
      disabled={isUpdating}
    >
      {isUpdating ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          <Icon name="check-circle" size={16} color="#FFFFFF" />
          <Text style={styles.completeButtonText}>Complete</Text>
        </>
      )}
    </TouchableOpacity>
  </View>
)}
      </View>
    );
  };

  const getTitle = () => {
    switch (status) {
      case 'pending': return 'Pending Appointments';
      case 'today': return "Today's Appointments";
      case 'confirmed': return 'Confirmed Appointments';
      case 'completed': return 'Completed Appointments';
      case 'cancelled': return 'Cancelled Appointments';
      default: return 'Appointments';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#155366" />
        <Text style={styles.loadingText}>Loading appointments...</Text>
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
        <TouchableOpacity onPress={fetchAppointments}>
          <Icon name="refresh" size={24} color="#155366" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAppointments}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : appointments.length === 0 ? (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.emptyContainer}
        >
          <Icon name="event-busy" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No {status} appointments found</Text>
          <Text style={styles.emptySubText}>Pull down to refresh</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointmentCard}
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
  notAttendedButton: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  completeButton: {
    backgroundColor: '#34C759',
  },
  notAttendedButtonText: {
    color: '#FF9500',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
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
  appointmentCard: {
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
    marginBottom: 8,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  infoSection: {
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  phoneNumber: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 6,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    minHeight: 40,
  },
  cancelButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  confirmButton: {
    backgroundColor: '#155366',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
  },
});

export default StoreAppointments;