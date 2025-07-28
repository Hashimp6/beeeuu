import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Clock, CheckCircle, XCircle, AlertCircle, User, Phone, MapPin, 
  Check, X, RefreshCw, Package, Filter, Truck, DollarSign, RotateCcw, Eye,
  IndianRupee
} from 'lucide-react';
import { SERVER_URL } from '../../Config';
import { useAuth } from '../../context/UserContext';
import axios from 'axios';
import toast from 'react-hot-toast';

// Compact Order Card Component
const OrderCard = ({ order, onStatusChange, storeCategory  }) => {
  const [isUpdating, setIsUpdating] = useState(false);
const{token}=useAuth()
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': 
        return { 
          bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100', 
          text: 'text-yellow-900', 
          badge: 'bg-yellow-500 text-white shadow-md',
          icon: <AlertCircle className="w-4 h-4" />,
          dot: 'bg-yellow-500'
        };
      case 'confirmed': 
        return { 
          bg: 'bg-gradient-to-br from-blue-50 to-blue-100', 
          text: 'text-blue-900', 
          badge: 'bg-blue-500 text-white shadow-md',
          icon: <CheckCircle className="w-4 h-4" />,
          dot: 'bg-blue-500'
        };
      case 'processing': 
        return { 
          bg: 'bg-gradient-to-br from-purple-50 to-purple-100', 
          text: 'text-purple-900', 
          badge: 'bg-purple-500 text-white shadow-md',
          icon: <Package className="w-4 h-4" />,
          dot: 'bg-purple-500'
        };
      case 'shipped': 
        return { 
          bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100', 
          text: 'text-indigo-900', 
          badge: 'bg-indigo-500 text-white shadow-md',
          icon: <Truck className="w-4 h-4" />,
          dot: 'bg-indigo-500'
        };
      case 'delivered': 
        return { 
          bg: 'bg-gradient-to-br from-teal-50 to-teal-100', 
          text: 'text-teal-900', 
          badge: 'bg-teal-500 text-white shadow-md',
          icon: <CheckCircle className="w-4 h-4" />,
          dot: 'bg-teal-500'
        };
      case 'cancelled': 
        return { 
          bg: 'bg-gradient-to-br from-red-50 to-red-100', 
          text: 'text-red-900', 
          badge: 'bg-red-500 text-white shadow-md',
          icon: <XCircle className="w-4 h-4" />,
          dot: 'bg-red-500'
        };
      case 'returned': 
        return { 
          bg: 'bg-gradient-to-br from-orange-50 to-orange-100', 
          text: 'text-orange-900', 
          badge: 'bg-orange-500 text-white shadow-md',
          icon: <RotateCcw className="w-4 h-4" />,
          dot: 'bg-orange-500'
        };
      default: 
        return { 
          bg: 'bg-gradient-to-br from-gray-50 to-gray-100', 
          text: 'text-gray-900', 
          badge: 'bg-gray-500 text-white shadow-md',
          icon: <Clock className="w-4 h-4" />,
          dot: 'bg-gray-500'
        };
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(order._id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    toast((t) => (
      <span className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Confirm marking payment as <b>{newStatus}</b>?
        </span>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.patch(
                  `${SERVER_URL}/orders/payment-status/${orderId}`,
                  { paymentStatus: newStatus },
                  {
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                toast.success('Payment marked as paid');
                onStatusChange(orderId, null, newStatus); // extra param for payment
              } catch (error) {
                toast.error('Failed to update payment status');
              }
            }}
            className="px-2 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-2 py-1 text-sm text-white bg-gray-600 rounded hover:bg-gray-700"
          >
            No
          </button>
        </div>
      </span>
    ), { duration: Infinity });
  };
  

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // for AM/PM format
    });
  };
  

  const getActionButtons = () => {
    const status = order.status?.toLowerCase();
    const buttons = [];
  
    const isHotel = storeCategory?.toLowerCase().includes('hotel') || 
                    storeCategory?.toLowerCase().includes('restaurant');
  
    if (isHotel) {
      switch (status) {
        case 'pending':
          buttons.push(
            <button
              key="process"
              onClick={() => handleStatusUpdate('processing')}
              disabled={isUpdating}
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
            >
              {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Package className="w-4 h-4" /><span>Process</span></>}
            </button>
          );
          break;
        case 'processing':
          buttons.push(
            <button
              key="deliver"
              onClick={() => handleStatusUpdate('delivered')}
              disabled={isUpdating}
              className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
            >
              {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /><span>Deliver</span></>}
            </button>
          );
          break;
      }
  
      // Cancel option (optional)
      if (!['delivered', 'cancelled'].includes(status)) {
        buttons.push(
          <button
            key="cancel"
            onClick={() => handleStatusUpdate('cancelled')}
            disabled={isUpdating}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
          >
            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4" /><span>Cancel</span></>}
          </button>
        );
      }
  
      return buttons;
    }
    switch (status) {
      case 'pending':
        buttons.push(
          <button
            key="confirm"
            onClick={() => handleStatusUpdate('confirmed')}
            disabled={isUpdating}
            className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
          >
            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /><span>Confirm</span></>}
          </button>
        );
        break;
      
      case 'confirmed':
        buttons.push(
          <button
            key="process"
            onClick={() => handleStatusUpdate('processing')}
            disabled={isUpdating}
            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
          >
            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Package className="w-4 h-4" /><span>Process</span></>}
          </button>
        );
        break;
      
      case 'processing':
        buttons.push(
          <button
            key="ship"
            onClick={() => handleStatusUpdate('shipped')}
            disabled={isUpdating}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
          >
            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Truck className="w-4 h-4" /><span>Ship</span></>}
          </button>
        );
        break;
      
      case 'shipped':
        buttons.push(
          <button
            key="deliver"
            onClick={() => handleStatusUpdate('delivered')}
            disabled={isUpdating}
            className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
          >
            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /><span>Deliver</span></>}
          </button>
        );
        break;
      
      case 'delivered':
        buttons.push(
          <button
            key="return"
            onClick={() => handleStatusUpdate('returned')}
            disabled={isUpdating}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
          >
            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><RotateCcw className="w-4 h-4" /><span>Return</span></>}
          </button>
        );
        break;
    }

    // Add cancel button for non-final states
    if (!['delivered', 'cancelled', 'returned'].includes(status)) {
      buttons.push(
        <button
          key="cancel"
          onClick={() => handleStatusUpdate('cancelled')}
          disabled={isUpdating}
          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
        >
          {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4" /><span>Cancel</span></>}
        </button>
      );
    }

    return buttons;
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className={`${statusConfig.bg} rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-white/50 overflow-hidden backdrop-blur-sm transform hover:scale-102`}>
      {/* Status Indicator */}
      <div className={`h-1.5 ${statusConfig.dot} shadow-inner`}></div>
      
      <div className="p-4">
        {/* Header with Order ID and Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-black text-base">{order.orderId}</h3>
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.badge}`}>
                {statusConfig.icon}
                <span className="capitalize">{order.status}</span>
              </span>
            </div>
          </div>
        </div>
  
      {/* Products List */}
<div className="mb-3 space-y-2">
  {order.products?.map((product, index) => (
    <div
      key={product.productId || index}
      className="p-2.5 bg-white/70 rounded-lg border border-white/50 shadow-sm"
    >
      <h4 className="font-semibold text-black text-sm mb-0.5">{product.productName}</h4>
      <p className="text-gray-600 text-xs">Qty: {product.quantity}</p>
      <p className="text-gray-600 text-xs">
        Unit Price: ₹{product.unitPrice} &nbsp;|&nbsp; Total: ₹{product.totalPrice}
      </p>
    </div>
  ))}
</div>

  
        {/* Customer Info */}
        <div className="mb-3">
          <div className="flex items-center space-x-2 text-sm">
            <User className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-black font-medium">{order.customerName}</span>
          </div>
        </div>
  
        {/* Order Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-gray-700 text-xs">{formatDate(order.orderDate)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-gray-700 text-xs">{order.phoneNumber}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-gray-700 text-xs truncate">{order.deliveryAddress}</span>
          </div>
          
          {/* Payment Details */}
          <div className="flex items-center justify-between p-2.5 bg-white/70 rounded-lg border border-white/50">
            <div className="flex items-center space-x-2">
              <IndianRupee className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-black font-bold text-base">{(order.totalAmount)}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Payment</p>
              <p className="text-sm font-medium text-black capitalize">{order.paymentMethod}</p>
            </div>
          </div>
  {/* Payment Status */}
{/* Show Payment Status only for COD */}
{order.paymentMethod === 'cod' && (
  <div className="flex items-center justify-between px-2.5 py-2 bg-white/70 rounded-lg border border-white/50">
    <div className="flex items-center space-x-2">
      <IndianRupee className="w-3.5 h-3.5 text-teal-600" />
      <span className="text-sm text-black font-medium capitalize">
        Payment Status: 
        <span className={`ml-2 font-semibold ${
          order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
        }`}>
          {order.paymentStatus}
        </span>
      </span>
    </div>

    {order.paymentStatus !== 'paid' && (
      <button
        onClick={() => handlePaymentStatusChange(order._id, 'paid')}
        className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-600 transition-all duration-200 shadow-sm"
      >
        Mark as Paid
      </button>
    )}
  </div>
)}


          {/* Transaction ID for GPay/PhonePe */}
          {(order.paymentMethod === 'gpay' || order.paymentMethod === 'phonepe') && order.transactionId && (
            <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">T</span>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Transaction ID</p>
                  <p className="text-sm font-mono text-black">{order.transactionId}</p>
                </div>
              </div>
            </div>
          )}
        </div>
  
        {/* Action Buttons */}
        <div className="flex gap-2">
          {getActionButtons()}
          {/* Verify Button for GPay/PhonePe with Pending Status */}
          {(order.paymentMethod === 'gpay' || order.paymentMethod === 'phonepe') && 
           order.paymentStatus === 'pending' && (
            <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
              Verify Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Order Management Component
const OrderManagement = ({ store }) => {
  const storeId=store._id
  const { user, token } = useAuth() || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const statusOptions = [
    { value: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: 'bg-yellow-500' },
    { value: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length, color: 'bg-blue-500' },
    { value: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length, color: 'bg-purple-500' },
    { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length, color: 'bg-indigo-500' },
    { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length, color: 'bg-teal-500' },
    { value: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length, color: 'bg-red-500' },
    { value: 'returned', label: 'Returned', count: orders.filter(o => o.status === 'returned').length, color: 'bg-orange-500' },
    { value: 'today', label: 'Today', count: orders.filter(o => new Date(o.orderDate).toDateString() === new Date().toDateString()).length, color: 'bg-gray-500' }
  ];

  const fetchOrders = async (status = 'pending') => {
    setLoading(true);
    setError(null);
    
    try {
      let apiUrl = '';
      let params = { status };
      
      if (status === 'today') {
        apiUrl = `${SERVER_URL}/orders/store/${storeId}`;
        const today = new Date().toISOString().split('T')[0];
        params.date = today;
      } else {
        apiUrl = `${SERVER_URL}/orders/store/${storeId}/status`;
      }
      
      const response = await axios.get(apiUrl, {
        params,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 10000
      });
      
      setOrders(response.data.orders || response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    toast((t) => (
      <span className="flex flex-col gap-2">
        <span className="text-sm font-medium">Are you sure you want to change status to <b>{newStatus}</b>?</span>
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.patch(
                  `${SERVER_URL}/orders/status/${orderId}`,
                  { status: newStatus },
                  {
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                    timeout: 10000
                  }
                );
                setOrders(prev =>
                  prev.map(order =>
                    order._id === orderId ? { ...order, status: newStatus } : order
                  )
                );
                toast.success(`Status updated to ${newStatus}`);
              } catch (error) {
                console.error('Error updating order status:', error);
                toast.error('Failed to update status');
              }
            }}
            className="px-2 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-2 py-1 text-sm text-white bg-gray-600 rounded hover:bg-gray-700"
          >
            No
          </button>
        </div>
      </span>
    ), {
      duration: Infinity,
      position: 'top-center',
    });
  };
  

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.phoneNumber?.includes(searchQuery);
    return matchesSearch;
  });

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  useEffect(() => {
    fetchOrders(selectedStatus); // initial fetch on mount or status change
  
    const interval = setInterval(() => {
      fetchOrders(selectedStatus); // fetch every 30 seconds
    }, 30000); // 30 seconds = 30000 ms
  
    return () => clearInterval(interval); // clean up on unmount
  }, [selectedStatus]);

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-black via-gray-900 to-black rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-teal-400 to-white bg-clip-text text-transparent">
                  Order Management
                </h1>
                <p className="text-gray-300 text-lg">Manage and track all your orders efficiently</p>
              </div>
              
              <div className="flex gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-2xl">{orders.length}</p>
                      <p className="text-gray-300 text-sm">Total Orders</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                      <IndianRupee className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-2xl">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(totalRevenue)}
                      </p>
                      <p className="text-gray-300 text-sm">Total Revenue</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50">
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black">Filter Orders</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`group relative p-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    selectedStatus === option.value
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
                      : 'bg-white/70 text-gray-700 hover:bg-white/90 shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${option.color}`}></div>
                    <div className="text-sm">{option.label}</div>
                    {option.count > 0 && (
                      <div className={`mt-1 px-2 py-1 text-xs rounded-full font-bold ${
                        selectedStatus === option.value
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {option.count}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-gray-700 font-semibold text-lg">Loading orders...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white/80 backdrop-blur-lg border-2 border-red-200 rounded-3xl p-12 text-center shadow-xl">
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-red-800 mb-4">Failed to Load Orders</h3>
              <p className="text-red-600 mb-6 text-lg">{error}</p>
              <button
                onClick={() => fetchOrders(selectedStatus)}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg"
              >
                Try Again
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-lg border-2 border-gray-200 rounded-3xl p-16 text-center shadow-xl">
              <ShoppingCart className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-black mb-4">No Orders Found</h3>
              <p className="text-gray-600 text-lg">
                {selectedStatus === 'today' 
                  ? "No orders placed today." 
                  : `No ${selectedStatus} orders found.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  storeCategory={store.category} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;