import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { SERVER_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const CustomerBookingPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const [store, setStore] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [tableTicket, setTableTicket] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentBookings, setCurrentBookings] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    numberOfPeople: 1,
    date: '',
    timeSlot: '',
    note: ''
  });

  // Get store data from route params
  const tempStore = route.params?.store;
  const storeId = tempStore?._id;
  const {user}=useAuth()


  const fetchStoreDetails = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/stores/${storeId}`);
      setStore(response.data.store);
    } catch (error) {
      console.error("Error fetching store data:", error);
      Alert.alert("Error", "Failed to fetch store information.");
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchStoreDetails();
    }
  }, [storeId]);

  const fetchCurrentBookings = async () => {
    try {
      setIsRefreshing(true);
      const response = await axios.get(`${SERVER_URL}/booking/current/${store._id}`);
      const data = response.data;
      setCurrentBookings(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching current bookings:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (store) {
      fetchCurrentBookings();
      const interval = setInterval(fetchCurrentBookings, 10000);
      return () => clearInterval(interval);
    }
  }, [store]);

  const fetchTimeSlots = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/booking/slots/${store._id}`);
      setAvailableTimeSlots(response.data.data);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setAvailableTimeSlots({});
    }
  };

  useEffect(() => {
    if (store?._id) {
      fetchTimeSlots();
    }
  }, [store]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = user._id;
        
        // Fetch Ticket Number
        const res1 = await fetch(`${SERVER_URL}/booking/tickets/${userId}/${store._id}`);
        const data1 = await res1.json();
        if (res1.ok) {
          setTicket(data1.ticket);
        } else {
          setTicket(null);
        }

        // Fetch Table Ticket
        const res2 = await fetch(`${SERVER_URL}/booking/table/${userId}`);
        const data2 = await res2.json();
        if (res2.ok) {
          setTableTicket(data2);
        } else {
          setTableTicket(null);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setTicket(null);
        setTableTicket(null);
      }
    };

    if (user && store) {
      fetchData();
    }
  }, [user, store]);

  const getDateOptions = () => {
    const today = new Date();
    const options = [];
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = dayNames[date.getDay()];
      
      if (availableTimeSlots[dayName] && availableTimeSlots[dayName].length > 0) {
        options.push({
          value: date.toISOString().split('T')[0],
          label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
          dayName: dayName
        });
      }
    }
    
    return options;
  };

  const bookingOptions = [
    {
      key: 'onlineTicketing',
      title: 'Online Ticketing',
      description: 'Book your tickets online and skip the queue',
      icon: 'schedule',
      data: store?.onlineTicketing,
      needsForm: true
    },
    {
      key: 'walkingTicketing',
      title: 'Walk-in Ticketing',
      description: 'Purchase tickets at the venue counter',
      icon: 'place',
      data: store?.walkingTicketing,
      needsForm: false,
      showButton: false
    },
    {
      key: 'tableBooking',
      title: 'Table Reservation',
      description: 'Reserve your table in advance',
      icon: 'people',
      data: store?.tableBooking,
      needsForm: true
    }
  ];

  const createOnlineTicket = async (ticketData) => {
    try {
      const response = await fetch(`${SERVER_URL}/booking/online`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create ticket');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const handleBookNow = (optionKey, optionData) => {
    if (!optionData?.active) return;
    
    if (optionKey === 'walkingTicketing') {
      Alert.alert('Walk-in Ticketing', 'Please visit our counter directly. No advance booking required!');
      return;
    }
    
    setSelectedOption(optionKey);
    setFormData({
      name: '',
      phone: '',
      numberOfPeople: 1,
      date: '',
      timeSlot: '',
      note: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    if (selectedOption === 'tableBooking' && (!formData.date || !formData.timeSlot)) {
      Alert.alert('Error', 'Please select date and time for table reservation');
      return;
    }

    setIsLoading(true);
    
    try {
      if (selectedOption === 'onlineTicketing') {
        const ticketData = {
          storeId: store._id,
          userId: user._id,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          numberOfPeople: formData.numberOfPeople
        };

        const response = await createOnlineTicket(ticketData);
        
        Alert.alert(
          '🎫 Ticket Created Successfully!',
          `Ticket Number: #${response.ticket.ticketNumber}\nName: ${response.ticket.name}\nPhone: ${response.ticket.phone}\nPeople: ${response.ticket.numberOfPeople}\n${response.ticket.isPaid ? `Amount: ₹${response.ticket.paymentAmount}` : 'Free Ticket'}\n\nPlease save your ticket number for reference!`
        );

        setSelectedOption(null);
        setFormData({
          name: '',
          phone: '',
          numberOfPeople: 1,
          date: '',
          timeSlot: '',
          note: ''
        });

      } else if (selectedOption === 'tableBooking') {
        const bookingData = {
          storeId: store._id,
          userId: user._id,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          numberOfPeople: formData.numberOfPeople,
          reservationDate: formData.date,
          timeSlot: formData.timeSlot,
          note: formData.note || ""
        };

        const { data } = await axios.post(`${SERVER_URL}/booking/table/add`, bookingData);
        Alert.alert('Success', 'Table booked successfully!');
        
        setFormData({
          name: '',
          phone: '',
          numberOfPeople: 1,
          date: '',
          timeSlot: '',
          note: ''
        });
        handleBack();
      }
      
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedOption(null);
    fetchStoreDetails();
  };

  if (!store) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Store Not Found</Text>
          <Text style={styles.errorText}>Unable to load store information. Please try again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (selectedOption) {
    const option = bookingOptions.find(opt => opt.key === selectedOption);

    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBack} 
            style={styles.backButton}
            disabled={isLoading}
          >
            <Icon name="arrow-back" size={24} color="#0f766e" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{option.title}</Text>
            <Text style={styles.headerSubtitle}>{store.storeName}</Text>
          </View>
        </View>

        {/* Form */}
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            {/* Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                <Icon name="person" size={16} color="#374151" /> Full Name *
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Enter your full name"
                editable={!isLoading}
              />
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                <Icon name="phone" size={16} color="#374151" /> Phone Number *
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

            {/* Number of People */}
            {(selectedOption === 'onlineTicketing' || selectedOption === 'tableBooking') && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  <Icon name="people" size={16} color="#374151" /> Number of People *
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.numberOfPeople}
                    onValueChange={(value) => handleInputChange('numberOfPeople', value)}
                    enabled={!isLoading}
                    style={styles.picker}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <Picker.Item key={num} label={`${num} ${num === 1 ? 'Person' : 'People'}`} value={num} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Date (only for table booking) */}
            {selectedOption === 'tableBooking' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  <Icon name="event" size={16} color="#374151" /> Date *
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.date}
                    onValueChange={(value) => handleInputChange('date', value)}
                    enabled={!isLoading}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select a date" value="" />
                    {getDateOptions().map(dateOption => (
                      <Picker.Item key={dateOption.value} label={dateOption.label} value={dateOption.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Time Slot (only for table booking) */}
            {selectedOption === 'tableBooking' && formData.date && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  <Icon name="schedule" size={16} color="#374151" /> Time Slot *
                </Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.timeSlot}
                    onValueChange={(value) => handleInputChange('timeSlot', value)}
                    enabled={!isLoading}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select a time slot" value="" />
                    {(() => {
                      const selectedDate = new Date(formData.date);
                      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()];
                      return availableTimeSlots[dayName]?.map(slot => (
                        <Picker.Item key={slot} label={slot} value={slot} />
                      )) || [];
                    })()}
                  </Picker>
                </View>
              </View>
            )}

            {/* Note Field */}
            {selectedOption === 'tableBooking' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Additional Note (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.note}
                  onChangeText={(text) => handleInputChange('note', text)}
                  placeholder="Any special requests or instructions?"
                  multiline
                  numberOfLines={3}
                  editable={!isLoading}
                />
              </View>
            )}

            {/* Price Summary */}
            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Price:</Text>
                <Text style={styles.priceValue}>
                  {selectedOption === 'onlineTicketing' ? 
                    (store.onlineTicketing.type === 'paid' ? `₹${option.data.price}` : 'Free') :
                    `₹${option.data.price}`
                  }
                </Text>
              </View>
              {option.data.refundable && (
                <Text style={styles.refundableText}>✓ Refundable booking</Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text style={styles.submitButtonText}>Creating Booking...</Text>
                </View>
              ) : (
                <View style={styles.submitButtonContent}>
                  <Icon 
                    name={selectedOption === 'onlineTicketing' ? 'check-circle' : 'credit-card'} 
                    size={20} 
                    color="#ffffff" 
                  />
                  <Text style={styles.submitButtonText}>
                    {selectedOption === 'onlineTicketing' ? 'Create Ticket' : 'Proceed to Payment'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={fetchCurrentBookings} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.mainHeader}>
          <Text style={styles.mainTitle}>{store.storeName || 'Welcome'}</Text>
          <Text style={styles.mainSubtitle}>Choose your preferred booking method</Text>
        </View>

        {/* Tickets Display - Compact List */}
        <View style={styles.ticketsContainer}>
          <Text style={styles.ticketsHeaderTitle}>Your Bookings</Text>
          
          {/* User's Ticket */}
          {ticket ? (
            <View style={styles.compactTicketItem}>
              <View style={styles.compactTicketLeft}>
                <View style={styles.compactTicketHeader}>
                  <Icon name="schedule" size={18} color="#0f766e" />
                  <Text style={styles.compactTicketType}>Online Ticket</Text>
                  <View style={[
                    styles.compactStatusBadge,
                    ticket.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending
                  ]}>
                    <Text style={[
                      styles.compactStatusText,
                      ticket.status === 'confirmed' ? styles.statusConfirmedText : styles.statusPendingText
                    ]}>
                      {ticket.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.compactTicketDetail}>
                  {ticket.name} • {ticket.numberOfPeople} people • {ticket.phone}
                </Text>
              </View>
              <View style={styles.compactTicketRight}>
                <Text style={styles.compactTicketNumber}>#{ticket.ticketNumber}</Text>
                {ticket.isPaid && (
                  <Text style={styles.compactPaidAmount}>₹{ticket.paymentAmount}</Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.compactEmptyItem}>
              <Icon name="schedule" size={18} color="#9ca3af" />
              <Text style={styles.compactEmptyText}>No online ticket</Text>
            </View>
          )}

          {/* Table Reservations */}
          {tableTicket && tableTicket.length > 0 ? (
            tableTicket.map((reservation) => (
              <View key={reservation._id} style={styles.compactTableItem}>
                <View style={styles.compactTicketLeft}>
                  <View style={styles.compactTicketHeader}>
                    <Icon name="people" size={18} color="#3730a3" />
                    <Text style={styles.compactTableType}>Table Reservation</Text>
                    <View style={[
                      styles.compactStatusBadge,
                      reservation.status === 'confirmed' ? styles.statusConfirmed : 
                      reservation.status === 'pending' ? styles.statusPending : styles.statusCancelled
                    ]}>
                      <Text style={[
                        styles.compactStatusText,
                        reservation.status === 'confirmed' ? styles.statusConfirmedText : 
                        reservation.status === 'pending' ? styles.statusPendingText : styles.statusCancelledText
                      ]}>
                        {reservation.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.compactTicketDetail}>
                    {reservation.name} • {reservation.numberOfPeople} people
                  </Text>
                  <Text style={styles.compactTicketDetail}>
                    {new Date(reservation.reservationDate).toLocaleDateString()} • {reservation.timeSlot || "Time TBD"}
                  </Text>
                </View>
                <View style={styles.compactTicketRight}>
                  <Text style={styles.compactReservationLabel}>Reserved</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.compactEmptyItem}>
              <Icon name="people" size={18} color="#9ca3af" />
              <Text style={styles.compactEmptyText}>No table reservation</Text>
            </View>
          )}
        </View>

        {/* Currently Serving Section */}
        <View style={styles.currentServingContainer}>
          <View style={styles.currentServingHeader}>
            <Text style={styles.currentServingTitle}>🎫 Currently Serving</Text>
            <TouchableOpacity
              onPress={fetchCurrentBookings}
              disabled={isRefreshing}
              style={styles.refreshButton}
            >
              <Icon 
                name="refresh" 
                size={20} 
                color="#ffffff"
                style={isRefreshing ? styles.refreshingIcon : null}
              />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {lastUpdated && (
            <Text style={styles.lastUpdated}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          )}

          <View style={styles.currentTicketsRow}>
            {/* Online Ticket Card */}
            <View style={styles.currentTicketCard}>
              <View style={styles.currentTicketHeader}>
                <Icon name="schedule" size={24} color="#0f766e" />
                <Text style={styles.currentTicketTitle}>Online Ticket</Text>
              </View>
              {currentBookings?.online?.currentTicket ? (
                <View>
                  <Text style={styles.currentTicketNumber}>
                    #{currentBookings.online.currentTicket.ticketNumber}
                  </Text>
                  <Text style={styles.currentTicketStatus}>Currently being served</Text>
                  <Text style={styles.nextTicketText}>
                    Next possible: #{currentBookings.online.nextTicketNumber}
                  </Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.noQueueText}>No Queue</Text>
                  <Text style={styles.noQueueSubText}>No online bookings currently being served</Text>
                </View>
              )}
            </View>

            {/* Walk-in Ticket Card */}
            <View style={styles.currentWalkInCard}>
              <View style={styles.currentTicketHeader}>
                <Icon name="place" size={24} color="#d97706" />
                <Text style={styles.currentTicketTitle}>Walk-in Ticket</Text>
              </View>
              {currentBookings?.walkIn?.currentTicket ? (
                <View>
                  <Text style={styles.currentWalkInNumber}>
                    #{currentBookings.walkIn.currentTicket.ticketNumber}
                  </Text>
                  <Text style={styles.currentTicketStatus}>Currently being served</Text>
                  <Text style={styles.nextTicketText}>
                    Next possible: #{currentBookings.walkIn.nextTicketNumber}
                  </Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.noQueueText}>No Queue</Text>
                  <Text style={styles.noQueueSubText}>No walk-in bookings currently being served</Text>
                </View>
              )}
            </View>
          </View>

          {/* Connection Status */}
          <View style={styles.connectionStatus}>
            <View style={[
              styles.statusIndicator,
              isRefreshing ? styles.statusUpdating : styles.statusLive
            ]}>
              <View style={[
                styles.statusDot,
                isRefreshing ? styles.statusDotUpdating : styles.statusDotLive
              ]} />
              <Text style={styles.statusText}>
                {isRefreshing ? 'Updating...' : 'Live updates active'}
              </Text>
            </View>
          </View>
        </View>

        {/* Booking Options */}
        <View style={styles.optionsContainer}>
          {bookingOptions.map((option) => {
            const isActive = option.data?.active;
            const price = option.data?.price?.$numberInt || option.data?.price || 0;
            const isRefundable = option.data?.refundable;

            return (
              <TouchableOpacity
                key={option.key}
                onPress={() => handleBookNow(option.key, option.data)}
                disabled={!isActive}
                style={[
                  styles.optionCard,
                  !isActive && styles.optionCardDisabled
                ]}
              >
                {/* Status Indicator */}
                <View style={styles.optionStatus}>
                  <View style={[
                    styles.statusBadge,
                    isActive ? styles.statusActive : styles.statusInactive
                  ]}>
                    <Icon 
                      name={isActive ? "check-circle" : "cancel"} 
                      size={16} 
                      color={isActive ? "#065f46" : "#6b7280"}
                    />
                    <Text style={[
                      styles.statusText,
                      isActive ? styles.statusActiveText : styles.statusInactiveText
                    ]}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>

                <View style={styles.optionContent}>
                  {/* Icon */}
                  <View style={[
                    styles.optionIconContainer,
                    isActive ? styles.optionIconActive : styles.optionIconInactive
                  ]}>
                    <Icon 
                      name={option.icon} 
                      size={32} 
                      color={isActive ? "#0f766e" : "#9ca3af"}
                    />
                  </View>

                  {/* Title and Description */}
                  <Text style={[
                    styles.optionTitle,
                    !isActive && styles.optionTitleDisabled
                  ]}>
                    {option.title}
                  </Text>
                  
                  <Text style={[
                    styles.optionDescription,
                    !isActive && styles.optionDescriptionDisabled
                  ]}>
                    {option.description}
                  </Text>

                  {/* Price */}
                  {isActive && (
                    <View style={styles.optionPriceContainer}>
                      {option.key === 'onlineTicketing' && (
                        <Text style={styles.optionPrice}>
                          {store.onlineTicketing.type === 'paid' ? `₹${price}` : 'Free'}
                        </Text>
                      )}
                      {option.key === 'tableBooking' && (
                        <Text style={styles.optionPrice}>₹{price}</Text>
                      )}
                      {option.key === 'walkingTicketing' && (
                        <Text style={styles.walkInNote}>No advance booking required</Text>
                      )}
                      {isRefundable && (
                        <Text style={styles.refundableText}>✓ Refundable</Text>
                      )}
                    </View>
                  )}

                  {/* Action Button */}
                  {option.key !== 'walkingTicketing' ? (
                    <View style={[
                      styles.actionButton,
                      isActive ? styles.actionButtonActive : styles.actionButtonDisabled
                    ]}>
                      <Text style={[
                        styles.actionButtonText,
                        !isActive && styles.actionButtonTextDisabled
                      ]}>
                        {isActive ? 'Book Now' : 'Currently Unavailable'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.walkInAction}>
                      <Text style={styles.walkInActionText}>Visit our counter directly</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Header styles for form view
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backText: {
    color: '#0f766e',
    fontSize: 16,
    marginLeft: 4,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  // Form styles
  formContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  formCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 50,
  },
  priceContainer: {
    backgroundColor: '#f0fdfa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#5eead4',
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  refundableText: {
    fontSize: 14,
    color: '#059669',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#0f766e',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Main view styles
  mainHeader: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Compact tickets display styles
  ticketsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  ticketsHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  compactTicketItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f0fdfa',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0f766e',
  },
  compactTableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3730a3',
  },
  compactEmptyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#d1d5db',
  },
  compactTicketLeft: {
    flex: 1,
  },
  compactTicketRight: {
    alignItems: 'flex-end',
  },
  compactTicketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  compactTicketType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
    marginLeft: 6,
    marginRight: 8,
  },
  compactTableType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3730a3',
    marginLeft: 6,
    marginRight: 8,
  },
  compactStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactStatusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  compactTicketDetail: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  compactTicketNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  compactPaidAmount: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    marginTop: 2,
  },
  compactReservationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3730a3',
  },
  compactEmptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginLeft: 8,
  },
  // Remove old ticket card styles - they're now replaced with compact styles
  // ticketCard, tableCard, emptyTicketCard, etc. styles removed
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusConfirmed: {
    backgroundColor: '#d1fae5',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusCancelled: {
    backgroundColor: '#fecaca',
  },
  statusActive: {
    backgroundColor: '#d1fae5',
  },
  statusInactive: {
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  statusConfirmedText: {
    color: '#065f46',
  },
  statusPendingText: {
    color: '#92400e',
  },
  statusCancelledText: {
    color: '#dc2626',
  },
  statusActiveText: {
    color: '#065f46',
  },
  statusInactiveText: {
    color: '#6b7280',
  },
  // Remove old ticket-related styles that are no longer needed
  ticketFooter: {
    fontSize: 10,
    color: '#0f766e',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#5eead4',
    paddingTop: 8,
  },
  emptyTicketTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  emptyTicketText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  // Currently serving styles
  currentServingContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  currentServingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentServingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  refreshButton: {
    backgroundColor: '#0f766e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshingIcon: {
    // You can add animation styles here if needed
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
  currentTicketsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  currentTicketCard: {
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#5eead4',
  },
  currentWalkInCard: {
    backgroundColor: '#fefbf3',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  currentTicketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentTicketTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  currentTicketNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: 4,
  },
  currentWalkInNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#d97706',
    marginBottom: 4,
  },
  currentTicketStatus: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  nextTicketText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  noQueueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginBottom: 4,
  },
  noQueueSubText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  connectionStatus: {
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusUpdating: {
    backgroundColor: '#fef3c7',
  },
  statusLive: {
    backgroundColor: '#d1fae5',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotUpdating: {
    backgroundColor: '#f59e0b',
  },
  statusDotLive: {
    backgroundColor: '#10b981',
  },
  // Booking options styles
  optionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#5eead4',
  },
  optionCardDisabled: {
    opacity: 0.75,
    borderColor: '#d1d5db',
  },
  optionStatus: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  optionContent: {
    padding: 24,
  },
  optionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionIconActive: {
    backgroundColor: '#f0fdfa',
  },
  optionIconInactive: {
    backgroundColor: '#f3f4f6',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  optionTitleDisabled: {
    color: '#9ca3af',
  },
  optionDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  optionDescriptionDisabled: {
    color: '#9ca3af',
  },
  optionPriceContainer: {
    marginBottom: 16,
  },
  optionPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  walkInNote: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  actionButton: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#0f766e',
  },
  actionButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionButtonTextDisabled: {
    color: '#9ca3af',
  },
  walkInAction: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
});

export default CustomerBookingPage;
    