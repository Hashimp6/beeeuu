import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle, XCircle, AlertCircle, User, Phone, MapPin, 
  Check, X, RefreshCw, Users, Filter
} from 'lucide-react';
import { SERVER_URL } from '../../Config';
import { useAuth } from '../../context/UserContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Compact Appointment Card Component
const AppointmentCard = ({ appointment, refetchAppointments }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const {  token, } = useAuth() ;
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': 
        return { 
          bg: 'bg-yellow-50', 
          text: 'text-yellow-800', 
          badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: <AlertCircle className="w-4 h-4" />,
          dot: 'bg-yellow-400'
        };
      case 'confirmed': 
        return { 
          bg: 'bg-teal-50', 
          text: 'text-teal-800', 
          badge: 'bg-teal-100 text-teal-700 border-teal-200',
          icon: <CheckCircle className="w-4 h-4" />,
          dot: 'bg-teal-400'
        };
      case 'completed': 
        return { 
          bg: 'bg-emerald-50', 
          text: 'text-emerald-800', 
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          icon: <CheckCircle className="w-4 h-4" />,
          dot: 'bg-emerald-400'
        };
      case 'cancelled': 
        return { 
          bg: 'bg-red-50', 
          text: 'text-red-800', 
          badge: 'bg-red-100 text-red-700 border-red-200',
          icon: <XCircle className="w-4 h-4" />,
          dot: 'bg-red-400'
        };
      default: 
        return { 
          bg: 'bg-gray-50', 
          text: 'text-gray-800', 
          badge: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: <Clock className="w-4 h-4" />,
          dot: 'bg-gray-400'
        };
    }
  };

  const handleStatusUpdate = ({ status, id: appointmentId }) => {
    const confirmToast = toast.custom((t) => (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-200 w-80">
        <h3 className="text-gray-800 font-semibold text-sm mb-2">
          Are you sure you want to mark this appointment as <span className="capitalize text-teal-600">{status}</span>?
        </h3>
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-sm px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                setIsUpdating(true);
  
                const response = await axios.put(
                  `${SERVER_URL}/appointments/${appointmentId}`,
                  { status },
                  {
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                    timeout: 10000,
                  }
                );
  
                if (response.status === 200) {
                  toast.success(`Appointment marked as ${status}`);
                  refetchAppointments(); // 👈 refresh data
                } else {
                  toast.error('Failed to update appointment status');
                }
              } catch (error) {
                console.error(error);
                toast.error('Failed to update appointment status');
              } finally {
                setIsUpdating(false);
              }
            }}
            className="text-sm px-4 py-1 rounded-md bg-teal-600 text-white hover:bg-teal-700"
          >
            Yes, Confirm
          </button>
        </div>
      </div>
    ));
  };
  

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusConfig = getStatusConfig(appointment.status);

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden ${statusConfig.bg}`}>
      {/* Status Indicator */}
      <div className={`h-1 ${statusConfig.dot}`}></div>
      
      <div className="p-4">
        {/* Header with Name and Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{appointment.userName || 'Unknown Customer'}</h3>
              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${statusConfig.badge}`}>
                {statusConfig.icon}
                <span className="capitalize">{appointment.status || 'pending'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{formatDate(appointment.date)}</span>
            <Clock className="w-4 h-4 text-gray-500 ml-2" />
            <span className="text-gray-700">{formatTime(appointment.time)}</span>
          </div>
          
          {appointment.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{appointment.phone}</span>
            </div>
          )}
          
          {appointment.service && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{appointment.service}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {appointment.status !== 'confirmed' && appointment.status !== 'completed' && (
            <button
            onClick={() => handleStatusUpdate({ status: 'confirmed', id: appointment._id })}
              disabled={isUpdating}
              className="flex-1 bg-teal-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
            >
              {isUpdating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirm</span>
                </>
              )}
            </button>
          )}
          
          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
            <button
            onClick={() => handleStatusUpdate({ status: 'cancelled', id: appointment._id })}
              disabled={isUpdating}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
            >
              {isUpdating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </>
              )}
            </button>
          )}
          
          {appointment.status === 'confirmed' && (
            <button
            onClick={() => handleStatusUpdate({ status: 'completed', id: appointment._id })}
              disabled={isUpdating}
              className="flex-1 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
            >
              {isUpdating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Appointment Management Component
const AppointmentManagement = ({ storeId }) => {
  const { user, token, setUser } = useAuth() || {};
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const statusOptions = [
    { value: 'pending', label: 'Pending', count: appointments.filter(a => a.status === 'pending').length },
    { value: 'confirmed', label: 'Confirmed', count: appointments.filter(a => a.status === 'confirmed').length },
    { value: 'completed', label: 'Completed', count: appointments.filter(a => a.status === 'completed').length },
    { value: 'cancelled', label: 'Cancelled', count: appointments.filter(a => a.status === 'cancelled').length },
    { value: 'today', label: 'Today', count: appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length }
  ];

  const fetchAppointments = async (status = 'pending') => {
    setLoading(true);
    setError(null);
    
    try {
      let apiUrl = '';
      let params = { status };
      console.log("gttt",storeId,status);
      
      if (status === 'today') {
        apiUrl = `${SERVER_URL}/appointments/user/${storeId}`;
        const today = new Date().toISOString().split('T')[0];
        params.date = today;
      } else {
        apiUrl = `${SERVER_URL}/appointments/store/${storeId}/status`;
      }
      
      const response = await axios.get(apiUrl, {
        params,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 10000
      });
      console.log("Raw appointment response:", response.data);
      const raw = response.data.appointments ?? response.data ?? [];

      if (Array.isArray(raw)) {
        setAppointments(
          raw.map((apt) => ({
            ...apt,
            userName: apt.locationName,
            phone: apt.contactNo,
            service: apt.productName,
          }))
        );
        setError(null); // ✅ Clear any previous error
      } else {
        setAppointments([]); // No appointments
        setError(null); // ✅ Still no error
      }
      
      setError(null); // ✅ Clear any previous error
      
    } catch (error) {
      setError(error?.response ? 'Server error while fetching appointments.' : 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };


  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.phone?.includes(searchQuery);
    return matchesSearch;
  });

  useEffect(() => {
    fetchAppointments(selectedStatus);
  }, [selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-white">
              <h1 className="text-2xl font-bold mb-1">Appointment Management</h1>
              <p className="text-teal-100">Manage and track all your appointments</p>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-white" />
                <div>
                  <p className="text-white font-semibold text-xl">{appointments.length}</p>
                  <p className="text-teal-100 text-sm">Total Appointments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filter Appointments</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedStatus === option.value
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
                {option.count > 0 && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full font-bold ${
                    selectedStatus === option.value
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-gray-600'
                  }`}>
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading appointments...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-800 mb-2">Failed to Load Appointments</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchAppointments(selectedStatus)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Appointments Found</h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus === 'today' 
                ? "No appointments scheduled for today." 
                : `No ${selectedStatus} appointments found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              refetchAppointments={() => fetchAppointments(selectedStatus)}
            />            
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentManagement;