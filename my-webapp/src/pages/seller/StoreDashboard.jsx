import React, { useState, useEffect } from 'react';
import { 
  Store, Calendar, Package, DollarSign, TrendingUp, Users, 
  Settings, Edit, Eye, Clock, CheckCircle, XCircle, AlertCircle,
  Phone, MapPin, Star, Camera, Plus, Bell, Search, BarChart3,
  PieChart, Activity, ShoppingBag, Home, Menu, X,
  Image,
  StoreIcon,
  MessageCircle,
  LogOut,
  Tag,
  CreditCard,
  CalendarCheck,
  IndianRupee
} from 'lucide-react';
import { useAuth } from '../../context/UserContext';
import { SERVER_URL } from '../../Config';
import axios from 'axios';
import toast from 'react-hot-toast';
import AppointmentManagement from '../../components/Store/AppointmentManagement';
import OrderManagement from '../../components/Store/OrderManagement';
import ProductManagement from '../../components/Store/ProductManagement';
import GalleryManagement from '../../components/Store/GalleryManagement';
import { useNavigate } from 'react-router-dom';
import OfferManagement from '../../components/Store/OfferManagement';
import SubscriptionController from '../../components/Store/Subscription';
import StoreSettings from '../../components/Store/StoreSettings';
import RestaurantOrderScreen from '../../components/Store/OrderTaking';
import ServiceManagementPage from '../../components/Store/Ticketing';
import DailyReportSection from '../../components/Store/DailyReport';
import { MonthlyReportSection, WeeklyReportSection } from '../../components/Store/WeeklyMonthlyreport';

const StoreDashboard = () => {
    const navigate = useNavigate();
     const { user, token,setUser,logout } = useAuth() || {};
  const [store, setStore] = useState(null);
  const [revenueData, setRevenueData] = useState(null); // NEW: revenue state
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('product');
  const [passwordPrompt, setPasswordPrompt] = useState({ show: false, page: '' });
  const [passwordInput, setPasswordInput] = useState('');
  const [authenticatedPages, setAuthenticatedPages] = useState(new Set());  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
const [weeklyDataLoading, setWeeklyDataLoading] = useState(false);
const [monthlyDataLoading, setMonthlyDataLoading] = useState(false);
const [showWeeklyReport, setShowWeeklyReport] = useState(false);
const [showMonthlyReport, setShowMonthlyReport] = useState(false);
const [selectedWeek, setSelectedWeek] = useState(() => {
  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
});
const [selectedWeekYear, setSelectedWeekYear] = useState(new Date().getFullYear());

// Monthly report states
const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
const [selectedMonthYear, setSelectedMonthYear] = useState(new Date().getFullYear());

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
const [dailyDataLoading, setDailyDataLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState([]);
const [newUpi, setNewUpi] = useState("");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayAppointments: 0,
    pendingOrders: 0,
  });
  useEffect(() => {
    const fetchSeller = async () => {
      try {
        setLoading(true); // Optional: explicitly set loading to true at start
        
        if (user !== null) {
          const response = await axios.get(`${SERVER_URL}/stores/user/${user._id}`);
        
          setStore(response.data);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false); // ✅ This was missing!
      }
    };
  
    fetchSeller();
  
    // You can also remove this mock stats since you have fetchStats function
    setStats({
      pendingAppointments: 12,
      completedAppointments: 38,
      totalRevenue: 2450,
    });
  }, [user]);

 // 2️⃣ Fetch Daily Data when store._id is available
 const fetchDailyData = async (date = null) => {
  try {
    setDailyDataLoading(true);
    if (!store?._id) return;

    const dateParam = date || selectedDate;
    const res = await axios.get(
      `${SERVER_URL}/reports/sales/daily/${store._id}?date=${dateParam}`
    );

    if (res.data.success) {
      setDailyData(res.data.data);
    } else {
      toast.error("No data found for selected date");
      setDailyData(null);
    }
  } catch (err) {
    console.error("Error fetching daily sales:", err);
    toast.error("Error fetching daily sales data");
    setDailyData(null);
  } finally {
    setDailyDataLoading(false);
  }
};

// Update the useEffect that fetches daily data
useEffect(() => {
  fetchDailyData();
}, [store?._id, selectedDate]);

const handleDateChange = (newDate) => {
  setSelectedDate(newDate);
  fetchDailyData(newDate);
};

  
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // ✅ 1. Fetch Analytics Data
        const analyticsRes = await axios.get(`${SERVER_URL}/stores/store-analetics/${store._id}`);
        const analytics = analyticsRes.data.data;

        setAnalyticsData(analytics);
  
        // ✅ 2. Calculate Stats from Analytics
        const totals = analytics.reduce((acc, item) => ({
          totalAppointments: acc.totalAppointments + item.totalAppointments,
          completedAppointments: acc.completedAppointments + item.completedAppointments,
          cancelledAppointments: acc.cancelledAppointments + item.cancelledAppointments,
          totalOrders: acc.totalOrders + item.totalOrders,
          confirmedOrders: acc.confirmedOrders + item.confirmedOrders,
          cancelledOrders: acc.cancelledOrders + item.cancelledOrders,
          deliveredOrders: acc.deliveredOrders + item.deliveredOrders,
          totalRevenue: acc.totalRevenue + item.totalRevenue
        }), {
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          totalOrders: 0,
          confirmedOrders: 0,
          cancelledOrders: 0,
          deliveredOrders: 0,
          totalRevenue: 0
        });
  
        const pendingAppointments = totals.totalAppointments - totals.completedAppointments - totals.cancelledAppointments;
        const pendingOrders = totals.totalOrders - totals.confirmedOrders - totals.cancelledOrders - totals.deliveredOrders;
  
        setStats({
          totalRevenue: totals.totalRevenue,
          todayAppointments: totals.totalAppointments,
          pendingOrders,
          completedAppointments: totals.completedAppointments,
          cancelledAppointments: totals.cancelledAppointments,
          pendingAppointments,
          confirmedOrders: totals.confirmedOrders,
          cancelledOrders: totals.cancelledOrders,
          deliveredOrders: totals.deliveredOrders
        });
  
        // ✅ 3. Fetch Revenue Data (new API)
        const revenueRes = await axios.get(`${SERVER_URL}/stores/revenue/${store._id}`);
    
        setRevenueData(revenueRes.data);
  
      } catch (err) {
        console.error("Error fetching analytics or revenue:", err);
        setAnalyticsData([]);
        setRevenueData(null);
      }
    };
  
    if (store?._id) {
      fetchAnalytics();
    }
  }, [store]);
 
  const verifyPassword = () => {
    if (passwordInput === store?.security?.password) {
      // Correct password - grant access
      setAuthenticatedPages(prev => new Set([...prev, passwordPrompt.page]));
      setPasswordPrompt({ show: false, page: '' });
      setPasswordInput('');
      toast.success('Access granted!');
    } else {
      // Wrong password
      toast.error('Incorrect password');
      setPasswordInput('');
    }
  };
  
  // 3. ADD FUNCTION TO CHECK IF PAGE IS ACCESSIBLE
  const isPageAccessible = (pageId) => {
    const securedPages = store?.security?.pages || [];
    
    // If page is not secured, allow access
    if (!securedPages.includes(pageId)) {
      return true;
    }
    
    // If page is secured, check if authenticated
    return authenticatedPages.has(pageId);
  };
  
  const handleTabClick = (tabId) => {
    const securedPages = store?.security?.pages || [];
    
    if (securedPages.includes(tabId) && !authenticatedPages.has(tabId)) {
      // Show password prompt instead of changing tab
      setPasswordPrompt({ show: true, page: tabId });
      return;
    }
    
    // Safe to change tab
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const PasswordModal = () => {
    if (!passwordPrompt.show) return null;
  
    const handleSubmit = () => {
      if (passwordInput === store?.security?.password) {
        setAuthenticatedPages(prev => new Set([...prev, passwordPrompt.page]));
        setActiveTab(passwordPrompt.page); // ✅ NOW set active tab after verification
        setPasswordPrompt({ show: false, page: '' });
        setPasswordInput('');
        setSidebarOpen(false);
        toast.success('Access granted!');
      } else {
        toast.error('Incorrect password');
        setPasswordInput('');
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-96 max-w-md mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔒 Enter Password
          </h3>
          <p className="text-gray-600 mb-4">
            This page requires authentication to view content.
          </p>
          
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent mb-4"
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          
          <div className="flex space-x-3">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Access Page
            </button>
            <button
              onClick={() => {
                setPasswordPrompt({ show: false, page: '' });
                setPasswordInput('');
              }}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };



  // Fetch Weekly Data Function
const fetchWeeklyData = async (week = null, year = null) => {
  try {
    setWeeklyDataLoading(true);
    if (!store?._id) return;
 
    const weekParam = week || selectedWeek;
    const yearParam = year || selectedWeekYear;
    
    const res = await axios.get(
      `${SERVER_URL}/reports/sales/weekly/${store._id}`
    );
 
    if (res.data.success) {
   
      
      setWeeklyData(res.data.data);
    } else {
      toast.error("No weekly data found for selected period");
      setWeeklyData(null);
    }
  } catch (err) {
    console.error("Error fetching weekly sales:", err);
    toast.error("Error fetching weekly sales data");
    setWeeklyData(null);
  } finally {
    setWeeklyDataLoading(false);
  }
 };
 
 // Fetch Monthly Data Function
 const fetchMonthlyData = async (month = null, year = null) => {
  try {
    setMonthlyDataLoading(true);
    if (!store?._id) return;
 
    const monthParam = month || selectedMonth;
    const yearParam = year || selectedMonthYear;
    
    const res = await axios.get(
      `${SERVER_URL}/reports/sales/monthly/${store._id}`
    );
 
    if (res.data.success) {
      
      setMonthlyData(res.data.data);
    } else {
      toast.error("No monthly data found for selected period");
      setMonthlyData(null);
    }
  } catch (err) {
    console.error("Error fetching monthly sales:", err);
    toast.error("Error fetching monthly sales data");
    setMonthlyData(null);
  } finally {
    setMonthlyDataLoading(false);
  }
 };
 
 // Handle Week Changes
 const handleWeekChange = (newWeek, newYear) => {
  setSelectedWeek(newWeek);
  setSelectedWeekYear(newYear);
  fetchWeeklyData(newWeek, newYear);
 };
 
 // Handle Month Changes
 const handleMonthChange = (newMonth, newYear) => {
  setSelectedMonth(newMonth);
  setSelectedMonthYear(newYear);
  fetchMonthlyData(newMonth, newYear);
 };
 
 // Functions to show/hide reports
 const handleShowWeeklyReport = () => {
  setShowWeeklyReport(true);
  setShowMonthlyReport(false);
  if (!weeklyData) {
    fetchWeeklyData();
  }
 };

 
 const handleShowMonthlyReport = () => {
  setShowMonthlyReport(true);
  setShowWeeklyReport(false);
  if (!monthlyData) {
    fetchMonthlyData();
  }
 };
  const handleUpiUpdate = async () => {
    try {
      const storeId=store._id

      
      await axios.put(`${SERVER_URL}/stores/update-upi/${storeId}`, { upi: newUpi });
      alert("UPI Updated successfully");
      setStore((prev) => ({ ...prev, upi: newUpi }));
    } catch (err) {
      console.error(err);
      alert("Failed to update UPI");
    }
  };
  const appointmentStatusData = [
    { name: 'Completed', value: stats.completedAppointments || 0, color: '#14b8a6' },
    { name: 'Pending', value: stats.pendingAppointments || 0, color: '#f59e0b' },
    { name: 'Cancelled', value: stats.cancelledAppointments || 0, color: '#ef4444' }
  ];
  
  // Option 2: Order Status Pie Chart
  const orderStatusData = [
    { name: 'Delivered', value: stats.deliveredOrders || 0, color: '#14b8a6' },
    { name: 'Confirmed', value: stats.confirmedOrders || 0, color: '#3b82f6' },
    { name: 'Pending', value: stats.pendingOrders || 0, color: '#f59e0b' },
    { name: 'Cancelled', value: stats.cancelledOrders || 0, color: '#ef4444' }
  ];
  const businessOverviewData = [
    { name: 'Total Appointments', value: stats.todayAppointments || 0, color: '#14b8a6' },
    { name: 'Total Orders', value: (stats.confirmedOrders + stats.deliveredOrders + stats.pendingOrders + stats.cancelledOrders) || 0, color: '#3b82f6' }
  ];

  const sidebarItems = store?.category === "Restaurant"
  ? [
      { id: 'overview', label: 'Overview', icon: Home },
      { id: 'Create', label: 'Create', icon: Plus },
      { id: 'Reservation', label: 'Reservation', icon: CalendarCheck },
      { id: 'Offers', label: 'Offers', icon: Tag },
      { id: 'appointments', label: 'Appointments', icon: Calendar },
      { id: 'orders', label: 'Orders', icon: Package },
      { id: 'product', label: 'Product / Service', icon: StoreIcon },
      { id: 'gallery', label: 'gallery', icon: Image },
      { id: 'subscription', label: 'Subscription', icon: CreditCard },
      { id: 'settings', label: 'Settings', icon: Settings },
    ]
  : [
      { id: 'overview', label: 'Overview', icon: Home },
      { id: 'Offers', label: 'Offers', icon: Tag },
      { id: 'appointments', label: 'Appointments', icon: Calendar },
      { id: 'orders', label: 'Orders', icon: Package },
      { id: 'product', label: 'Product / Service', icon: StoreIcon },
      { id: 'gallery', label: 'gallery', icon: Image },
      { id: 'subscription', label: 'Subscription', icon: CreditCard },
      { id: 'settings', label: 'Settings', icon: Settings },
    ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading store dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">  
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:fixed lg:flex lg:flex-col`}>

        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Store Dashboard</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <nav className="flex-1 mt-6 px-4">
        {sidebarItems.map((item) => (
  <button
    key={item.id}
    onClick={() => handleTabClick(item.id)}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl mb-2 transition-all ${
      activeTab === item.id
        ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-500'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <item.icon className="w-5 h-5" />
    <span className="font-medium">{item.label}</span>
    {/* Show lock icon for secured pages */}
    {store?.security?.pages?.includes(item.id) && !authenticatedPages.has(item.id) && (
      <div className="ml-auto text-red-500">
        🔒
      </div>
    )}
  </button>
))}

        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{store?.storeName}</h1>
                  <p className="text-sm text-teal-600">{store?.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                
                <button   onClick={() => navigate('/chat')} className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <MessageCircle  className="w-8 h-8" />
                  
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">           
        <div >  
            {/* Store Info Card - Always visible */}
            {activeTab === 'overview' && (
            <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-32 relative">
                <div className="absolute -bottom-12 left-8">
                  <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    {store?.profileImage ? (
                      <img src={store.profileImage} alt="Store" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-teal-600">
                        {store?.storeName?.charAt(0) || 'S'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-16 pb-6 px-8">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
                  <div className="mb-6 lg:mb-0">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{store?.storeName}</h2>
                    <p className="text-gray-600 mb-4">{store?.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-teal-500" />
                        <span>{store?.place}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2 text-teal-500" />
                        <span>{store?.phone}</span>
                      </div>
                     
                    </div>
                  </div>
                  <div className="text-left lg:text-right">
                    <div className="flex items-center mb-4">
                      <Star className="w-5 h-5 text-yellow-400 mr-1" />
                      <span className="text-xl font-bold text-gray-900">{store?.averageRating}</span>
                      <span className="text-gray-600 ml-2">({store?.numberOfRatings} reviews)</span>
                    </div>
                    <div className="mt-4 flex items-center space-x-4">
  <label className="flex items-center cursor-pointer">
    <div className="relative">
      <input
        type="checkbox"
        className="sr-only"
        checked={store?.isActive}
        onChange={async () => {
          try {
            const newStatus = !store?.isActive;
            await axios.put(`${SERVER_URL}/stores/toggle-active/${store._id}`, { isActive: newStatus });
            setStore((prev) => ({ ...prev, isActive: newStatus }));
            toast.success(`Store turned ${newStatus ? 'ON' : 'OFF'}`);
          } catch (err) {
            toast.error("Failed to update store status");
            console.error(err);
          }
        }}
      />
      <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${store?.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
      <div
        className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${
          store?.isActive ? 'translate-x-6' : ''
        }`}
      ></div>
    </div>
    <span className="ml-3 text-gray-900 font-medium">
      {store?.isActive ? 'Shop is ON' : 'Shop is OFF'}
    </span>
  </label>
</div>
                    <button
  onClick={() =>
    navigate('/newStore', {
      state: {
        editMode: true,
        storeData: store
      }
    })
  }
  className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center"
>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Store
                    </button>
                  </div>
                </div>
              </div>
            </div>)}

            {/* Stats Cards - Show only on overview */}
            {activeTab === 'overview' && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    {/* Total Revenue */}
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">This Month's Revenue</p>
          <p className="text-3xl font-bold text-gray-900">₹{revenueData?.revenue?.month?.toLocaleString() || 0}</p>
          <p className="text-sm text-teal-600 mt-1">
            Yearly: ₹{revenueData?.revenue?.year?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-teal-100 p-3 rounded-full">
          <DollarSign className="w-6 h-6 text-teal-600" />
        </div>
      </div>
    </div>

    {/* Appointments Revenue */}
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Appointments Revenue</p>
          <p className="text-3xl font-bold text-gray-900">₹{revenueData?.revenue?.breakdown?.appointments?.month?.toLocaleString() || 0}</p>
          <p className="text-sm text-green-600 mt-1">
            Yearly: ₹{revenueData?.revenue?.breakdown?.appointments?.year?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-green-100 p-3 rounded-full">
          <Calendar className="w-6 h-6 text-green-600" />
        </div>
      </div>
    </div>

    {/* Orders Revenue */}
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Orders Revenue</p>
          <p className="text-3xl font-bold text-gray-900">₹{revenueData?.revenue?.breakdown?.orders?.month?.toLocaleString() || 0}</p>
          <p className="text-sm text-blue-600 mt-1">
            Yearly: ₹{revenueData?.revenue?.breakdown?.orders?.year?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-blue-100 p-3 rounded-full">
          <Package className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
   
  
  </div>
  
)}


{activeTab === 'overview' && (
 <div className="space-y-8">
   {/* Daily Report - your existing component */}
   <DailyReportSection 
     dailyData={dailyData}
     onDateChange={handleDateChange}
     isLoading={dailyDataLoading}
     selectedDate={selectedDate}
   />

   {/* Report Action Buttons */}
   <div className="flex flex-wrap gap-4 justify-center">
     <button
       onClick={handleShowWeeklyReport}
       className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
         showWeeklyReport 
           ? 'bg-blue-600 text-white shadow-lg' 
           : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
       }`}
     >
       <BarChart3 className="w-5 h-5" />
       <span>📊 Weekly Report</span>
     </button>
     
     <button
       onClick={handleShowMonthlyReport}
       className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
         showMonthlyReport 
           ? 'bg-purple-600 text-white shadow-lg' 
           : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50'
       }`}
     >
       <PieChart className="w-5 h-5" />
       <span>📈 Monthly Report</span>
     </button>
     
     {(showWeeklyReport || showMonthlyReport) && (
       <button
         onClick={() => {
           setShowWeeklyReport(false);
           setShowMonthlyReport(false);
         }}
         className="px-6 py-3 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center space-x-2"
       >
         <X className="w-5 h-5" />
         <span>Close Reports</span>
       </button>
     )}
   </div>

   {/* Weekly Report Component */}
   {showWeeklyReport && (
     <WeeklyReportSection
       weeklyData={weeklyData}
       onWeekChange={handleWeekChange}
       isLoading={weeklyDataLoading}
       selectedWeek={selectedWeek}
       selectedYear={selectedWeekYear}
     />
   )}

   {/* Monthly Report Component */}
   {showMonthlyReport && (
     <MonthlyReportSection
       monthlyData={monthlyData}
       onMonthChange={handleMonthChange}
       isLoading={monthlyDataLoading}
       selectedMonth={selectedMonth}
       selectedYear={selectedMonthYear}
     />
   )}

   {/* Charts Row - your existing content */}
   <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
     <button
       onClick={() => navigate('/qr')}
       className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl mt-4 transition duration-300"
     >
       📲 QR Page
     </button>
   </div>
 </div>
)}
   

{activeTab === 'Create' && isPageAccessible('Create') && (
  <RestaurantOrderScreen store={store}/>
)}

{activeTab === 'Offers' && isPageAccessible('Offers') && (
  <OfferManagement storeId={store._id}/>
)}

{activeTab === 'appointments' && isPageAccessible('appointments') && (
  <AppointmentManagement storeId={store._id} />
)}

{activeTab === 'orders' && isPageAccessible('orders') && (
  <OrderManagement store={store}/>
)}

{activeTab === 'product' && isPageAccessible('product') && (
  <ProductManagement store={store}/>
)}

{activeTab === 'gallery' && isPageAccessible('gallery') && (
  <GalleryManagement storeId={store._id}/>
)}

{activeTab === 'subscription' && isPageAccessible('subscription') && (
  <SubscriptionController store={store}/>
)}
{activeTab === 'Reservation' && isPageAccessible('Reservation') && (
  <ServiceManagementPage store={store}/>
)}

{activeTab === 'settings' && isPageAccessible('settings') && (
  <StoreSettings 
    store={store}
    handleUpiUpdate={handleUpiUpdate}
    newUpi={newUpi}
    setNewUpi={setNewUpi}
    logout={logout}
  />
)}

{/* ✅ SHOW ACCESS DENIED MESSAGE FOR SECURED PAGES */}
{store?.security?.pages?.includes(activeTab) && !authenticatedPages.has(activeTab) && (
  <div className="flex items-center justify-center min-h-96">
    <div className="text-center">
      <div className="text-6xl mb-4">🔒</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
      <p className="text-gray-600 mb-4">This page is password protected</p>
      <button
        onClick={() => setPasswordPrompt({ show: true, page: activeTab })}
        className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
      >
        Enter Password
      </button>
    </div>
  </div>
)}
<PasswordModal />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDashboard;