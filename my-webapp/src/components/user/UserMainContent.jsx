import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ChevronDown, Mail, Phone, MapPin, Edit2, Calendar, FileText, LogOut, LogIn, User, X, Menu } from 'lucide-react';
import { useAuth } from '../../context/UserContext';
import StoreCard from '../StoreCard';
import axios from 'axios';
import { SERVER_URL } from '../../Config';
import { useNavigate } from 'react-router-dom';
import UserProfileComponent from './UserProfileComponent';
import UserAppointmentsOrders from '../../pages/user/AppointmentsAndOrders';
import UserReservationComponent from './UserReservation';

const MainAreaComponent = ({ selectedFilters, onFiltersChange, select, isGuest = false }) => {
  const { user, token, setUser, setToken, location, isAuthenticated } = useAuth(); 
  const navigate = useNavigate();
  const [history, setHistory] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [show, setShow] = useState(false);
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryNames, setCategoryNames] = useState([]);
  const [dropdowns, setDropdowns] = useState({
    distance: false,
    nearby: false,
    category: false
  });

  const [filters, setFilters] = useState(selectedFilters || {
    distance: '20 km',
    nearby: 'Default',
    category: 'All Categories'
  });

  // Default coordinates for guests (Kochi, Kerala as per user location)
  const DEFAULT_COORDINATES = {
    latitude: 9.9312,
    longitude: 76.2673
  };

  useEffect(() => {
    if (history === 'reservation' && user?._id) {
      const fetchReservationData = async () => {
        try {
          const ticketRes = await axios.get(`${SERVER_URL}/booking/tickets/${user._id}`);
          console.log('Ticket:', ticketRes.data);
  
          const tableRes = await axios.get(`${SERVER_URL}/booking/table/${user._id}`);
          console.log('Table:', tableRes.data);
        } catch (err) {
          console.error('Error fetching reservation data:', err);
        }
      };
  
      fetchReservationData();
    }
  }, [history, user]);

  
  
  useEffect(() => {
    setShow(select);
  }, [select]);

  // Debounce search text
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Auto-search when debounced text changes
  useEffect(() => {
    if (debouncedSearchText.trim()) {
      fetchStores(debouncedSearchText, {
        ...filters,
        distance: "500",
      });
    } else if (debouncedSearchText === '') {
      fetchStores('', filters);
    }
  }, [debouncedSearchText, filters]);

  // Handle authentication check for logged-in users
  useEffect(() => {
    if (!isGuest && (!user || !token)) {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('authToken');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    }
  }, [user, token, setUser, setToken, isGuest]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/category/group`);
      const data = response.data;
  
      const allSubcategories = [];
      data.forEach(mainCategory => {
        mainCategory.categories.forEach(subCategory => {
          allSubcategories.push(subCategory.name);
        });
      });
      
      setCategoryNames(['All Categories', ...allSubcategories]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      // Enhanced fallback categories for guests
      const fallbackCategories = [
        'All Categories',
        'Restaurants',
        'Cafes',
        'Shopping',
        'Services',
        'Healthcare',
        'Beauty & Spa',
        'Automotive',
        'Electronics',
        'Grocery'
      ];
      
      setCategoryNames(fallbackCategories);
      
      // Don't show error to guests, just log it
      if (!isGuest) {
        setError('Could not load categories. Please try again later.');
      }
    }
  };
  
  const fetchStores = useCallback(async (searchTerm = '', filterData = filters) => {

    // Get coordinates - use default for guests or when location is not available
    let latitude, longitude;
    
    if (location?.location?.coordinates) {
      latitude = location.location.coordinates[1];
      longitude = location.location.coordinates[0];
    } else {
      // Use default coordinates for guests
      latitude = DEFAULT_COORDINATES.latitude;
      longitude = DEFAULT_COORDINATES.longitude;
      
      // Optionally show a subtle notice to guests about location
      if (isGuest && !error) {
        console.log('Using default location for guest user');
      }
    }
    
    setLoading(true);
    setError(null);
  
    try {
      const distanceValue = parseInt(filterData.distance.split(' ')[0]);
  
      const getSortByValue = (nearby) => {
        switch (nearby.toLowerCase()) {
          case 'rating': return 'averageRating';
          case 'distance': return 'distance';
          case 'newest': return 'createdAt';
          case 'most popular': return 'numberOfRatings';
          default: return 'distance';
        }
      };
  
      const params = {
        latitude,
        longitude,
        radius: distanceValue,
        limit: 30,
        page: 1,
        sortBy: getSortByValue(filterData.nearby),
        sortOrder: filterData.nearby.toLowerCase() === 'rating' ? 'desc' : 'asc'
      };
  
      if (filterData.category !== 'All Categories') {
        params.category = filterData.category;
      }
  
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
  
      // Enhanced headers handling
      const headers = {
        'Content-Type': 'application/json'
      };
  
      // Only include auth for logged-in users
      if (!isGuest && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
  
      const response = await axios.get(`${SERVER_URL}/stores/nearby`, {
        params,
        headers,
        timeout: 10000 // Add timeout for better UX
      });
  
      // Enhanced response handling
      let storesData = [];
      
      if (response.data && response.data.data && response.data.data.stores) {
        storesData = response.data.data.stores;
      } else if (response.data.stores) {
        storesData = response.data.stores;
      } else if (Array.isArray(response.data)) {
        storesData = response.data;
      }
  
      setStores(storesData || []);
  
    } catch (err) {
      console.error('Store fetch error:', err);
      
      let errorMessage = 'Failed to fetch stores';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.response?.status === 401) {
        if (isGuest) {
          // For guests, try to show stores without auth-required features
          errorMessage = 'Showing limited store information. Login for full features.';
        } else {
          errorMessage = 'Session expired. Please login again.';
        }
      } else if (err.response?.status === 403) {
        errorMessage = isGuest ? 
          'Some features require login. Showing available stores.' : 
          'Access denied. Please check your permissions.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = err.response?.data?.message || 
                      err.response?.data?.error || 
                      err.message || 
                      'Failed to fetch stores';
      }
      
      setError(errorMessage);
      
      // For guests, you might want to show cached/fallback data
      if (isGuest && err.response?.status === 401) {
        // Could implement fallback data here if needed
      }
      
    } finally {
      setLoading(false);
    }
  }, [filters, isGuest, token, location]);
  
  useEffect(() => {
    const loadInitialData = async () => {
  
      // Always fetch stores (works for both guests and logged-in users)
      await fetchStores('', filters);
      
      // Always try to fetch categories
      fetchCategories();
    };

    loadInitialData();
  }, [fetchStores, filters]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchStores(searchQuery, filters);
    }
  };

  const toggleDropdown = (type) => {
    setDropdowns(prev => ({
      distance: false,
      nearby: false,
      category: false,
      [type]: !prev[type]
    }));
  };

  const selectFilter = (type, value) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
    setDropdowns(prev => ({ ...prev, [type]: false }));

    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }

    fetchStores(searchQuery, newFilters);
  };

  const handleCardClick = (store) => {
    const storeSlug = store.storeName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/storeprofile/${storeSlug}`, { state: { store } });
  };

  const clearFilters = () => {
    const defaultFilters = {
      distance: '20 km',
      nearby: 'Default',
      category: 'All Categories'
    };
    setFilters(defaultFilters);
    setDropdowns({ distance: false, nearby: false, category: false });
    fetchStores(searchQuery, defaultFilters);
  };

  // Guest Location Notice Component
  const GuestLocationNotice = () => (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-2">
        <MapPin size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="text-blue-800 font-medium">Using default location</p>
          <p className="text-blue-600">
            Showing stores near Kochi, Kerala. 
            <button 
              onClick={() => navigate('/login')} 
              className="underline hover:text-blue-800 ml-1"
            >
              Login
            </button> for personalized location-based results.
          </p>
        </div>
      </div>
    </div>
  );
  
  // Enhanced Error Display Component
  const ErrorDisplay = ({ error, isGuest, onRetry }) => {
    if (!error) return null;
    
    const isAuthError = error.includes('login') || error.includes('Session expired');
    
    return (
      <div className={`mb-4 p-3 border rounded-lg ${
        isAuthError ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className={`text-sm ${
              isAuthError ? 'text-yellow-800' : 'text-red-600'
            }`}>
              {error}
            </p>
            {isGuest && isAuthError && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Login
                </button>
                <button
                  onClick={onRetry}
                  className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleBackToMain = () => {
    setHistory(null);
  };

  const getAppointmentOrderType = () => {
    if (history === 'appointment' || history === 'appointments') {
      return 'appointments';
    }
    if (history === 'order' || history === 'orders') {
      return 'orders';
    }
  
    return null;
  };

  // Handle profile access for guests
  const handleProfileAccess = () => {
    if (isGuest) {
      navigate('/login');
      return;
    }
    setShow(true);
  };

  // Show login prompt for guests trying to access profile features
  if (show && isGuest) {
    return (
      <div className="flex items-center justify-center h-[calc(98vh-64px)] bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <User size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to access your profile and account features.</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => setShow(false)}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (show && !history) {
    return (
      <div className="lg:hidden bg-gray-50 p-4 h-[calc(98vh-64px)] overflow-y-auto">
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setShow(false)}
            className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            <X size={18} />
          </button>
        </div>
        <UserProfileComponent setHistory={setHistory} />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
      {/* Mobile Horizontal Filters */}
      {!history && (
        <div className="lg:hidden bg-white border-b border-gray-200 py-2 px-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Filter size={16} className="text-gray-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-800 flex-shrink-0">Filters:</span>
            
            {/* Distance Filter - Mobile */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => toggleDropdown('distance')}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1.5 rounded-full text-xs font-medium text-gray-700 transition-colors whitespace-nowrap"
              >
                <span>{filters.distance}</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform ${dropdowns.distance ? 'rotate-180' : ''}`}
                />
              </button>
              {dropdowns.distance && (
                <div className="fixed z-[9999] top-20 left-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {[5, 10, 20, 50, 100, 250, 500].map((dist) => (
                    <button
                      key={dist}
                      onClick={() => selectFilter('distance', `${dist} km`)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${filters.distance === `${dist} km` ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                    >
                      {dist} km
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Filter - Mobile */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => toggleDropdown('nearby')}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1.5 rounded-full text-xs font-medium text-gray-700 transition-colors whitespace-nowrap"
              >
                <span>{filters.nearby}</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform ${dropdowns.nearby ? 'rotate-180' : ''}`}
                />
              </button>
              {dropdowns.nearby && (
                <div className="fixed z-[9999] top-20 left-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {['Default', 'Rating', 'Distance', 'Newest', 'Most Popular'].map((item) => (
                    <button
                      key={item}
                      onClick={() => selectFilter('nearby', item)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${filters.nearby === item ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter - Mobile */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => toggleDropdown('category')}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1.5 rounded-full text-xs font-medium text-gray-700 transition-colors whitespace-nowrap"
              >
                <span>{filters.category}</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform ${dropdowns.category ? 'rotate-180' : ''}`}
                />
              </button>
              {dropdowns.category && (
                <div className="fixed z-[9999] top-20 left-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {categoryNames.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => selectFilter('category', cat)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${filters.category === cat ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={clearFilters}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Desktop Filter Sidebar - Only show when not in appointment/order view */}
      {!history && (
        <div className="hidden lg:block w-64 xl:w-72 bg-gray-50 border-r border-gray-200 p-4 lg:p-5 flex flex-col gap-4 lg:gap-5 h-[calc(98vh-64px)] overflow-y-auto">
          {/* Desktop Filter Header */}
          <div className="flex items-center gap-2 pb-3 lg:pb-4 border-b border-gray-200">
            <Filter size={18} className="text-gray-600" />
            <h2 className="text-base lg:text-lg font-semibold text-gray-800">Filters</h2>
          </div>

          {/* Desktop Distance Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Distance</label>
            <button
              onClick={() => toggleDropdown('distance')}
              className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-left hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
            >
              <span className="text-gray-700">{filters.distance}</span>
              <ChevronDown
                size={14}
                className={`text-gray-500 transition-transform ${dropdowns.distance ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdowns.distance && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {[5, 10, 20, 50, 100, 250, 500].map((dist) => (
                  <button
                    key={dist}
                    onClick={() => selectFilter('distance', `${dist} km`)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${filters.distance === `${dist} km` ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                  >
                    {dist} km
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Sort Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <button
              onClick={() => toggleDropdown('nearby')}
              className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-left hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
            >
              <span className="text-gray-700">{filters.nearby}</span>
              <ChevronDown
                size={14}
                className={`text-gray-500 transition-transform ${dropdowns.nearby ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdowns.nearby && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                {['Default', 'Rating', 'Distance', 'Newest', 'Most Popular'].map((item) => (
                  <button
                    key={item}
                    onClick={() => selectFilter('nearby', item)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${filters.nearby === item ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Category Filter */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <button
              onClick={() => toggleDropdown('category')}
              className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-left hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors text-sm"
            >
              <span className="text-gray-700">{filters.category}</span>
              <ChevronDown
                size={14}
                className={`text-gray-500 transition-transform ${dropdowns.category ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdowns.category && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                {categoryNames.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => selectFilter('category', cat)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${filters.category === cat ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Clear Filters */}
          <button
            onClick={clearFilters}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {history === 'reservation' ? (
  // Show reservation component
  <div className="flex-1 h-[calc(98vh-64px)] overflow-y-auto bg-gray-50">
    <UserReservationComponent setHistory={setHistory} />
  </div>
) : history && getAppointmentOrderType() ? (
  // When showing appointments/orders, create proper flex container
  <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
    {/* Scrollable Appointments/Orders */}
    <div className="flex-1 h-[calc(98vh-64px)] overflow-y-auto px-4 py-0 bg-gray-50">
      <UserAppointmentsOrders 
        type={getAppointmentOrderType()} 
        setHistory={setHistory} 
      />
    </div>
  
    {/* Fixed Profile Section */}
    <div className="hidden xl:flex w-[380px] border-l border-gray-200 bg-white">
      <div className="fixed right-0 top-[64px] w-[380px] h-[calc(100vh-64px)] overflow-y-auto shadow-md p-4">
        <UserProfileComponent setHistory={setHistory} />
      </div>
    </div>
  </div>
) :(
        // Default view with stores
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Center Content */}
          <div className="flex-1 px-8 py-2 lg:px-12 lg:py-6 overflow-y-auto bg-gray-50 h-[calc(98vh-64px)] scrollbar-hide">

            {/* Search Bar */}
            <div className="mb-2 lg:mb-6 flex justify-center">
              <div className="relative max-w-2xl w-full">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for services, restaurants, shops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                  className="w-full pl-10 pr-12 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-sm lg:text-base"
                />
                <button
                  onClick={() => fetchStores(searchQuery, filters)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-500 touch-manipulation"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>

            {/* Guest Location Notice */}
            {isGuest && !location?.location?.coordinates && (
              <GuestLocationNotice />
            )}

            {/* Error Display */}
            <ErrorDisplay 
              error={error} 
              isGuest={isGuest} 
              onRetry={() => fetchStores(searchQuery, filters)} 
            />

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-b-2 border-teal-600"></div>
                <span className="ml-2 text-gray-600 text-sm lg:text-base">Loading stores...</span>
              </div>
            )}

            {!loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto px-4 lg:px-0">
                {stores.map((store) => (
                  <StoreCard
                    key={store._id || store.id || Math.random()}
                    store={store}
                    onCardClick={handleCardClick}
                  />
                ))}
              </div>
            )}

            {!loading && stores.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-2">
                  <Search size={40} className="mx-auto mb-4 opacity-50 lg:w-12 lg:h-12" />
                  <h3 className="text-lg font-medium">No stores found</h3>
                  <p className="text-sm">Try adjusting your search criteria or filters</p>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Component - Hidden on mobile, visible on desktop */}
          <div className="hidden xl:block w-[380px] px-4">
  <div className="h-[calc(98vh-64px)] overflow-y-auto bg-white border-l border-gray-200 rounded-l-lg shadow-sm p-4">
    <UserProfileComponent setHistory={setHistory} />
  </div>
</div>
        </div>
      )}
    </div>
  );
};

export default MainAreaComponent;