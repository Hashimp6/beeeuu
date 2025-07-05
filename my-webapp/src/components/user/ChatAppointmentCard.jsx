import React from 'react';
import { Calendar, Phone, Receipt, MapPin, Clock, Star, CreditCard, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const ChatAppointmentCard = ({ appointmentData, isOwnMessage }) => {
  if (!appointmentData) return null;

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'confirmed': 
        return { 
          color: 'bg-teal-500', 
          textColor: 'text-teal-700',
          bgColor: 'bg-teal-50',
          icon: CheckCircle,
          label: 'Confirmed'
        };
      case 'advance-received': 
        return { 
          color: 'bg-teal-600', 
          textColor: 'text-teal-700',
          bgColor: 'bg-teal-50',
          icon: CreditCard,
          label: 'Advance Received'
        };
      case 'cancelled': 
        return { 
          color: 'bg-gray-500', 
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          icon: XCircle,
          label: 'Cancelled'
        };
      case 'pending': 
        return { 
          color: 'bg-gray-400', 
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          icon: Clock,
          label: 'Pending'
        };
      case 'completed': 
        return { 
          color: 'bg-teal-600', 
          textColor: 'text-teal-700',
          bgColor: 'bg-teal-50',
          icon: CheckCircle,
          label: 'Completed'
        };
      case 'not-attended': 
        return { 
          color: 'bg-gray-600', 
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          icon: AlertCircle,
          label: 'Not Attended'
        };
      default: 
        return { 
          color: 'bg-gray-400', 
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          icon: Clock,
          label: 'Pending'
        };
    }
  };

  const getPaymentConfig = (payment) => {
    switch (payment) {
      case 'full': 
        return { 
          color: 'bg-teal-500', 
          icon: CheckCircle,
          label: 'Paid Full'
        };
      case 'advance': 
        return { 
          color: 'bg-teal-400', 
          icon: CreditCard,
          label: 'Advance'
        };
      case 'none': 
        return { 
          color: 'bg-gray-400', 
          icon: XCircle,
          label: 'Unpaid'
        };
      default: 
        return { 
          color: 'bg-gray-400', 
          icon: XCircle,
          label: 'Unpaid'
        };
    }
  };

  const dateTime = formatDateTime(appointmentData.date || appointmentData.appointmentDate);
  const statusConfig = getStatusConfig(appointmentData.status);
  const paymentConfig = getPaymentConfig(appointmentData.payment);
  const StatusIcon = statusConfig.icon;
  const PaymentIcon = paymentConfig.icon;

  return (
    <div className={`
      relative rounded-2xl p-4 my-2 max-w-xs min-w-72 shadow-lg transition-all duration-300 hover:shadow-xl group
      ${isOwnMessage 
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white self-end transform hover:scale-105' 
        : 'bg-white text-gray-800 self-start border border-gray-100 hover:border-teal-200'
      }
    `}>
      {/* Animated background patterns */}
      <div className={`absolute inset-0 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 ${
        isOwnMessage 
          ? 'bg-gradient-to-br from-teal-600 to-teal-800' 
          : 'bg-gradient-to-br from-teal-50 to-gray-50'
      }`}></div>
      
      {/* Decorative geometric elements */}
      <div className={`absolute top-0 right-0 w-16 h-16 ${isOwnMessage ? 'bg-teal-500 bg-opacity-20' : 'bg-teal-100'} rounded-full -translate-y-8 translate-x-8 blur-lg group-hover:blur-xl transition-all duration-300`}></div>
      <div className={`absolute bottom-0 left-0 w-14 h-14 ${isOwnMessage ? 'bg-gray-600 bg-opacity-20' : 'bg-gray-100'} rounded-full translate-y-6 -translate-x-6 blur-md group-hover:blur-lg transition-all duration-300`}></div>

      {/* Header with enhanced styling */}
      <div className="flex items-center mb-4 relative z-10">
        <div className={`p-2 rounded-xl ${isOwnMessage ? 'bg-teal-500 bg-opacity-20 backdrop-blur-sm' : 'bg-teal-50 border border-teal-100'} mr-3 group-hover:scale-110 transition-transform duration-300`}>
          <Calendar size={18} className={isOwnMessage ? "text-teal-300" : "text-teal-600"} />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-bold ${isOwnMessage ? 'text-white' : 'text-gray-900'} group-hover:text-teal-300 transition-colors duration-300`}>
            Appointment
          </h3>
          <p className={`text-xs font-medium ${isOwnMessage ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
            {appointmentData.productName || appointmentData.serviceName || 'Service Request'}
          </p>
        </div>
        <div className={`p-2 rounded-xl ${statusConfig.bgColor} border border-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
          <StatusIcon size={16} className={statusConfig.textColor} />
        </div>
      </div>

      {/* Main Content with enhanced cards */}
      <div className="space-y-3 relative z-10">
        {/* Date & Time Card */}
        <div className={`p-3 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
          isOwnMessage 
            ? 'bg-white bg-opacity-10 border border-white border-opacity-20' 
            : 'bg-gray-50 border border-gray-200 hover:border-teal-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-1.5 rounded-lg ${isOwnMessage ? 'bg-teal-500 bg-opacity-30' : 'bg-teal-100'} mr-2`}>
                <Clock size={14} className={isOwnMessage ? "text-teal-300" : "text-teal-600"} />
              </div>
              <span className={`text-xs font-semibold ${isOwnMessage ? 'text-white' : 'text-gray-800'}`}>
                {dateTime.date}
              </span>
            </div>
            <div className={`px-3 py-1.5 rounded-lg ${isOwnMessage ? 'bg-teal-500 bg-opacity-30' : 'bg-teal-100'} group-hover:bg-teal-200 transition-colors duration-300`}>
              <span className={`text-xs font-bold ${isOwnMessage ? 'text-teal-200' : 'text-teal-800'}`}>
                {dateTime.time}
              </span>
            </div>
          </div>
        </div>

        {/* Location */}
        {(appointmentData.location || appointmentData.locationName) && (
          <div className={`p-3 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
            isOwnMessage 
              ? 'bg-white bg-opacity-10 border border-white border-opacity-20' 
              : 'bg-gray-50 border border-gray-200 hover:border-teal-200'
          }`}>
            <div className="flex items-center">
              <div className={`p-1.5 rounded-lg ${isOwnMessage ? 'bg-teal-500 bg-opacity-30' : 'bg-teal-100'} mr-2`}>
                <MapPin size={14} className={isOwnMessage ? "text-teal-300" : "text-teal-600"} />
              </div>
              <span className={`text-xs font-semibold ${isOwnMessage ? 'text-white' : 'text-gray-800'}`}>
                {appointmentData.location || appointmentData.locationName}
              </span>
            </div>
          </div>
        )}

        {/* Cost */}
        <div className={`p-3 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
          isOwnMessage 
            ? 'bg-white bg-opacity-10 border border-white border-opacity-20' 
            : 'bg-gray-50 border border-gray-200 hover:border-teal-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-1.5 rounded-lg ${isOwnMessage ? 'bg-teal-500 bg-opacity-30' : 'bg-teal-100'} mr-2`}>
                <CreditCard size={14} className={isOwnMessage ? "text-teal-300" : "text-teal-600"} />
              </div>
              <span className={`text-xs font-semibold ${isOwnMessage ? 'text-white' : 'text-gray-800'}`}>
                Total Cost
              </span>
            </div>
            <div className={`px-3 py-1.5 rounded-lg ${isOwnMessage ? 'bg-teal-500 bg-opacity-30' : 'bg-teal-100'} group-hover:bg-teal-200 transition-colors duration-300`}>
              <span className={`text-xs font-bold ${isOwnMessage ? 'text-teal-200' : 'text-teal-800'}`}>
                ₹{appointmentData.cost || appointmentData.price || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Status and Payment badges with enhanced styling */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1">
            <div className={`${statusConfig.color} p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center justify-center">
                <StatusIcon size={14} className="text-white mr-1.5" />
                <span className="text-xs text-white font-bold">
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className={`${paymentConfig.color} p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center justify-center">
                <PaymentIcon size={14} className="text-white mr-1.5" />
                <span className="text-xs text-white font-bold">
                  {paymentConfig.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact and Transaction Info */}
        <div className={`pt-3 mt-4 border-t ${isOwnMessage ? 'border-white border-opacity-20' : 'border-gray-200'}`}>
          {appointmentData.contactNo && (
            <div className="flex items-center mb-2">
              <div className={`p-1.5 rounded-lg ${isOwnMessage ? 'bg-teal-500 bg-opacity-30' : 'bg-teal-100'} mr-2`}>
                <Phone size={12} className={isOwnMessage ? "text-teal-300" : "text-teal-600"} />
              </div>
              <span className={`text-xs font-medium ${isOwnMessage ? 'text-gray-300' : 'text-gray-600'}`}>
                {appointmentData.contactNo}
              </span>
            </div>
          )}

          {appointmentData.transactionId && (
            <div className="flex items-center">
              <div className={`p-1.5 rounded-lg ${isOwnMessage ? 'bg-teal-500 bg-opacity-30' : 'bg-teal-100'} mr-2`}>
                <Receipt size={12} className={isOwnMessage ? "text-teal-300" : "text-teal-600"} />
              </div>
              <span className={`text-xs font-medium ${isOwnMessage ? 'text-gray-300' : 'text-gray-600'}`}>
                ID: {appointmentData.transactionId}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Subtle animated glow effect */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
        isOwnMessage 
          ? 'bg-gradient-to-br from-teal-400 to-teal-600' 
          : 'bg-gradient-to-br from-teal-200 to-teal-400'
      }`}></div>
    </div>
  );
};

export default ChatAppointmentCard;
