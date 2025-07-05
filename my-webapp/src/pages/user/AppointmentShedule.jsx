import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, User, ChevronLeft, ChevronRight, Check, X, Menu, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/UserContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { SERVER_URL } from '../../Config';
import axios from 'axios';
import toast from 'react-hot-toast';

const AppointmentScheduler = ({ onClose}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, store } = location.state || {};
  const { user, token } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    locationName: '',
    address: '',
    contactNo: ''
  });
  const [activeTimeCategory, setActiveTimeCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        locationName: user.username || '',
        address: user.address || '',
        contactNo: user.phone || ''
      });
    }
  }, [user]);

  const timeSlotCategories = [
    {
      id: 'morning',
      title: 'Morning',
      subtitle: '7:00 AM - 12:00 PM',
      icon: '🌅',
      color: 'from-teal-400 to-teal-600',
      slots: ['7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM']
    },
    {
      id: 'afternoon',
      title: 'Afternoon',
      subtitle: '12:30 PM - 5:00 PM',
      icon: '☀️',
      color: 'from-teal-500 to-teal-700',
      slots: ['12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM']
    },
    {
      id: 'evening',
      title: 'Evening',
      subtitle: '5:30 PM - 10:00 PM',
      icon: '🌙',
      color: 'from-teal-600 to-teal-800',
      slots: ['5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM']
    }
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  const handleDateSelect = (day) => {
    if (day.isCurrentMonth && !day.isPast) {
      setSelectedDate(day.date);
      setSelectedTime(null);
      setActiveTimeCategory(null);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setActiveTimeCategory(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (date) => {
    if (!date) return '';
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatAppointmentDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSendAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time for the appointment.");
      return;
    }

    const appointmentDate = formatAppointmentDate(selectedDate);

    const appointmentData = {
      date: appointmentDate,
      time: selectedTime,
      locationName: formData.locationName,
      address: formData.address,
      productName: product?.name || '',
      contactNo: formData.contactNo,
      store:  store?._id || '', // Handle both cases
      product: product || '',
      status: 'pending'
    };

    try {
      console.log("app drs",appointmentData,token);
      
      const response = await axios.post(
        `${SERVER_URL}/messages/send`,
        {
          receiverId: store?.userId || store?.storeId, // Use consistent ID
          appointmentData: JSON.stringify(appointmentData),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (response.data.success) {
        console.log("✅ Appointment message sent", data);
        
        setIsSubmitting(false);
        setShowConfirmation(true);
        toast.success('Appointment sent successfully!');

       
        // Auto-close after 3 seconds
        setTimeout(() => {
          setShowConfirmation(false);
          if (onClose) {
            onClose();
          } else {
            // Fallback navigation if onClose not provided
            navigate(-1);
          }
        }, 3000);
      } else {
        console.log("❌ Appointment error", data);
        setIsSubmitting(false);
        toast.error('Failed to send appointment. Please try again.');
      }
    } catch (error) {
      console.error("❌ Failed to send appointment:", error);
      setIsSubmitting(false);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleSubmit = async () => {
    // Validate all required fields
    if (!selectedDate || !selectedTime || !formData.locationName || !formData.address || !formData.contactNo) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate contact number format (basic validation)
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(formData.contactNo)) {
      toast.error('Please enter a valid contact number');
      return;
    }

    setIsSubmitting(true);
    await handleSendAppointment();
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const isFormValid = selectedDate && selectedTime && formData.locationName && formData.address && formData.contactNo;

  const calendarDays = generateCalendarDays();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleClose}
                  className="p-5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Schedule Appointment</h1>
                  <p className="text-gray-600 mt-1">
                    {product?.productName ? `For ${product.productName}` : 'Select your preferred date, time, and location details'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column - Date & Time Selection */}
            <div className="space-y-6">
              {/* Date Selection */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg sm:text-xl font-semibold">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h2>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {dayNames.map((day, idx) => (
                      <div key={idx} className="text-center py-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-500">{day}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, idx) => {
                      const isSelected = selectedDate?.toDateString() === day.date.toDateString();
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => handleDateSelect(day)}
                          disabled={!day.isCurrentMonth || day.isPast}
                          className={`
                            aspect-square rounded-xl text-sm font-medium transition-all duration-200
                            ${!day.isCurrentMonth 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : day.isPast 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-gray-700 hover:bg-teal-50 hover:scale-105 active:scale-95'
                            }
                            ${isSelected 
                              ? 'bg-teal-500 text-white shadow-lg scale-105' 
                              : ''
                            }
                            ${day.isToday && !isSelected 
                              ? 'ring-2 ring-teal-500 ring-offset-2' 
                              : ''
                            }
                          `}
                        >
                          {day.date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time Selection */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Select Time</h3>
                </div>
                
                {selectedDate ? (
                  <div className="space-y-3">
                    <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                      <span className="text-sm font-medium text-teal-800">
                        {formatDate(selectedDate)}
                      </span>
                    </div>
                    
                    {timeSlotCategories.map((category) => (
                      <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <button
                          onClick={() => setActiveTimeCategory(activeTimeCategory === category.id ? null : category.id)}
                          className={`
                            w-full p-4 text-left transition-all duration-300
                            ${activeTimeCategory === category.id 
                              ? `bg-gradient-to-r ${category.color} text-white` 
                              : 'bg-white hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">{category.icon}</span>
                              <div>
                                <h4 className="font-medium">{category.title}</h4>
                                <p className={`text-sm ${activeTimeCategory === category.id ? 'text-white/80' : 'text-gray-600'}`}>
                                  {category.subtitle}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform ${activeTimeCategory === category.id ? 'rotate-90' : ''}`} />
                          </div>
                        </button>
                        
                        {activeTimeCategory === category.id && (
                          <div className="p-4 bg-gray-50 animate-in slide-in-from-top duration-300">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {category.slots.map((time) => (
                                <button
                                  key={time}
                                  onClick={() => handleTimeSelect(time)}
                                  className={`
                                    p-3 rounded-lg text-sm font-medium transition-all duration-200
                                    ${selectedTime === time
                                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                                      : 'bg-white hover:bg-gray-100 text-gray-700 hover:scale-105 active:scale-95 border border-gray-200'
                                    }
                                  `}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-xl p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Please select a date first</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Location Details & Summary */}
            <div className="space-y-6">
              {/* Appointment Summary */}
              {(selectedDate || selectedTime) && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Check className="w-5 h-5 text-teal-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Appointment Summary</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedDate && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-teal-600" />
                        <span className="text-gray-700">{formatDate(selectedDate)}</span>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-teal-600" />
                        <span className="text-gray-700">{selectedTime}</span>
                      </div>
                    )}
                    {product?.productName && (
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-teal-600" />
                        <span className="text-gray-700">{product.productName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location Details Form */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Details</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.locationName}
                      onChange={(e) => handleInputChange('locationName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter location name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Address *
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Enter full address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.contactNo}
                      onChange={(e) => handleInputChange('contactNo', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter contact number"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className={`
                  w-full px-6 py-4 rounded-xl font-medium transition-all duration-200 text-base
                  ${isFormValid && !isSubmitting
                    ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg hover:shadow-xl active:scale-95'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Booking...</span>
                  </div>
                ) : (
                  'Book Appointment'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 animate-in zoom-in duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Your appointment has been successfully scheduled for {formatDate(selectedDate)} at {selectedTime}.
              </p>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  handleClose();
                }}
                className="w-full bg-teal-500 text-white py-3 sm:py-4 rounded-xl font-medium hover:bg-teal-600 transition-all duration-200 text-base"
              >
                Continue to Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentScheduler;