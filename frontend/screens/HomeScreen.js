import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import SellerCard from '../components/SellersCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { SERVER_URL } from '../config';

const HomeScreen = ({ userLocation, locationUpdateTrigger }) => {
  const { user, logout } = useAuth();
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [selectedDistance, setSelectedDistance] = useState(50);
  const [selectedSortBy, setSelectedSortBy] = useState('nearby');
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Filter data for API usage
  const [filterData, setFilterData] = useState({
    distance: 50,
    sortBy: 'nearby'
  });

  const distanceOptions = [50, 100, 150, 250, 500];
  const sortOptions = [
    { value: 'nearby', label: 'Nearby' },
    { value: 'rating', label: 'By Rating' },
    { value: 'name', label: 'By Name' }
  ];

  const fetchNearbyStores = async () => {
    try {
      setLoading(true);
      setError(null);
  
      // Use the userLocation prop if available, otherwise fall back to AsyncStorage
      let latitude, longitude;
      
      if (userLocation && userLocation.latitude && userLocation.longitude) {
        // Use the props passed from parent component
        latitude = userLocation.latitude;
        longitude = userLocation.longitude;
        console.log("Using location from props:", latitude, longitude);
      } else {
        // Fall back to AsyncStorage if props are not available
        const storedUserJson = await AsyncStorage.getItem('user');
        if (!storedUserJson) {
          throw new Error('User data not found');
        }
    
        let storedUser = JSON.parse(storedUserJson);
        
        // If location not available, add default coordinates
        if (!storedUser.latitude || !storedUser.longitude) {
          storedUser.latitude = 9.9312;
          storedUser.longitude = 76.2673;
        }
        
        latitude = storedUser.latitude;
        longitude = storedUser.longitude;
      }
  
      // Make API call to get nearby stores with distance filter
      const response = await axios.get(
        `${SERVER_URL}/stores/nearby?latitude=${latitude}&longitude=${longitude}&maxDistance=${selectedDistance}`
      );
      
      // Update state with fetched stores
      setStores(response.data.stores);
      applyFilters(response.data.stores);
    } catch (err) {
      console.error('Error fetching nearby stores:', err);
      setError(err.message || 'Failed to fetch nearby stores');
      Alert.alert(
        'Error',
        'Failed to load nearby stores. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Apply sorting filters
  const applyFilters = (storeList = stores) => {
    let filtered = [...storeList];

    // Filter by distance (this should be handled by API, but we can also filter client-side)
    filtered = filtered.filter(store => {
      const distance = store.distance?.value || 0;
      return distance <= selectedDistance;
    });

    // Sort by selected option
    switch (selectedSortBy) {
      case 'nearby':
        filtered.sort((a, b) => (a.distance?.value || 0) - (b.distance?.value || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'name':
        filtered.sort((a, b) => (a.storeName || '').localeCompare(b.storeName || ''));
        break;
      default:
        break;
    }

    setFilteredStores(filtered);
  };

  // Log when userLocation or locationUpdateTrigger changes
  useEffect(() => {
    console.log('Location updated:', userLocation);
    console.log('Trigger value:', locationUpdateTrigger);
    fetchNearbyStores();
  }, [userLocation, locationUpdateTrigger, selectedDistance]);

  // Apply filters when sort option changes
  useEffect(() => {
    applyFilters();
  }, [selectedSortBy]);

  // Update filter data when selections change
  useEffect(() => {
    setFilterData({
      distance: selectedDistance,
      sortBy: selectedSortBy
    });
  }, [selectedDistance, selectedSortBy]);

  // Pull-to-refresh functionality
  const handleRefresh = () => {
    setRefreshing(true);
    fetchNearbyStores();
  };

  // Handle distance selection
  const handleDistanceSelect = (distance) => {
    setSelectedDistance(distance);
    setShowDistanceDropdown(false);
  };

  // Handle sort selection
  const handleSortSelect = (sortBy) => {
    setSelectedSortBy(sortBy);
    setShowSortDropdown(false);
  };

  // Toggle dropdown visibility
  const toggleDistanceDropdown = () => {
    setShowDistanceDropdown(!showDistanceDropdown);
    setShowSortDropdown(false); // Close other dropdown
  };

  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
    setShowDistanceDropdown(false); // Close other dropdown
  };

  // Render each store item
  const renderStoreItem = ({ item }) => {
    const distanceText =
      item.distance?.value && typeof item.distance.value === 'number'
        ? `${item.distance.value.toFixed(1)} km`
        : '0 km';
  
    const locationText =
      item.place ||
      (item.location?.coordinates
        ? `${item.location.coordinates[1].toFixed(4)}, ${item.location.coordinates[0].toFixed(4)}`
        : 'Unknown location');
  
    return (
      <SellerCard
        id={item._id}
        image={item.profileImage || "https://images.unsplash.com/photo-1600891964599-f61ba0e24092"}
        name={item.storeName}
        rating={`${item.averageRating || '0'} (${item.numberOfRatings || '0'})`}
        location={locationText}
        distance={distanceText}
        category={item.category || 'Uncategorized'}
        description={item.description}
        price={item.price || '₹0'}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Section */}
      <View style={styles.filterSection}>
        <View style={styles.filterRow}>
          <View style={styles.filterButtons}>
            {/* Distance Filter */}
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity 
                style={[styles.filterButton, showDistanceDropdown && styles.filterButtonActive]}
                onPress={toggleDistanceDropdown}
              >
                <View style={styles.filterButtonContent}>
                  <Ionicons name="location-outline" size={14} color="#155366" />
                  <Text style={styles.filterButtonText}>{selectedDistance}km</Text>
                  <Ionicons 
                    name={showDistanceDropdown ? "chevron-up" : "chevron-down"} 
                    size={14} 
                    color="#155366" 
                  />
                </View>
              </TouchableOpacity>
              
              {showDistanceDropdown && (
                <View style={styles.attachedDropdown}>
                  {distanceOptions.map((distance, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownItem,
                        selectedDistance === distance && styles.selectedDropdownItem,
                        index === distanceOptions.length - 1 && styles.lastDropdownItem
                      ]}
                      onPress={() => handleDistanceSelect(distance)}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        selectedDistance === distance && styles.selectedDropdownItemText
                      ]}>
                        {distance} km
                      </Text>
                      {selectedDistance === distance && (
                        <Ionicons name="checkmark" size={16} color="#155366" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Sort Filter */}
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity 
                style={[styles.filterButton, showSortDropdown && styles.filterButtonActive]}
                onPress={toggleSortDropdown}
              >
                <View style={styles.filterButtonContent}>
                  <Ionicons name="funnel-outline" size={14} color="#155366" />
                  <Text style={styles.filterButtonText}>
                    {sortOptions.find(opt => opt.value === selectedSortBy)?.label}
                  </Text>
                  <Ionicons 
                    name={showSortDropdown ? "chevron-up" : "chevron-down"} 
                    size={14} 
                    color="#155366" 
                  />
                </View>
              </TouchableOpacity>
              
              {showSortDropdown && (
                <View style={styles.attachedDropdown}>
                  {sortOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownItem,
                        selectedSortBy === option.value && styles.selectedDropdownItem,
                        index === sortOptions.length - 1 && styles.lastDropdownItem
                      ]}
                      onPress={() => handleSortSelect(option.value)}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        selectedSortBy === option.value && styles.selectedDropdownItemText
                      ]}>
                        {option.label}
                      </Text>
                      {selectedSortBy === option.value && (
                        <Ionicons name="checkmark" size={16} color="#155366" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#155366" />
          <Text style={styles.loadingText}>Loading nearby stores...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchNearbyStores}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredStores.length > 0 ? filteredStores : []}
          renderItem={renderStoreItem}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.storesList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No stores found nearby</Text>
              <Text style={styles.emptySubText}>Try changing your filters or check back later</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 5,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 1000,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  dropdownWrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 1000,
  },
  filterButton: {
    backgroundColor: '#F0F9FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#B2E6E0',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  filterButtonActive: {
    borderColor: '#155366',
    backgroundColor: '#E0F4F3',
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  filterButtonText: {
    color: '#155366',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  attachedDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#B2E6E0',
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
  },
  selectedDropdownItem: {
    backgroundColor: '#F0F9FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  selectedDropdownItemText: {
    color: '#155366',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  storesList: {
    paddingBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#155366',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#555',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
});
export default HomeScreen