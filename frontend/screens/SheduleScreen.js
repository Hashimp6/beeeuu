import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react-native';

const AppointmentCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLargeScreen, setIsLargeScreen] = useState(Dimensions.get('window').width > 768);

  useEffect(() => {
    const handleResize = ({ window }) => {
      setIsLargeScreen(window.width > 768);
    };
    const subscription = Dimensions.addEventListener('change', handleResize);
    return () => subscription.remove();
  }, []);

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const timeSlots = ['5:30 PM', '6:30 PM', '7:30 PM', '8:30 PM', '9:30 PM'];

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
    today.setHours(0, 0, 0, 0); // Normalize today to start of day for accurate comparison

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0); // Normalize date for comparison
      
      const isPast = date < today; // Check if date is in the past
      
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

  const calendarDays = generateCalendarDays();

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Choose Date and Time for Appointment</Text>

      {/* Month Navigation */}
      <View style={styles.monthNavContainer}>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <ChevronLeft size={18} color="#155366" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={[styles.navButton, styles.navButtonActive]}>
            <ChevronRight size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Container */}
      <View style={styles.calendarContainer}>
        {/* Calendar Header */}
        <View style={styles.weekRow}>
          {dayNames.map((day, idx) => (
            <View key={idx} style={styles.dayNameContainer}>
              <Text style={styles.dayName}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Days */}
        <View style={styles.daysGrid}>
          {calendarDays.map((day, idx) => {
            const isSelected = selectedDate?.toDateString() === day.date.toDateString();
            const isToday = day.isToday;
            
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
                  isToday && styles.dayToday,
                ]}
              >
                <Text style={[
                  styles.dayText,
                  !day.isCurrentMonth && styles.dayTextOtherMonth,
                  day.isPast && styles.dayTextPast,
                  isSelected && styles.dayTextSelected,
                  isToday && styles.dayTextToday,
                ]}>
                  {day.date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Time Slot Selection */}
      <View style={styles.timeSlotContainer}>
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
              <Clock size={16} color={selectedTime === time ? '#fff' : '#155366'} />
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

      {/* Continue Button */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          !(selectedDate && selectedTime) && styles.continueButtonDisabled
        ]}
        disabled={!(selectedDate && selectedTime)}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#ffffff',
  },
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    color: '#333333',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  monthNavContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  navButton: {
    backgroundColor: '#E3F2F7',
    padding: 12,
    borderRadius: 25,
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonActive: {
    backgroundColor: '#155366',
  },
  monthText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
  },
  calendarContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  dayNameContainer: {
    width: 40,
    alignItems: 'center',
  },
  dayName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 40,
    height: 40,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  dayOtherMonth: {
    opacity: 0.4,
  },
  dayTextOtherMonth: {
    color: '#999',
  },
  dayPast: {
    opacity: 0.4,
    backgroundColor: '#f0f0f0',
  },
  dayTextPast: {
    color: '#aaa',
  },
  daySelected: {
    backgroundColor: '#155366',
    shadowColor: '#155366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  dayToday: {
    borderWidth: 1,
    borderColor: '#155366',
  },
  dayTextToday: {
    fontWeight: '700',
    color: '#155366',
  },
  timeSlotContainer: {
    marginTop: 10,
    marginBottom: 10,
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
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    width: '48%',
    backgroundColor: '#f8f8f8',
  },
  timeSlotSelected: {
    backgroundColor: '#155366',
    borderColor: '#155366',
    shadowColor: '#155366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  timeSlotText: {
    marginLeft: 8,
    color: '#155366',
    fontSize: 15,
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  continueButton: {
    marginTop: 20,
    backgroundColor: '#155366',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#155366',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: '#e5e5e5',
    shadowOpacity: 0,
  },
  continueButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  }
});

export default AppointmentCalendar;