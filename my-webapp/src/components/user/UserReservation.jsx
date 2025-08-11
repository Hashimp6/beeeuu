import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, User, Phone, MapPin, Hash, CreditCard, CheckCircle, XCircle, AlertCircle, Ticket, Users, Store } from 'lucide-react';
import axios from 'axios';
import { SERVER_URL } from '../../Config';
import { useAuth } from '../../context/UserContext';

const UserReservationComponent = ({ setHistory }) => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState({
    tickets: [],
    tables: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchReservationData = async () => {
      if (!user?._id) return;

      setLoading(true);
      setError(null);

      try {
        const [ticketRes, tableRes] = await Promise.all([
          axios.get(`${SERVER_URL}/booking/tickets/${user._id}`),
          axios.get(`${SERVER_URL}/booking/table/${user._id}`)
        ]);

        console.log('Ticket:', ticketRes.data);
        console.log('Table:', tableRes.data);

        setReservations({
          tickets: ticketRes.data?.ticket ? [ticketRes.data.ticket] : [],
          tables: Array.isArray(tableRes.data) ? tableRes.data : []
        });
      } catch (err) {
        console.error('Error fetching reservation data:', err);
        setError('Failed to load reservations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservationData();
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const TicketCard = ({ ticket }) => (
    <div className="relative bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg shadow-md px-4 py-5 w-full sm:w-[280px]">
      {/* Decorative ticket edges */}
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-sm"></div>
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-sm"></div>
      
      {/* Ticket Title */}
      <div className="flex items-center justify-center mb-3">
        <Ticket className="w-5 h-5 text-teal-700 mr-2" />
        <h3 className="text-sm font-semibold text-teal-800">Your Ticket</h3>
      </div>

      {/* Ticket Number */}
      <div className="text-center mb-3">
        <span className="block text-teal-600 text-xs font-medium">Ticket Number</span>
        <span className="text-3xl font-extrabold text-teal-900 tracking-wider">
          #{ticket.ticketNumber}
        </span>
      </div>

      {/* Ticket Details */}
      <div className="bg-white rounded-lg p-3 text-xs text-gray-600 space-y-2">
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400 flex-shrink-0" />
          <span><strong>Name:</strong> {ticket.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Hash size={14} className="text-gray-400 flex-shrink-0" />
          <span><strong>People:</strong> {ticket.numberOfPeople}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-gray-400 flex-shrink-0" />
          <span><strong>Phone:</strong> {ticket.phone}</span>
        </div>
        {ticket.dateString && (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400 flex-shrink-0" />
            <span><strong>Date:</strong> {formatDate(ticket.dateString)}</span>
          </div>
        )}
        {ticket.storeId && (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-gray-400 flex-shrink-0" />
            <span><strong>Store:</strong> {
              typeof ticket.storeId === 'object' 
                ? (ticket.storeId.storeName || ticket.storeId.name || `Store ID: ${ticket.storeId._id || 'Unknown'}`)
                : ticket.storeId
            }</span>
          </div>
        )}
        {ticket.type && (
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-gray-400 flex-shrink-0" />
            <span><strong>Type:</strong> {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)}</span>
          </div>
        )}
        
        {/* Status and Payment */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              ticket.status === 'confirmed'
                ? 'bg-green-100 text-green-700'
                : ticket.status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {ticket.status}
          </span>
          {ticket.isPaid && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              Paid: ₹{ticket.paymentAmount}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 border-t border-teal-300 pt-2 text-center">
        <span className="text-[10px] text-teal-700 font-medium">Show this at the counter</span>
      </div>
    </div>
  );

  const TableCard = ({ table }) => (
    <div className="relative bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg shadow-md px-4 py-5 w-full sm:w-[300px]">
      {/* Decorative edges */}
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-sm"></div>
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-sm"></div>

      {/* Title */}
      <div className="flex items-center justify-center mb-3">
        <Users className="w-5 h-5 text-indigo-700 mr-2" />
        <h3 className="text-sm font-semibold text-indigo-800">Your Table Reservation</h3>
      </div>

      {/* Table Number (if available) */}
      {table.tableNumber && (
        <div className="text-center mb-3">
          <span className="block text-indigo-600 text-xs font-medium">Table Number</span>
          <span className="text-2xl font-extrabold text-indigo-900 tracking-wider">
            {table.tableNumber}
          </span>
        </div>
      )}

      {/* Details */}
      <div className="bg-white rounded-lg p-3 text-xs text-gray-600 space-y-2">
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400 flex-shrink-0" />
          <span><strong>Name:</strong> {table.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Hash size={14} className="text-gray-400 flex-shrink-0" />
          <span><strong>People:</strong> {table.numberOfPeople}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-gray-400 flex-shrink-0" />
          <span><strong>Phone:</strong> {table.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400 flex-shrink-0" />
          <span><strong>Date:</strong> {formatDate(table.reservationDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400 flex-shrink-0" />
          <span><strong>Time:</strong> {table.timeSlot || "Not specified"}</span>
        </div>
        {table.storeId && (
          // Store name separately
<div className="flex items-center gap-2">
  <Store size={14} className="text-gray-400 flex-shrink-0" />
  <span><strong>Store:</strong> {table.storeId.storeName}</span>
</div>

        )}
         {table.storeId && (
          // Store name separately
<div className="flex items-center gap-2">
  <MapPin size={14} className="text-gray-400 flex-shrink-0" />
  <span><strong>Location:</strong> {table.storeId.place}</span>
</div>


        )}
        
        {table.note && (
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <span><strong>Note:</strong> {table.note}</span>
          </div>
        )}
        
        {/* Status */}
        <div className="flex items-center gap-2 mt-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              table.status === 'confirmed'
                ? 'bg-green-100 text-green-700'
                : table.status === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {table.status}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 border-t border-indigo-300 pt-2 text-center">
        <span className="text-[10px] text-indigo-700 font-medium">Show this at the venue</span>
      </div>
    </div>
  );

  const EmptyState = ({ type }) => (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center text-gray-500 w-full max-w-sm mx-auto">
      <div className="mb-3">
        {type === 'tickets' ? (
          <Ticket size={32} className="mx-auto text-gray-400" />
        ) : type === 'tables' ? (
          <Users size={32} className="mx-auto text-gray-400" />
        ) : (
          <Calendar size={32} className="mx-auto text-gray-400" />
        )}
      </div>
      <p className="text-sm font-medium mb-1">
        No {type === 'all' ? 'reservations' : type} found
      </p>
      <p className="text-xs">
        {type === 'tickets' ? 'Book now to get your ticket' : 
         type === 'tables' ? 'Reserve a table to see it here' :
         "You haven't made any reservations yet"}
      </p>
    </div>
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white shadow-xl border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setHistory(null)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">My Reservations</h1>
            </div>
            
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <span className="ml-3 text-gray-600">Loading reservations...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white shadow-xl border border-gray-200 rounded-2xl p-6">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setHistory && setHistory(null)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">My Reservations</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle size={16} className="text-red-500" />
                <p className="text-red-600 font-medium">Error</p>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-6 mb-8 border-b border-gray-200 pb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All Reservations ({allReservations.length})
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === 'tickets'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Tickets ({reservations.tickets.length})
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === 'tables'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Table Reservations ({reservations.tables.length})
            </button>
          </div>

          {/* Reservations Display */}
          <div className="flex flex-wrap gap-6 justify-center">
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
          </div>

          {/* Summary */}
          {filteredReservations.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Showing {filteredReservations.length} {activeTab === 'all' ? 'reservation' : activeTab}{filteredReservations.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReservationComponent;