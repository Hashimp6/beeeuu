import React, { useState, useEffect } from 'react';
import { 
  Store, Calendar, Package, DollarSign, TrendingUp, Users, 
  Settings, Edit, Eye, Clock, CheckCircle, XCircle, AlertCircle,
  Phone, MapPin, Star, Camera, Plus, Bell, Search, BarChart3,
  PieChart, Activity, ShoppingBag, Home, Menu, X,
  Image,
  StoreIcon,
  MessageCircle,
  LogOut
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

const StoreDashboard = () => {
    const navigate = useNavigate();
     const { user, token,setUser,logout } = useAuth() || {};
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('product');
    const [upiDropdownVisible, setUpiDropdownVisible] = useState(false);
  const [upiModalVisible, setUpiModalVisible] = useState(false);
  const [upiInput, setUpiInput] = useState("");
  const [isUpdatingUpi, setIsUpdatingUpi] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
    todayAppointments: 0,
    cancelledAppointments: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        setLoading(true); // Optional: explicitly set loading to true at start
        
        if (user !== null) {
          const response = await axios.get(`${SERVER_URL}/stores/user/${user._id}`);
          console.log("storeee", response.data);
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
  const fetchStats = async () => {
    try {
      // Mock data - replace with real API calls
      setStats({
        pendingAppointments: 12,
        completedAppointments: 145,
        totalRevenue: 18500,
        todayAppointments: 8,
        cancelledAppointments: 3,
        totalOrders: 89,
        pendingOrders: 5,
        completedOrders: 78
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  const handleUpdateUpi = async () => {
    if (!upiInput.trim()) {
      toast.error("Please enter a valid UPI ID");
      return;
    }
  
    setIsUpdatingUpi(true);
  
    try {
      const storeId = store._id;
      const response = await axios.put(
        `${SERVER_URL}/upi/${storeId}/upi`,
        { upi: upiInput },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.data.success) {
        setUser((prevUser) => ({
          ...prevUser,
          upi: upiInput
        }));
  
        toast.success("UPI ID updated successfully!");
  
        setUpiModalVisible(false);
        setUpiDropdownVisible(false);
      } else {
        toast.error("Failed to update UPI ID");
      }
    } catch (error) {
      console.error("Error updating UPI:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsUpdatingUpi(false);
    }
  };
  
//   const handleEditStore = () => {
//     // Navigate to NewStore with existing store data
//     navigation.navigate("NewStore", {
//       editMode: true,
//       storeData: {
//         _id:store._id,
//         storeName: store.storeName || store.name,
//         description: store.description,
//         place: store.place,
//         category: store.category,
//         phone: store.phone,
//         profileImage: store.profileImage,
//         // Add any other fields you want to pre-fill
//       }
//     });
//   };

  // Simple chart components
  const SimpleBarChart = ({ data, title }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="flex items-end justify-between h-64 space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="w-full bg-gray-200 rounded-t-lg relative overflow-hidden">
              <div 
                className="bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-lg transition-all duration-1000 ease-out"
                style={{ height: `${(item.value / Math.max(...data.map(d => d.value))) * 200}px` }}
              ></div>
            </div>
            <div className="mt-3 text-center">
              <div className="text-sm font-medium text-gray-900">{item.value}</div>
              <div className="text-xs text-gray-500">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SimplePieChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="w-48 h-48 rounded-full bg-gray-200 relative overflow-hidden">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const angle = (percentage / 100) * 360;
                return (
                  <div
                    key={index}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(${item.color} 0deg ${angle}deg, transparent ${angle}deg 360deg)`,
                      transform: `rotate(${data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 360, 0)}deg)`
                    }}
                  ></div>
                );
              })}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{total}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const appointmentData = [
    { label: 'Mon', value: 12 },
    { label: 'Tue', value: 19 },
    { label: 'Wed', value: 15 },
    { label: 'Thu', value: 22 },
    { label: 'Fri', value: 28 },
    { label: 'Sat', value: 35 },
    { label: 'Sun', value: 18 }
  ];

  const statusData = [
    { name: 'Completed', value: stats.completedAppointments, color: '#14b8a6' },
    { name: 'Pending', value: stats.pendingAppointments, color: '#f59e0b' },
    { name: 'Cancelled', value: stats.cancelledAppointments, color: '#ef4444' }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'product', label: 'Product / Service', icon: StoreIcon },
    { id: 'gallery', label: 'gallery', icon: Image },
    { id: 'settings', label: 'Settings', icon: Settings }
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
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl mb-2 transition-all ${
                activeTab === item.id
                  ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
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
                
                <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <MessageCircle  className="w-8 h-8" />
                  
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">           
        <div className="p-4 sm:p-6 lg:p-8">  
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                      <p className="text-sm text-teal-600 mt-1">↑ 12% from last month</p>
                    </div>
                    <div className="bg-teal-100 p-3 rounded-full">
                      <DollarSign className="w-6 h-6 text-teal-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.todayAppointments}</p>
                      <p className="text-sm text-green-600 mt-1">↑ 3 from yesterday</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                      <p className="text-sm text-blue-600 mt-1">Need attention</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Customers</p>
                      <p className="text-3xl font-bold text-gray-900">{store?.reviews || 0}</p>
                      <p className="text-sm text-purple-600 mt-1">Active users</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Charts Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <SimpleBarChart data={appointmentData} title="Weekly Appointments" />
                  <SimplePieChart data={statusData} title="Appointment Status" />
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center space-x-3 p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
                      <Plus className="w-5 h-5 text-teal-600" />
                      <span className="font-medium text-teal-700">Add New Product/Service</span>
                    </button>
                    <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <Plus className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-700">Post Image or Vedio</span>
                    </button>
                    <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                      <Plus className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-700">Add Offer</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
            <AppointmentManagement storeId={store._id} />
            )}

            {activeTab === 'orders' && (
            <OrderManagement storeId={store._id}/>
            )}
             {activeTab === 'product' && (
            <ProductManagement storeId={store._id}/>
            )}
               {activeTab === 'gallery' && (
            <GalleryManagement storeId={store._id}/>
            )}


            {activeTab === 'settings' && (
              <div className="space-y-6">
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Store Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 
                    {[
                      { title: 'Products', description: 'Manage your store products', icon: ShoppingBag, color: 'teal' },
                      { title: 'Gallery', description: 'Upload and manage store images', icon: Camera, color: 'purple' },
                      { title: 'Business Hours', description: 'Set your operating hours', icon: Clock, color: 'green' },
                      { title: 'Services', description: 'Manage your services', icon: Settings, color: 'blue' },
                      { title: 'Payment Settings', description: 'Configure payment methods', icon: DollarSign, color: 'orange' },
                      { title: 'Analytics', description: 'View detailed reports', icon: TrendingUp, color: 'red' }
                    ].map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer hover:border-teal-300">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-full bg-${item.color}-100 flex-shrink-0`}>
                            <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      </div>
                      
                    ))}
                  </div>
                </div>
                <div className="pt-6 border-t mt-6 ml-6">
  <button
    onClick={logout}
    className="flex items-center space-x-2 text-red-600 font-semibold hover:text-red-700 transition-colors"
  >
    <LogOut className="w-5 h-5" />
    <span>Logout</span>
  </button>
</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDashboard;