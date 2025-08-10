import React, { useEffect, useState } from 'react';
import { Clock, Users, CreditCard, CheckCircle, XCircle, Phone, User, AlertCircle, Calendar, RefreshCw, DollarSign, MapPin, ArrowLeft, Loader } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SERVER_URL } from '../../Config';
import { useAuth } from '../../context/UserContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const CustomerBookingPage = () => {
    const navigate = useNavigate();
    const {user}=useAuth()
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

  // Get store data from location state (as in your original code)
  const location = useLocation();
  const tempStore = location.state?.store;
  const storeId=tempStore._id

  const fetchStoreDetails = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/stores/${storeId}`);
    setStore(response.data.store);
    } catch (error) {
      console.error("Error fetching store data:", error);
      toast.error("Failed to fetch store information.");
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
    // Initial fetch
    fetchCurrentBookings();
    
    // Set up polling to refresh every 5 seconds for real-time updates
    const interval = setInterval(fetchCurrentBookings, 10000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [store]);


  const handleManualRefresh = () => {
    fetchCurrentBookings();
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/booking/slots/${store._id}`);
     
      setAvailableTimeSlots(response.data.data); // Change this line - access the nested data
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setAvailableTimeSlots({}); // Set empty object as fallback
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
        const userId =user._id
        // 1️⃣ Fetch Ticket Number
        const res1 = await fetch(`${SERVER_URL}/booking/tickets/${userId}/${store._id}`);
        const data1 = await res1.json();
        if (res1.ok) {
          setTicket(data1.ticket);
        } else {
          setTicket(null);
        }
  
        // 2️⃣ Fetch Table Ticket
        const res2 = await fetch(`${SERVER_URL}/booking/table/${userId}`);
        const data2 = await res2.json();
        console.log(data2);
        
        if (res2.ok) {
          setTableTicket(data2); // <-- make sure you have a setTableTicket state
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
  
  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Store Not Found</h2>
          <p className="text-gray-600">Unable to load store information. Please try again.</p>
        </div>
      </div>
    );
  }

  

  // Get date options (today and tomorrow)
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
      icon: Clock,
      data: store.onlineTicketing,
      needsForm: true
    },
    {
      key: 'walkingTicketing',
      title: 'Walk-in Ticketing',
      description: 'Purchase tickets at the venue counter',
      icon: MapPin,
      data: store.walkingTicketing,
      needsForm: false,
      showButton: false
    },
    {
      key: 'tableBooking',
      title: 'Table Reservation',
      description: 'Reserve your table in advance',
      icon: Users,
      data: store.tableBooking,
      needsForm: true
    }
  ];

  // API call function for creating online tickets
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
    if (!optionData.active) return;
    
    if (optionKey === 'walkingTicketing') {
      alert('Walk-in ticketing: Please visit our counter directly. No advance booking required!');
      return;
    }
    
    setSelectedOption(optionKey);
    // Reset form data
    setFormData({
      name: '',
      phone: '',
      numberOfPeople: 1,
      date: '',
      timeSlot: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }
  
    if (selectedOption === 'tableBooking' && (!formData.date || !formData.timeSlot)) {
      alert('Please select date and time for table reservation');
      return;
    }
  
    const option = bookingOptions.find(opt => opt.key === selectedOption);
    const totalPrice = option.data.price * formData.numberOfPeople;
  
    // If paid booking, open UPI payment first
    if (option.data.type === 'paid' && store.upi) {
      const upiUrl = `upi://pay?pa=${store.upi}&pn=${encodeURIComponent(store.storeName)}&am=${totalPrice}&cu=INR`;
      window.location.href = upiUrl; // Opens UPI payment apps
      toast.success("Complete the payment in your UPI app, then come back here.");
      return; // Stop here, you can let user manually confirm payment before booking
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
        alert(`🎫 Ticket Created Successfully! Ticket Number: #${response.ticket.ticketNumber}`);
        setSelectedOption(null);
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
        await axios.post(`${SERVER_URL}/booking/table/add`, bookingData);
        toast.success('Table booked successfully!');
        setSelectedOption(null);
      }
    } catch (error) {
      console.error('Booking Error:', error);
      toast.error(error.response?.data?.message || 'Failed to book. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleBack = () => {
    setSelectedOption(null);
    fetchStoreDetails()
  };

  if (selectedOption) {
    const option = bookingOptions.find(opt => opt.key === selectedOption);
    const totalPrice = option.data.price ;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center text-teal-600 hover:text-teal-700"
                disabled={isLoading}
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {option.title}
                </h1>
                <p className="text-gray-600">{store.storeName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                />
              </div>

              {/* Number of People (for both online ticketing and table booking) */}
              {(selectedOption === 'onlineTicketing' || selectedOption === 'tableBooking') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Number of People *
                  </label>
                  <select
                    value={formData.numberOfPeople}
                    onChange={(e) => handleInputChange('numberOfPeople', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date (only for table booking) */}
              {selectedOption === 'tableBooking' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date *
                  </label>
                  <select
                    required
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="">Select a date</option>
                    {getDateOptions().map(dateOption => (
                      <option key={dateOption.value} value={dateOption.value}>
                        {dateOption.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

             {/* Time Slot (only for table booking) */}
{selectedOption === 'tableBooking' && formData.date && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      <Clock className="w-4 h-4 inline mr-2" />
      Time Slot *
    </label>
    <select
      required
      value={formData.timeSlot}
      onChange={(e) => handleInputChange('timeSlot', e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      disabled={isLoading}
    >
      <option value="">Select a time slot</option>
      {(() => {
        const selectedDate = new Date(formData.date);
        const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()];
        return availableTimeSlots[dayName]?.map(slot => (
          <option key={slot} value={slot}>{slot}</option>
        )) || [];
      })()}
    </select>
  </div>
)}
{/* Note Field */}
{selectedOption === 'tableBooking' && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Additional Note (Optional)
    </label>
    <textarea
      value={formData.note}
      onChange={(e) => handleInputChange('note', e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      placeholder="Any special requests or instructions?"
      rows={3}
      disabled={isLoading}
    />
  </div>
)}


              {/* Price Summary */}
              <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-700">
                    Price:
                  </span>
                  <span className="text-2xl font-bold text-teal-600">
                    {selectedOption === 'onlineTicketing' ? 
                      (store.onlineTicketing.type === 'paid' ? `₹${option.data.price}` : 'Free') :
                      `₹${option.data.price}`
                    }
                  </span>
                </div>
              
                {option.data.refundable && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Refundable booking
                  </p>
                )}
              </div>
              {option.data.type === 'paid' && store.upi && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
    <p className="text-sm font-medium text-yellow-700">
      Pay via UPI: <span className="font-bold">{store.upi}</span>
    </p>
    <p className="text-xs text-gray-600">
      Amount: ₹{totalPrice} — Scan QR in your UPI app or click Proceed to Payment.
    </p>
  </div>
)}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Creating Booking...</span>
                  </>
                ) : (
                  <>
                    {selectedOption === 'onlineTicketing' ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Create Ticket</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Proceed to Payment</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">
      {/* Header Section */}

      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {store.storeName || 'Welcome'}
            </h1>
            <p className="text-lg text-gray-600">
              Choose your preferred booking method
            </p>
          </div>
        </div>

      </div>
      
      
      
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white shadow-xl border border-gray-200 rounded-2xl p-6">
          {/* User's Ticket Display */}
          {/* Ticket Section */}
<div className="flex flex-wrap gap-6 justify-center">
  {/* User's Ticket */}
  {ticket ? (
    <div className="relative bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg shadow-md px-4 py-5 w-full sm:w-[220px]">
      {/* Decorative ticket edges */}
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-sm"></div>
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-sm"></div>
      
      {/* Ticket Title */}
      <div className="flex items-center justify-center mb-2">
        <Clock className="w-4 h-4 text-teal-700 mr-1" />
        <h3 className="text-sm font-semibold text-teal-800">Your Ticket</h3>
      </div>

      {/* Ticket Number */}
      <div className="text-center">
        <span className="block text-gray-600 text-xs">Ticket Number</span>
        <span className="text-3xl font-extrabold text-teal-900 tracking-wider">
          #{ticket.ticketNumber}
        </span>
        <div className="bg-white rounded-lg p-3 text-xs text-gray-600 space-y-1">
          <p><strong>Name:</strong> {ticket.name}</p>
          <p><strong>People:</strong> {ticket.numberOfPeople}</p>
          <p><strong>Phone:</strong> {ticket.phone}</p>
          <div className="flex items-center space-x-2 mt-2">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                ticket.status === 'confirmed'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {ticket.status}
            </span>
            {ticket.isPaid && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                Paid: ₹{ticket.paymentAmount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 border-t border-teal-300 pt-1 text-center">
        <span className="text-[10px] text-teal-700">Show this at the counter</span>
      </div>
    </div>
  ) : (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center text-gray-500 w-full sm:w-[220px]">
      <p className="text-sm font-medium">No confirmed ticket</p>
      <p className="text-xs mt-1">Book now to get your ticket</p>
    </div>
  )}

  {/* Table Reservation */}
  {tableTicket && tableTicket.length > 0 ? (
    tableTicket.map((reservation) => (
      <div
        key={reservation._id}
        className="relative bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg shadow-md px-4 py-5 w-full sm:w-[280px]"
      >
        {/* Decorative edges */}
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-sm"></div>
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-sm"></div>

        {/* Title */}
        <div className="flex items-center justify-center mb-2">
          <Users className="w-4 h-4 text-indigo-700 mr-1" />
          <h3 className="text-sm font-semibold text-indigo-800">Your Table Reservation</h3>
        </div>

        {/* Details */}
        <div className="bg-white rounded-lg p-3 text-xs text-gray-600 space-y-1">
          <p><strong>Name:</strong> {reservation.name}</p>
          <p><strong>People:</strong> {reservation.numberOfPeople}</p>
          <p><strong>Phone:</strong> {reservation.phone}</p>
          <p><strong>Date:</strong> {new Date(reservation.reservationDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {reservation.timeSlot || "Not specified"}</p>
          {reservation.note && <p><strong>Note:</strong> {reservation.note}</p>}
          <div className="flex items-center space-x-2 mt-2">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                reservation.status === 'confirmed'
                  ? 'bg-green-100 text-green-700'
                  : reservation.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {reservation.status}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-2 border-t border-indigo-300 pt-1 text-center">
          <span className="text-[10px] text-indigo-700">Show this at the venue</span>
        </div>
      </div>
    ))
  ) : (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center text-gray-500 w-full sm:w-[280px]">
      <p className="text-sm font-medium">No table reservations</p>
      <p className="text-xs mt-1">Reserve a table to see it here</p>
    </div>
  )}
</div>




          {/* Header with refresh button and status */}
          <div className="flex justify-between items-center mt-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🎫 Currently Serving</h2>
            <div className="flex items-center space-x-4">
              {/* Auto-update indicator */}
            
              
              {/* Manual refresh button */}
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Last updated time */}
          {lastUpdated && (
            <div className="text-center mb-4">
              <p className="text-xs text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          )}

          {/* Current serving tickets grid */}
        {/* Current serving tickets grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Online Ticket Card */}
  <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 flex flex-col">
    <div className="flex items-center space-x-3 mb-4">
      <Clock className="w-6 h-6 text-teal-600" />
      <h3 className="text-xl font-semibold text-gray-800">Online Ticket</h3>
    </div>
    
    <div className="flex-grow">
      {currentBookings?.online?.currentTicket ? (
        <>
          <div className="text-5xl font-bold text-teal-700 mb-2">
            #{currentBookings.online.currentTicket.ticketNumber}
          </div>
          <p className="text-sm text-gray-600 mb-1">Currently being served</p>
          
          
          <p className="text-xs text-gray-500">
            Next possible ticket to issue: #{currentBookings.online.nextTicketNumber}
          </p>
        </>
      ) : (
        <>
          <div className="text-3xl font-bold text-gray-400 mb-2">No Queue</div>
          <p className="text-sm text-gray-500">No online bookings currently being served</p>
        </>
      )}
    </div>
  </div>

  {/* Walk-in Ticket Card */}
  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex flex-col">
    <div className="flex items-center space-x-3 mb-4">
      <MapPin className="w-6 h-6 text-yellow-600" />
      <h3 className="text-xl font-semibold text-gray-800">Walk-in Ticket</h3>
    </div>
    
    <div className="flex-grow">
      {currentBookings?.walkIn?.currentTicket ? (
        <>
          <div className="text-5xl font-bold text-yellow-700 mb-2">
            #{currentBookings.walkIn.currentTicket.ticketNumber}
          </div>
          <p className="text-sm text-gray-600 mb-1">Currently being served</p>

      
          <p className="text-xs text-gray-500">
            Next possible ticket to issue: #{currentBookings.walkIn.nextTicketNumber}
          </p>
        </>
      ) : (
        <>
          <div className="text-3xl font-bold text-gray-400 mb-2">No Queue</div>
          <p className="text-sm text-gray-500">No walk-in bookings currently being served</p>
        </>
      )}
    </div>
  </div>
</div>


          {/* Connection status indicator */}
          <div className="mt-6 text-center">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
              isRefreshing ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isRefreshing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
              }`}></div>
              <span>{isRefreshing ? 'Updating...' : 'Live updates active'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookingOptions.map((option) => {
            const Icon = option.icon;
            const isActive = option.data?.active;
            const price = option.data?.price?.$numberInt || option.data?.price || 0;
            const isRefundable = option.data?.refundable;

            return (
              <div
                key={option.key}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                  isActive 
                    ? 'border-teal-200 hover:border-teal-300' 
                    : 'border-gray-200 opacity-75'
                }`}
              >
                {/* Status Indicator */}
                <div className="absolute top-4 right-4">
                  {isActive ? (
                    <div className="flex items-center space-x-1 bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      <span>Inactive</span>
                    </div>
                  )}
                </div>

                <div className="p-8">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                    isActive ? 'bg-teal-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-8 h-8 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                  </div>

                  {/* Content */}
                  <h3 className={`text-2xl font-bold mb-3 ${
                    isActive ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {option.title}
                  </h3>
                  
                  <p className={`text-base mb-6 ${
                    isActive ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {option.description}
                  </p>

                  {/* Price */}
                  {isActive && (
                    <div className="mb-4">
                      {option.key === 'onlineTicketing' && (
                        <p className="text-xl font-bold text-teal-600">
                          {store.onlineTicketing.type === 'paid' ? `₹${price}` : 'Free'}
                        </p>
                      )}
                      {option.key === 'tableBooking' && (
                        <p className="text-xl font-bold text-teal-600">₹{price}</p>
                      )}
                      {option.key === 'walkingTicketing' && (
                        <p className="text-sm text-gray-500 mt-1">No advance booking required</p>
                      )}
                      {isRefundable && (
                        <p className="text-sm text-green-600 mt-1">✓ Refundable</p>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  {option.key !== 'walkingTicketing' ? (
                    <button
                      onClick={() => handleBookNow(option.key, option.data)}
                      disabled={!isActive}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-center transition-all duration-200 ${
                        isActive
                          ? 'bg-teal-600 hover:bg-teal-700 text-white transform hover:scale-105 active:scale-95'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isActive ? 'Book Now' : 'Currently Unavailable'}
                    </button>
                  ) : (
                    <div className="text-center py-3 px-4 bg-gray-100 rounded-xl">
                      <span className="text-gray-600 font-medium">Visit our counter directly</span>
                    </div>
                  )}
                </div>

                {/* Decorative Element */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl ${
                  isActive ? 'bg-gradient-to-r from-teal-400 to-teal-600' : 'bg-gray-200'
                }`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerBookingPage;