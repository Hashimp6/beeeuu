import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/UserContext';
import StoreCard from '../StoreCard';
import axios from 'axios';
import { SERVER_URL } from '../../Config';
import StoreProfile from './StoreProfile';

const MainAreaComponent = ({ selectedFilters, onFiltersChange }) => {
  const { user, token } = useAuth();
  console.log("user and token:", user, token);
  const [selectedStore, setSelectedStore] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  const fetchStores = async (searchTerm = '', filterData = filters, customUser = user) => {
    console.log("fetchStores called with:", { searchTerm, filterData });

    if (!token) {
      console.error('Authentication token not available');
      setError('Authentication token not available');
      return;
    }

    const latitude = customUser?.location?.latitude || 9.9312; // Kochi fallback
    const longitude = customUser?.location?.longitude || 76.2673;

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
        console.log("Adding search term:", searchTerm.trim());
      }

      console.log("Final API request params:", params);
      console.log("Making request to:", `${SERVER_URL}/stores/nearby`);

      const response = await axios.get(`${SERVER_URL}/stores/nearby`, {
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.data && response.data.data.stores) {
        const { stores: newStores } = response.data.data;
        console.log("stores are",response.data.data);
        
        setStores(newStores || []);
        console.log("Stores set:", newStores.length);
      } else {
        const stores = response.data.stores || response.data || [];
        setStores(stores);
        console.log("Stores set (alternative):", stores.length);
      }

    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);

      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to fetch stores';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      console.log("useEffect triggered - initial load");
      fetchStores('', filters, user);
    }
  }, [user, token]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      fetchStores(searchQuery, filters);
    }
  };

  const toggleDropdown = (type) => {
    setDropdowns(prev => ({
      ...prev,
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
    setSelectedStore(store);
  };

  const handleBack = () => {
    setSelectedStore(null);
  };

  const handleChatNow = () => {
    console.log('Starting chat with:', selectedStore.storeName);
    // Implement chat navigation
  };

  const handleShare = () => {
    console.log('Sharing store:', selectedStore.storeName);
    // Implement share functionality
  };


  // If a store is selected, show the detail view
  if (selectedStore) {
    return (
      <StoreProfile
        store={selectedStore}
        onBack={handleBack}
        onChatNow={handleChatNow}
        onShare={handleShare}
      />
    );
  }
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Sidebar with Filters */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
          <Filter size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>

        {/* Distance Filter */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Distance</label>
          <button
            onClick={() => toggleDropdown('distance')}
            className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3 text-left hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
          >
            <span className="text-gray-700">{filters.distance}</span>
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform ${dropdowns.distance ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdowns.distance && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {[5, 10, 20, 50, 100, 250, 500].map((dist) => (
                <button
                  key={dist}
                  onClick={() => selectFilter('distance', `${dist} km`)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${filters.distance === `${dist} km` ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                >
                  {dist} km
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Filter */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
          <button
            onClick={() => toggleDropdown('nearby')}
            className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3 text-left hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
          >
            <span className="text-gray-700">{filters.nearby}</span>
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform ${dropdowns.nearby ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdowns.nearby && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              {['Default', 'Rating', 'Distance', 'Newest', 'Most Popular'].map((item) => (
                <button
                  key={item}
                  onClick={() => selectFilter('nearby', item)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${filters.nearby === item ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <button
            onClick={() => toggleDropdown('category')}
            className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg px-4 py-3 text-left hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
          >
            <span className="text-gray-700">{filters.category}</span>
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform ${dropdowns.category ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdowns.category && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              {['All Categories', 'Beauty', 'Food', 'Gift', 'Shopping', 'Health', 'Services'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => selectFilter('category', cat)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${filters.category === cat ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => {
            const defaultFilters = {
              distance: '20 km',
              nearby: 'Default',
              category: 'All Categories'
            };
            setFilters(defaultFilters);
            fetchStores(searchQuery, defaultFilters);
          }}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Clear All Filters
        </button>
      </div>

      {/* Center Content */}
      <div className="flex-1 p-6 overflow-auto bg-gray-50">
        {/* Search Bar */}
        <div className="mb-6 flex justify-center">
          <div className="relative max-w-2xl w-full">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for services, restaurants, shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-500"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <span className="ml-2 text-gray-600">Loading stores...</span>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No stores found</h3>
              <p className="text-sm">Try adjusting your search criteria or filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 flex flex-col items-center gap-4">
        <div className="w-16 h-24 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600 text-sm font-medium">
          Ad
        </div>
        <button className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Apply
        </button>
        <button className="w-full bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          Open
        </button>
      </div>
    </div>
  );
};

export default MainAreaComponent;
