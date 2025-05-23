import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const AppointmentScheduler = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const otherUser= route.params.otherUser || {};
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [locationName, setLocationName] = useState('');
const [address, setAddress] = useState('');
const [contactNo, setContactNo] = useState('');
  // Time slots - you can customize these
  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Initialize when component mounts
  useEffect(() => {
    console.log("strdxxxxd",otherUser);
    
    setSelectedDate(new Date());
    setSelectedTime(null);
    setCurrentMonth(new Date());
  }, []);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysFromPrevMonth = firstDay.getDay();
    const totalDays = daysFromPrevMonth + lastDay.getDate();
    const totalCells = Math.ceil(totalDays / 7) * 7;
    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        isPast: true
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0);
      
      const isPast = date < today;
      
      days.push({
        date,
        isCurrentMonth: true,
        isPast: isPast,
        isSelected: selectedDate &&
          selectedDate.getDate() === i &&
          selectedDate.getMonth() === month &&
          selectedDate.getFullYear() === year,
        isToday: today.getDate() === i &&
          today.getMonth() === month &&
          today.getFullYear() === year
      });
    }

    const remainingDays = totalCells - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isPast: false
      });
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (day) => {
    if (day.isCurrentMonth && !day.isPast) {
      setSelectedDate(day.date);
      setSelectedTime(null);
    }
  };

  const formatAppointmentDate = (date) => {
    if (!date) return '';
    return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleSendAppointment = () => {
    if (selectedDate && selectedTime) {
      const appointmentDate = formatAppointmentDate(selectedDate);
      
      // Create the appointment data with location details
      const appointmentData = {
        date: appointmentDate,
        time: selectedTime,
        locationName: locationName,
        address: address,
        contactNo: contactNo,
        storeId: otherUser,
        product:otherUser.productName,
        status: 'Pending'
      };
  
      // Create confirmation message for the chat with location details
      let confirmationMessage = `You have an appointment scheduled on ${appointmentDate} at ${selectedTime}.`;
      
      if (locationName) {
        confirmationMessage += `\nLocation: ${locationName}`;
      }
      if (address) {
        confirmationMessage += `\nAddress: ${address}`;
      }
      if (contactNo) {
        confirmationMessage += `\nContact: ${contactNo}`;
      }
      if (otherUser.productName) {
        confirmationMessage += `\nProduct: ${otherUser.productName}`;
      }
      
      // Pass the data back to the previous screen (ChatDetailScreen)
      navigation.navigate('ChatDetail', {
        otherUser: otherUser,
        appointmentMessage: confirmationMessage,
        appointmentData: appointmentData
      });
    }
  };
  const calendarDays = generateCalendarDays();

  return (
    
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Appointment</Text>
        <View style={styles.placeholder} />
      </View>
      <KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
      <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Month Navigation */}
            <View style={styles.monthNavContainer}>
              <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
                <Ionicons name="chevron-back" size={22} color="#155366" />
              </TouchableOpacity>
              <Text style={styles.monthText}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                <Ionicons name="chevron-forward" size={22} color="#155366" />
              </TouchableOpacity>
            </View>

            {/* Calendar */}
            <View style={styles.calendarContainer}>
              {/* Day names */}
              <View style={styles.weekRow}>
                {dayNames.map((day, idx) => (
                  <View key={idx} style={styles.dayNameContainer}>
                    <Text style={styles.dayName}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Calendar grid */}
              <View style={styles.daysGrid}>
                {calendarDays.map((day, idx) => {
                  const isSelected = selectedDate?.toDateString() === day.date.toDateString();
                  
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleDateSelect(day)}
                      disabled={!day.isCurrentMonth || day.isPast}
                      style={[
                        styles.dayCell,
                        !day.isCurrentMonth && styles.dayOtherMonth,
                        day.isPast && styles.dayPast,
                        isSelected && styles.daySelected,
                        day.isToday && styles.dayToday,
                      ]}
                    >
                      <Text style={[
                        styles.dayText,
                        !day.isCurrentMonth && styles.dayTextOtherMonth,
                        day.isPast && styles.dayTextPast,
                        isSelected && styles.dayTextSelected,
                        day.isToday && styles.dayTextToday,
                      ]}>
                        {day.date.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Time selection */}
            <View style={styles.timeSelectionContainer}>
              <Text style={styles.sectionTitle}>Choose a Time</Text>
              <View style={styles.timeSlotGrid}>
                {timeSlots.map((time, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.timeSlot,
                      selectedTime === time && styles.timeSlotSelected
                    ]}
                    onPress={() => setSelectedTime(time)}
                    disabled={!selectedDate}
                  >
                    <Ionicons 
                      name="time-outline" 
                      size={18} 
                      color={selectedTime === time ? "#FFFFFF" : "#155366"} 
                    />
                    <Text style={[
                      styles.timeSlotText,
                      selectedTime === time && styles.timeSlotTextSelected
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.locationDetailsContainer}>
  <Text style={styles.sectionTitle}>Location Details</Text>
  
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>Location Name</Text>
    <TextInput
      style={styles.textInput}
      placeholder="Enter location name"
      value={locationName}
      onChangeText={setLocationName}
      placeholderTextColor="#999999"
    />
  </View>

  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>Address</Text>
    <TextInput
      style={[styles.textInput, styles.addressInput]}
      placeholder="Enter full address"
      value={address}
      onChangeText={setAddress}
      multiline={true}
      numberOfLines={3}
      placeholderTextColor="#999999"
    />
  </View>

  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>Contact Number</Text>
    <TextInput
      style={styles.textInput}
      placeholder="Enter contact number"
      value={contactNo}
      onChangeText={setContactNo}
      keyboardType="phone-pad"
      placeholderTextColor="#999999"
    />
  </View>
</View>

            {/* Selected appointment summary */}
            {selectedDate && selectedTime && (
              <View style={styles.appointmentSummary}>
                <Text style={styles.summaryTitle}>Your Appointment Request</Text>
                <View style={styles.summaryDetails}>
                  <View style={styles.summaryRow}>
                    <Ionicons name="calendar-outline" size={20} color="#155366" />
                    <Text style={styles.summaryText}>{formatAppointmentDate(selectedDate)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Ionicons name="time-outline" size={20} color="#155366" />
                    <Text style={styles.summaryText}>{selectedTime}</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
          </KeyboardAvoidingView>

          {/* Bottom buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
  style={[
    styles.sendButton,
    (!selectedDate || !selectedTime || !locationName || !address || !contactNo) && styles.sendButtonDisabled
  ]}
  onPress={handleSendAppointment}
  disabled={!selectedDate || !selectedTime || !locationName || !address || !contactNo}
>
  <Text style={styles.sendButtonText}>Book Appointment</Text>
</TouchableOpacity>
          </View>
        </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#155366', // Updated to requested teal color
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  monthNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E0F2F1', // Light teal
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#155366', // Updated to requested teal color
  },
  calendarContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayNameContainer: {
    width: 40,
    alignItems: 'center',
  },
  dayName: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    color: '#000000',
  },
  dayOtherMonth: {
    opacity: 0.3,
  },
  dayTextOtherMonth: {
    color: '#757575',
  },
  dayPast: {
    opacity: 0.5,
  },
  locationDetailsContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#155366',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  dayTextPast: {
    color: '#757575',
  },
  daySelected: {
    backgroundColor: '#155366', // Updated to requested teal color
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dayToday: {
    borderWidth: 1,
    borderColor: '#155366', // Updated to requested teal color
  },
  dayTextToday: {
    fontWeight: 'bold',
    color: '#155366', // Updated to requested teal color
  },
  timeSelectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#155366', // Updated to requested teal color
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    width: '48%',
    backgroundColor: '#E0F2F1', // Light teal
  },
  timeSlotSelected: {
    backgroundColor: '#155366', // Updated to requested teal color
    borderColor: '#155366',
  },
  timeSlotText: {
    marginLeft: 8,
    color: '#155366', // Updated to requested teal color
    fontSize: 14,
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
  },
  appointmentSummary: {
    backgroundColor: '#E0F2F1', // Light teal
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#155366', // Updated to requested teal color
  },
  summaryDetails: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryText: {
    fontSize: 15,
    color: '#155366', // Updated to requested teal color
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B2DFDB', // Very light teal
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#155366', // Updated to requested teal color
    fontWeight: '500',
  },
  sendButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#155366', // Updated to requested teal color
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#B2DFDB', // Very light teal
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default AppointmentScheduler;