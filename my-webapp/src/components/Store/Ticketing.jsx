import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Ticket, Users, Calendar, Settings, Check, X, AlertCircle, Loader2, RefreshCw, Clock, IndianRupee, User } from 'lucide-react';
import axios from 'axios';
import { SERVER_URL } from '../../Config';
import toast from 'react-hot-toast';
import SlotManager from './TimeSlots';
import SlotPicker from './TimeSlots';

const ServiceManagementPage = ({ store }) => {
  const [services, setServices] = useState({
    ticketing: { active: false, type: 'free', price: '', refundable: false },
    liveWalking: { active: false, type: 'free', price: '', refundable: false },
    reservation: { active: false }
  });
  const [showAddWalkingForm, setShowAddWalkingForm] = useState(false);
  const [walkingName, setWalkingName] = useState('');
  const [walkingPhone, setWalkingPhone] = useState('');
  const [walkingPersons, setWalkingPersons] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [addingWalking, setAddingWalking] = useState(false);
  const [showTicketingModal, setShowTicketingModal] = useState(false);
  const [showWalkingModal, setShowWalkingModal] = useState(false);
  const [tempTicketingSettings, setTempTicketingSettings] = useState({
    type: 'free',
    price: '',
    refundable: false
  });
  const [tempWalkingSettings, setTempWalkingSettings] = useState({
    type: 'free',
    price: '',
    refundable: false
  });

  const [loading, setLoading] = useState({
    ticketing: false,
    liveWalking: false,
    reservation: false
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Booking tickets state
  const [bookingTickets, setBookingTickets] = useState({
    online: [],
    walking: [],
    reservation: []
  });
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });

  // Initialize services from store data on component mount
  useEffect(() => {
    if (store) {
      setServices({
        ticketing: {
          active: store.onlineTicketing?.active || false,
          type: store.onlineTicketing?.type || 'free',
          price: store.onlineTicketing?.price || '',
          refundable: store.onlineTicketing?.refundable || false
        },
        liveWalking: {
          active: store.walkingTicketing?.active || false,
          type: store.walkingTicketing?.type || 'free',
          price: store.walkingTicketing?.price || '',
          refundable: store.walkingTicketing?.refundable || false
        },
        reservation: {
          active: store.tableBooking?.active || false
        }
      });
    }
  }, [store]);


  const handleAddWalkingCustomer = async () => {
    if (!walkingName || !walkingPhone || walkingPersons <= 0) {
      setError("Please fill all fields correctly.");
      return;
    }
  
    try {
      setAddingWalking(true);
      const response = await axios.post(`${SERVER_URL}/booking/walk-in`, {
        storeId: store._id,
        name: walkingName,
        phone: walkingPhone,
        numberOfPeople: walkingPersons
      });
  
      setSuccess("Walk-in ticket created successfully!");
      setShowAddWalkingForm(false);
      setWalkingName('');
      setWalkingPhone('');
      setWalkingPersons(1);
      fetchBookingTickets(); // refresh tickets list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create walk-in ticket.");
    } finally {
      setAddingWalking(false);
    }
  };

  
  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Fetch booking tickets
  const fetchBookingTickets = async (date = selectedDate) => {
    if (!store?._id) return;
  
    setTicketsLoading(true);
    setTicketsError(null);
  
    try {
      // helper to fetch a specific category
      const fetchCategory = async (category) => {
        const response = await axios.get(`${SERVER_URL}/booking/${store._id}`, {
          params: { date, category },
          timeout: 15000
        });

        if (response.data && Array.isArray(response.data.tickets)) {
          return response.data.tickets;
        }
        return [];
      };
  
      // fetch both categories in parallel
      const [onlineTickets, walkingTickets] = await Promise.all([
        fetchCategory("online"),
        fetchCategory("walk-in")
      ]);
  
      // if you have reservation tickets coming from somewhere else, handle that too
      setBookingTickets({
        online: onlineTickets,
        walking: walkingTickets,
        reservation: [] // if needed, fetch separately
      });
  
    } catch (error) {
      console.error("Error fetching booking tickets:", error);
      let errorMessage = 'Failed to load booking tickets. ';
      if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out.';
      } else if (error.response?.status === 404) {
        errorMessage += 'No tickets found for this date.';
        setBookingTickets({ online: [], walking: [], reservation: [] });
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += 'Please try again.';
      }
      setTicketsError(errorMessage);
    } finally {
      setTicketsLoading(false);
    }
  };
  
  

  // Fetch tickets when component mounts or date changes
  useEffect(() => {
    if (store?._id) {
      fetchBookingTickets();
    }
  }, [store?._id, selectedDate]);

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const updateTicketStatusAPI = async (ticketId, newStatus) => {
    try {
      const response = await axios.put(
        `${SERVER_URL}/booking/${ticketId}/status`,
        { status: newStatus },
        { timeout: 15000 }
      );
  
      toast.success(`Status updated to "${newStatus}"`);
      fetchBookingTickets(selectedDate); 
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update ticket status"
      );
      throw error;
    }
  };
  // Function to update backend with better error handling
  const updateServiceStatus = async (service, updatedData) => {
    if (!store?._id) {
      setError('Store information not available');
      return false;
    }

    setLoading(prev => ({ ...prev, [service]: true }));
    setError(null);

    try {
      let endpoint = '';
      let serviceName = '';

      switch (service) {
        case 'ticketing':
          endpoint = `${SERVER_URL}/stores/${store._id}/online-ticketing`;
          serviceName = 'Online Ticketing';
          break;
        case 'liveWalking':
          endpoint = `${SERVER_URL}/stores/${store._id}/walking-ticketing`;
          serviceName = 'Live Walking Customers';
          break;
        case 'reservation':
          endpoint = `${SERVER_URL}/stores/${store._id}/table-booking`;
          serviceName = 'Reservation System';
          break;
        default:
          throw new Error('Invalid service type');
      }

      const response = await axios.put(endpoint, updatedData, {
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.data) {
        // Update local state with server response
        setServices(prev => ({
          ...prev,
          [service]: { ...prev[service], ...updatedData }
        }));

        setSuccess(`${serviceName} ${updatedData.active ? 'activated' : 'deactivated'} successfully!`);
        return true;
      }
    } catch (error) {
      console.error(`Error updating ${service}:`, error);
      
      let errorMessage = 'Failed to update service. ';
      if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out. Please try again.';
      } else if (error.response?.status === 404) {
        errorMessage += 'Store not found.';
      } else if (error.response?.status === 401) {
        errorMessage += 'You are not authorized to perform this action.';
      } else if (error.response?.status >= 500) {
        errorMessage += 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += 'Please check your connection and try again.';
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, [service]: false }));
    }
  };

  // Enhanced toggle logic
  const handleServiceToggle = async (service) => {
    if (loading[service]) return;

    if (service === 'ticketing') {
      if (!services.ticketing.active) {
        setTempTicketingSettings({
          type: services.ticketing.type || 'free',
          price: services.ticketing.price || '',
          refundable: services.ticketing.refundable || false
        });
        setShowTicketingModal(true);
      } else {
        await updateServiceStatus('ticketing', { active: false });
      }
    } else if (service === 'liveWalking') {
      if (!services.liveWalking.active) {
        setTempWalkingSettings({
          type: services.liveWalking.type || 'free',
          price: services.liveWalking.price || '',
          refundable: services.liveWalking.refundable || false
        });
        setShowWalkingModal(true);
      } else {
        await updateServiceStatus('liveWalking', { active: false });
      }
    } else if (service === 'reservation') {
      await updateServiceStatus('reservation', { active: !services.reservation.active });
    }
  };

  const handleTicketingConfirm = async () => {
    const isValid = tempTicketingSettings.type === 'free' || 
                   (tempTicketingSettings.type === 'paid' && tempTicketingSettings.price && parseFloat(tempTicketingSettings.price) > 0);
    
    if (!isValid) {
      setError('Please enter a valid price for paid tickets.');
      return;
    }

    const success = await updateServiceStatus('ticketing', {
      active: true,
      ...tempTicketingSettings,
      price: tempTicketingSettings.type === 'paid' ? tempTicketingSettings.price : ''
    });

    if (success) {
      setShowTicketingModal(false);
      setTempTicketingSettings({ type: 'free', price: '', refundable: false });
    }
  };

  const handleWalkingConfirm = async () => {
    const isValid = tempWalkingSettings.type === 'free' || 
                   (tempWalkingSettings.type === 'paid' && tempWalkingSettings.price && parseFloat(tempWalkingSettings.price) > 0);
    
    if (!isValid) {
      setError('Please enter a valid price for paid walking tickets.');
      return;
    }

    const success = await updateServiceStatus('liveWalking', {
      active: true,
      ...tempWalkingSettings,
      price: tempWalkingSettings.type === 'paid' ? tempWalkingSettings.price : ''
    });

    if (success) {
      setShowWalkingModal(false);
      setTempWalkingSettings({ type: 'free', price: '', refundable: false });
    }
  };

  const handleModalCancel = (modalType) => {
    if (modalType === 'ticketing') {
      setShowTicketingModal(false);
      setTempTicketingSettings({ type: 'free', price: '', refundable: false });
    } else if (modalType === 'walking') {
      setShowWalkingModal(false);
      setTempWalkingSettings({ type: 'free', price: '', refundable: false });
    }
  };

  // Notification Component
  const NotificationBar = ({ type, message, onClose }) => (
    <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-xl shadow-2xl transition-all duration-300 ${
      type === 'error' 
        ? 'bg-red-500 text-white border-l-4 border-red-700' 
        : 'bg-green-500 text-white border-l-4 border-green-700'
    }`}>
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <X size={16} />
        </button>
      </div>
    </div>
  );

  // Enhanced Service Card Component
  const ServiceCard = ({ title,  icon: Icon, active, onToggle, details, isLoading, hasConfiguration = false }) => (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl hover:transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl transition-all duration-300 relative ${
            active 
              ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {isLoading ? (
              <Loader2 size={28} className="animate-spin" />
            ) : (
              <Icon size={28} />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
           {hasConfiguration && (
              <p className="text-xs text-teal-600 font-medium mt-1">Click to configure</p>
            )}
          </div>
        </div>
        <button
          onClick={onToggle}
          disabled={isLoading}
          className={`p-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
            active 
              ? 'text-teal-500 hover:bg-teal-50 bg-teal-50' 
              : 'text-gray-400 hover:bg-gray-100'
          }`}
        >
          {active ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
        </button>
      </div>
      
      <div className={`transition-all duration-300 ${active ? 'opacity-100' : 'opacity-60'}`}>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
          active 
            ? 'bg-gradient-to-r from-teal-400 to-teal-500 text-white shadow-md' 
            : 'bg-gray-200 text-gray-600'
        }`}>
          {active ? <Check size={16} /> : <X size={16} />}
          {isLoading ? 'Updating...' : (active ? 'Active' : 'Inactive')}
        </div>
        
        {details && active && !isLoading && (
          <div className="mt-6 p-5 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl border-l-4 border-teal-400">
            {details}
          </div>
        )}
      </div>
    </div>
  );

  // Service details components
  const getServiceDetails = (serviceKey) => {
    const service = services[serviceKey];
    if (!service.active) return null;

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">Type:</span>
          <span className={`font-bold px-3 py-1 rounded-full text-sm ${
            service.type === 'paid' 
              ? 'bg-teal-600 text-white' 
              : 'bg-gray-600 text-white'
          }`}>
            {service.type?.toUpperCase() || 'FREE'}
          </span>
        </div>
        {service.type === 'paid' && service.price && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Price:</span>
              <span className="font-bold text-teal-600 text-lg">₹{service.price}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Refundable:</span>
              <span className={`font-bold ${service.refundable ? 'text-teal-600' : 'text-gray-500'}`}>
                {service.refundable ? 'Yes' : 'No'}
              </span>
            </div>
          </>
        )}
        
      </div>
    );
  };

// Compact Ticket Row Component
const TicketRow = ({ ticket, category }) => {
    const getCategoryIcon = (cat) => {
      switch (cat) {
        case 'online':
          return <Ticket size={14} className="text-teal-600" />;
        case 'walking':
          return <Users size={14} className="text-blue-600" />;
        case 'reservation':
          return <Calendar size={14} className="text-purple-600" />;
        default:
          return <Ticket size={14} className="text-gray-600" />;
      }
    };
    const getStatusBadge = (status) => {
        switch (status) {
          case 'pending':
            return (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full">
                Pending
              </span>
            );
          case 'completed':
            return (
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                Completed
              </span>
            );
          default:
            return null;
        }
      };
  
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all duration-200 mb-2">
        <div className="flex items-center justify-between">
          {/* Left side - Ticket info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getCategoryIcon(category)}
              <span className="font-semibold text-gray-800 text-sm">
                #{ticket.ticketNumber || ticket._id?.slice(-6) || 'N/A'}
              </span>
              {getStatusBadge(ticket.status)}
            </div>
            <div className="font-medium text-gray-900 text-sm truncate">
              {ticket.name || ticket.customerName || 'Unknown'}
            </div>
            <div className=" text-gray-500 mt-1">
            <span className="text-gray-500">
                👥 {ticket.numberOfPeople || 1}
              </span>
              </div>
            {ticket.phone && (
              <div className="text-xs text-gray-500 mt-1">
                📱 {ticket.phone}
              </div>
            )}
          </div>
  
          {/* Right side - Action buttons */}
          <div className="flex gap-2 ml-3">
          {ticket.status === 'confirmed' && (
            <>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded"
                onClick={() => updateTicketStatusAPI(ticket._id, 'completed')}
              >
                Done
              </button>
              <button
                className="bg-yellow-500 text-white px-3 py-1 rounded"
                onClick={() => updateTicketStatusAPI(ticket._id, 'pending')}
              >
                Pending
              </button>
            </>
          )}

          {ticket.status === 'pending' && (
            <button
              className="bg-green-500 text-white px-3 py-1 rounded"
              onClick={() => updateTicketStatusAPI(ticket._id, 'completed')}
            >
              Done
            </button>
          )}
        </div>
        </div>
      </div>
    );
  };
  
  // Alternative Ultra-Compact Row (even smaller)
  const TicketRowCompact = ({ ticket, category }) => {
    const getCategoryIcon = (cat) => {
      switch (cat) {
        case 'online':
          return <Ticket size={12} className="text-teal-600" />;
        case 'walking':
          return <Users size={12} className="text-blue-600" />;
        case 'reservation':
          return <Calendar size={12} className="text-purple-600" />;
        default:
          return <Ticket size={12} className="text-gray-600" />;
      }
    };
  
    return (
      <div className="bg-white border border-gray-200 rounded-md p-2 hover:shadow-sm transition-all duration-200 mb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getCategoryIcon(category)}
            <span className="font-semibold text-xs text-gray-800">
              #{ticket.ticketNumber || ticket._id?.slice(-6)}
            </span>
            <span className="font-medium text-xs text-gray-900 truncate">
              {ticket.name || ticket.customerName || 'Unknown'}
            </span>
            <span className="text-xs text-gray-500">
              ({ticket.numberOfPeople || 1})
            </span>
            <span className="text-xs text-gray-400 truncate">
              {ticket.phone}
            </span>
          </div>
          <div className="flex gap-1 ml-2">
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
              onClick={() => console.log("Mark as Done", ticket._id)}
            >
              ✓
            </button>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
              onClick={() => console.log("Mark as Pending", ticket._id)}
            >
              ⏸
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Updated Tickets Section Component
  const TicketsSection = ({ title, tickets, category, icon: Icon, emptyMessage }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white rounded-md shadow-sm">
              <Icon size={16} className="text-teal-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base">{title}</h3>
              <p className="text-xs text-gray-600">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="text-xl font-bold text-teal-600">{tickets.length}</div>
        </div>
      </div>
             
      <div className="p-4">
        {tickets.length > 0 ? (
          <div className="space-y-1">
            {tickets.map((ticket, index) => (
              <TicketRow 
                key={ticket._id || ticket.ticketNumber || index}
                ticket={ticket}
                category={category}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Icon size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">{emptyMessage}</p>
            <p className="text-xs mt-1">Tickets will appear here when customers make bookings.</p>
          </div>
        )}
      </div>
    </div>
  );
  // Configuration Modal Component
  const ConfigurationModal = ({ show, onClose, onConfirm, settings, setSettings, title, type }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-6 text-white">
            <h3 className="text-2xl font-bold">Configure {title}</h3>
            <p className="text-teal-100 mt-1">Set up your pricing and policies</p>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              {/* Service Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-4">
                  Service Type
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, type: 'free', price: '' }))}
                    className={`flex-1 py-4 px-6 rounded-xl border-2 font-semibold transition-all duration-300 ${
                      settings.type === 'free'
                        ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-teal-100 text-teal-700 shadow-lg'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    FREE
                  </button>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, type: 'paid' }))}
                    className={`flex-1 py-4 px-6 rounded-xl border-2 font-semibold transition-all duration-300 ${
                      settings.type === 'paid'
                        ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-teal-100 text-teal-700 shadow-lg'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    PAID
                  </button>
                </div>
              </div>

              {/* Price (only for paid) */}
              {settings.type === 'paid' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={settings.price}
                        onChange={(e) => setSettings(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="Enter amount"
                        className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all duration-300 font-semibold text-lg"
                        autoFocus
                      />
                    </div>
                    {settings.price && parseFloat(settings.price) <= 0 && (
                      <p className="text-red-500 text-sm mt-2">Price must be greater than 0</p>
                    )}
                  </div>

                  {/* Refundable */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={settings.refundable}
                          onChange={(e) => setSettings(prev => ({ ...prev, refundable: e.target.checked }))}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 ${
                          settings.refundable 
                            ? 'bg-teal-500 border-teal-500' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {settings.refundable && (
                            <Check size={16} className="text-white absolute top-0.5 left-0.5" />
                          )}
                        </div>
                      </div>
                      <span className="font-semibold text-gray-700">Make refundable</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={onClose}
                className="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={settings.type === 'paid' && (!settings.price || parseFloat(settings.price) <= 0)}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed shadow-lg"
              >
                Activate Service
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-teal-500 mb-4 mx-auto" />
          <p className="text-gray-600 font-medium">Loading store information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
      {/* Notifications */}
      {error && <NotificationBar type="error" message={error} onClose={() => setError(null)} />}
      {success && <NotificationBar type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl shadow-xl">
                <Calendar size={40} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent">
                  Reservations Tickets
                </h1>
                </div>
            </div>
      
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6">
        {/* Services Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <ServiceCard
            title="Online Ticketing"
            icon={Ticket}
            active={services.ticketing.active}
            onToggle={() => handleServiceToggle('ticketing')}
            details={getServiceDetails('ticketing')}
            isLoading={loading.ticketing}
            hasConfiguration={true}
          />
          
          <ServiceCard
            title="Live Walking Customers"
            icon={Users}
            active={services.liveWalking.active}
            onToggle={() => handleServiceToggle('liveWalking')}
            details={getServiceDetails('liveWalking')}
            isLoading={loading.liveWalking}
            hasConfiguration={true}
          />
          
          <ServiceCard
    title="Table Reservation"
    icon={Calendar}
    active={services.reservation.active}
    onToggle={() => handleServiceToggle('reservation')}
    isLoading={loading.reservation}
  />

</div>

<div className="max-w-4xl mx-auto px-4">
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Heading */}
      <h2 className="text-2xl font-bold text-gray-900">
        Manage Time Slot for Table Reservation
      </h2>

      {/* Edit Slots Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm font-medium"
      >
        <Settings size={18} />
        Edit Slots
      </button>
    </div>
  </div>
</div>


        {/* Booking Tickets Section */}
        <div className="mb-8">
          {/* Date Selector and Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Tickets</h2>
                <p className="text-gray-600">View and manage all booking tickets by date and category</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-gray-500" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-700 font-medium"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <button
                  onClick={() => fetchBookingTickets()}
                  disabled={ticketsLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={16} className={ticketsLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200">
                <div className="text-teal-600 text-sm font-semibold">Total Tickets</div>
                <div className="text-2xl font-bold text-teal-700">
                  {bookingTickets.online.length + bookingTickets.walking.length + bookingTickets.reservation.length}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="text-blue-600 text-sm font-semibold">Online Tickets</div>
                <div className="text-2xl font-bold text-blue-700">{bookingTickets.online.length}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <div className="text-green-600 text-sm font-semibold">Walking Customers</div>
                <div className="text-2xl font-bold text-green-700">{bookingTickets.walking.length}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <div className="text-purple-600 text-sm font-semibold">Reservations</div>
                <div className="text-2xl font-bold text-purple-700">{bookingTickets.reservation.length}</div>
              </div>
            </div>
         {/* Add Walk-in Customer Button */}
<div className="mt-6 flex justify-end">
  <button
    className="bg-black text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition-colors"
    onClick={() => setShowAddWalkingForm(true)}
  >
    + Add Walk-in Customer
  </button>
</div>

          </div>
          

          {/* Tickets Error */}
          {ticketsError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle size={20} />
                <span className="font-semibold">Error loading tickets</span>
              </div>
              <p className="text-red-600 mt-1">{ticketsError}</p>
            </div>
          )}

          {/* Loading State */}
          {ticketsLoading && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 mb-6">
              <div className="text-center">
                <Loader2 size={48} className="animate-spin text-teal-500 mb-4 mx-auto" />
                <p className="text-gray-600 font-medium">Loading booking tickets...</p>
              </div>
            </div>
          )}

{showAddWalkingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Add Walk-in Customer</h2>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

            <input
              type="text"
              placeholder="Customer Name"
              value={walkingName}
              onChange={(e) => setWalkingName(e.target.value)}
              className="border p-2 rounded w-full mb-3"
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={walkingPhone}
              onChange={(e) => setWalkingPhone(e.target.value)}
              className="border p-2 rounded w-full mb-3"
            />

            <input
              type="number"
              placeholder="Number of Persons"
              value={walkingPersons}
              min="1"
              onChange={(e) => setWalkingPersons(Number(e.target.value))}
              className="border p-2 rounded w-full mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setShowAddWalkingForm(false)}
                disabled={addingWalking}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-blue-700"
                onClick={handleAddWalkingCustomer}
                disabled={addingWalking}
              >
                {addingWalking ? "Adding..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showModal && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
    onClick={() => setShowModal(false)}
  >
    <div 
      className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden relative"
      onClick={(e) => e.stopPropagation()}
    >
      <SlotPicker isModal={true} onClose={() => setShowModal(false)} store={store}  />
    </div>
  </div>
)}

   
          {/* Tickets Grid */}
          {!ticketsLoading && !ticketsError && (
            <div className="grid lg:grid-cols-3 gap-6">
              <TicketsSection
                title="Online Ticketing"
                tickets={bookingTickets.online}
                category="online"
                icon={Ticket}
                emptyMessage="No online tickets for this date"
              />
              
              <TicketsSection
                title="Walking Customers"
                tickets={bookingTickets.walking}
                category="walking"
                icon={Users}
                emptyMessage="No walking customers for this date"
              />
              
              <TicketsSection
                title="Table Reservations"
                tickets={bookingTickets.reservation}
                category="reservation"
                icon={Calendar}
                emptyMessage="No reservations for this date"
              />
            </div>
          )}
        </div>
      </div>

      {/* Configuration Modals */}
      <ConfigurationModal
        show={showTicketingModal}
        onClose={() => handleModalCancel('ticketing')}
        onConfirm={handleTicketingConfirm}
        settings={tempTicketingSettings}
        setSettings={setTempTicketingSettings}
        title="Online Ticketing"
        type="ticketing"
      />

      <ConfigurationModal
        show={showWalkingModal}
        onClose={() => handleModalCancel('walking')}
        onConfirm={handleWalkingConfirm}
        settings={tempWalkingSettings}
        setSettings={setTempWalkingSettings}
        title="Live Walking Customers"
        type="walking"
      />

    </div>
  );
};

export default ServiceManagementPage;