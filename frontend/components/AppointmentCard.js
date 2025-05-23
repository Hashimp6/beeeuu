import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AppointmentCard = ({ date, time }) => {
  return (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Ionicons name="calendar-outline" size={22} color="#000000" />
        <Text style={styles.appointmentTitle}>Appointment Request</Text>
      </View>
      
      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={18} color="#555555" />
          <Text style={styles.detailText}>{date}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={18} color="#555555" />
          <Text style={styles.detailText}>{time}</Text>
        </View>
      </View>
      
      <View style={styles.statusContainer}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Pending</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appointmentCard: {
    backgroundColor: '#F8F9FF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#000000',
  },
  appointmentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#333333',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    backgroundColor: '#FFF8E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
});

export default AppointmentCard;