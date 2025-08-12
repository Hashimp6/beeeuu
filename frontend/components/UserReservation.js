import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { SERVER_URL } from '../config';


const { width } = Dimensions.get('window');

const UserReservationsScreen = ({ navigation, route }) => {
  const { user: userInfo } = route.params;
  const [reservations, setReservations] = useState({
    tickets: [],
    tables: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchReservationData = async (isRefresh = false) => {
    if (!userInfo?._id) return;

    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      const [ticketRes, tableRes] = await Promise.all([
        axios.get(`${SERVER_URL}/booking/tickets/${userInfo._id}`),
        axios.get(`${SERVER_URL}/booking/table/${userInfo._id}`)
      ]);



      setReservations({
        tickets: ticketRes.data?.ticket ? [ticketRes.data.ticket] : [],
        tables: Array.isArray(tableRes.data) ? tableRes.data : []
      });
    } catch (err) {
      console.error('Error fetching reservation data:', err);
      setError('Failed to load reservations. Please try again.');
      Alert.alert('Error', 'Failed to load reservations. Please try again.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReservationData();
  }, [userInfo]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservationData(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#dcfce7', text: '#166534' };
      case 'pending':
        return { bg: '#fef3c7', text: '#92400e' };
      default:
        return { bg: '#fee2e2', text: '#991b1b' };
    }
  };

  const TicketCard = ({ ticket }) => {
    const statusColors = getStatusColor(ticket.status);
    
    return (
      <View style={styles.ticketCard}>
        {/* Decorative circles */}
        <View style={[styles.decorativeCircle, styles.leftCircle]} />
        <View style={[styles.decorativeCircle, styles.rightCircle]} />
        
        {/* Header */}
        <View style={styles.cardHeader}>
          <Ionicons name="ticket-outline" size={20} color="#0f766e" />
          <Text style={styles.cardTitle}>Your Ticket</Text>
        </View>

        {/* Ticket Number */}
        <View style={styles.ticketNumberContainer}>
          <Text style={styles.ticketNumberLabel}>Ticket Number</Text>
          <Text style={styles.ticketNumber}>#{ticket.ticketNumber}</Text>
        </View>

        {/* Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={14} color="#9ca3af" />
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Name:</Text> {ticket.name}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={14} color="#9ca3af" />
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>People:</Text> {ticket.numberOfPeople}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={14} color="#9ca3af" />
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Phone:</Text> {ticket.phone}
            </Text>
          </View>

          {ticket.dateString && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Date:</Text> {formatDate(ticket.dateString)}
              </Text>
            </View>
          )}

          {ticket.storeId && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color="#9ca3af" />
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Store:</Text> {
                  typeof ticket.storeId === 'object' 
                    ? (ticket.storeId.storeName || ticket.storeId.name || `Store ID: ${ticket.storeId._id || 'Unknown'}`)
                    : ticket.storeId
                }
              </Text>
            </View>
          )}

          {ticket.type && (
            <View style={styles.detailRow}>
              <Ionicons name="card-outline" size={14} color="#9ca3af" />
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Type:</Text> {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)}
              </Text>
            </View>
          )}

          {/* Status and Payment */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {ticket.status}
              </Text>
            </View>
            {ticket.isPaid && (
              <View style={styles.paymentBadge}>
                <Text style={styles.paymentText}>
                  Paid: ₹{ticket.paymentAmount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.ticketFooter}>
          <Text style={styles.footerText}>Show this at the counter</Text>
        </View>
      </View>
    );
  };

  const TableCard = ({ table }) => {
    const statusColors = getStatusColor(table.status);
    
    return (
      <View style={styles.tableCard}>
        {/* Decorative circles */}
        <View style={[styles.decorativeCircle, styles.leftCircle]} />
        <View style={[styles.decorativeCircle, styles.rightCircle]} />
        
        {/* Header */}
        <View style={styles.cardHeader}>
          <Ionicons name="restaurant-outline" size={20} color="#4338ca" />
          <Text style={[styles.cardTitle, { color: '#4338ca' }]}>Table Reservation</Text>
        </View>

        {/* Table Number */}
        {table.tableNumber && (
          <View style={styles.ticketNumberContainer}>
            <Text style={[styles.ticketNumberLabel, { color: '#6366f1' }]}>Table Number</Text>
            <Text style={[styles.ticketNumber, { color: '#312e81' }]}>{table.tableNumber}</Text>
          </View>
        )}

        {/* Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={14} color="#9ca3af" />
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Name:</Text> {table.name}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={14} color="#9ca3af" />
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>People:</Text> {table.numberOfPeople}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={14} color="#9ca3af" />
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Phone:</Text> {table.phone}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color="#9ca3af" />
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Date:</Text> {formatDate(table.reservationDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={14} color="#9ca3af" />
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Time:</Text> {table.timeSlot || "Not specified"}
            </Text>
          </View>

          {table.storeId && (
            <>
              <View style={styles.detailRow}>
                <Ionicons name="storefront-outline" size={14} color="#9ca3af" />
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Store:</Text> {table.storeId.storeName}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={14} color="#9ca3af" />
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Location:</Text> {table.storeId.place}
                </Text>
              </View>
            </>
          )}

          {table.note && (
            <View style={styles.detailRow}>
              <Ionicons name="alert-circle-outline" size={14} color="#9ca3af" />
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>Note:</Text> {table.note}
              </Text>
            </View>
          )}

          {/* Status */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {table.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.ticketFooter, { borderTopColor: '#a5b4fc' }]}>
          <Text style={[styles.footerText, { color: '#4338ca' }]}>Show this at the venue</Text>
        </View>
      </View>
    );
  };

  const EmptyState = ({ type }) => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={
          type === 'tickets' ? 'ticket-outline' : 
          type === 'tables' ? 'restaurant-outline' : 
          'calendar-outline'
        } 
        size={48} 
        color="#9ca3af" 
      />
      <Text style={styles.emptyTitle}>
        No {type === 'all' ? 'reservations' : type} found
      </Text>
      <Text style={styles.emptySubtitle}>
        {type === 'tickets' ? 'Book now to get your ticket' : 
         type === 'tables' ? 'Reserve a table to see it here' :
         "You haven't made any reservations yet"}
      </Text>
    </View>
  );

  const allReservations = [
    ...reservations.tickets.map(ticket => ({ ...ticket, type: 'ticket' })),
    ...reservations.tables.map(table => ({ ...table, type: 'table' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getFilteredReservations = () => {
    switch (activeTab) {
      case 'tickets':
        return reservations.tickets.map(ticket => ({ ...ticket, type: 'ticket' }));
      case 'tables':
        return reservations.tables.map(table => ({ ...table, type: 'table' }));
      default:
        return allReservations;
    }
  };

  const filteredReservations = getFilteredReservations();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Reservations</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d9488" />
          <Text style={styles.loadingText}>Loading reservations...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reservations</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All ({allReservations.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tickets' && styles.activeTab]}
          onPress={() => setActiveTab('tickets')}
        >
          <Text style={[styles.tabText, activeTab === 'tickets' && styles.activeTabText]}>
            Tickets ({reservations.tickets.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tables' && styles.activeTab]}
          onPress={() => setActiveTab('tables')}
        >
          <Text style={[styles.tabText, activeTab === 'tables' && styles.activeTabText]}>
            Tables ({reservations.tables.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredReservations.length === 0 ? (
          <EmptyState type={activeTab} />
        ) : (
          filteredReservations.map((reservation) => 
            reservation.type === 'ticket' ? (
              <TicketCard key={`ticket-${reservation._id}`} ticket={reservation} />
            ) : (
              <TableCard key={`table-${reservation._id}`} table={reservation} />
            )
          )
        )}

        {/* Summary */}
        {filteredReservations.length > 0 && (
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              Showing {filteredReservations.length} {activeTab === 'all' ? 'reservation' : activeTab}
              {filteredReservations.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0d9488',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#0d9488',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  ticketCard: {
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    marginBottom: 16,
    padding: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  tableCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    top: '50%',
    marginTop: -8,
  },
  leftCircle: {
    left: -8,
  },
  rightCircle: {
    right: -8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
    marginLeft: 8,
  },
  ticketNumberContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ticketNumberLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0d9488',
    marginBottom: 4,
  },
  ticketNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#134e4a',
    letterSpacing: 2,
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#4b5563',
    marginLeft: 8,
    flex: 1,
  },
  detailLabel: {
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  paymentBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1d4ed8',
  },
  ticketFooter: {
    borderTopWidth: 1,
    borderTopColor: '#5eead4',
    paddingTop: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#0f766e',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  summary: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  summaryText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default UserReservationsScreen;