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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalStores, setTotalStores] = useState(0);
  const limit = 20;
  
  // Filter states
  const [selectedDistance, setSelectedDistance] = useState(50);
  const [selectedSortBy, setSelectedSortBy] = useState('distance');
  const [showDistanceDropdown, setShowDistanceDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const distanceOptions = [10, 25, 50, 100, 150, 250, 500];
  const sortOptions = [
    { value: 'distance', label: 'Nearby' },
    { value: 'averageRating', label: 'By Rating' },
    { value: 'storeName', label: 'By Name' }
  ];

  const fetchNearbyStores = async (page = 1, resetStores = true) => {
    try {
      if (page === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      // Use the userLocation prop if available, otherwise fall back to AsyncStorage
      let latitude, longitude;
      
      if (userLocation && userLocation.latitude && userLocation.longitude) {
        latitude = userLocation.latitude;
        longitude = userLocation.longitude;
        console.log("Using location from props:", latitude, longitude);
      } else {
        const storedUserJson = await AsyncStorage.getItem('user');
        if (!storedUserJson) {
          throw new Error('User data not found');
        }
    
        let storedUser = JSON.parse(storedUserJson);
        
        if (!storedUser.latitude || !storedUser.longitude) {
          storedUser.latitude = 9.9312;
          storedUser.longitude = 76.2673;
        }
        
        latitude = storedUser.latitude;
        longitude = storedUser.longitude;
      }

      // Build query parameters
      const params = {
        latitude,
        longitude,
        radius: selectedDistance,
        page,
        limit,
        sortBy: selectedSortBy,
        sortOrder: selectedSortBy === 'averageRating' ? 'desc' : 'asc'
      };

      console.log('API Request params:', params);

      // Make API call to get nearby stores with filters
      const response = await axios.get(`${SERVER_URL}/stores/nearby`, { params });
      
      const { stores: newStores, pagination } = response.data.data;
      
      if (resetStores || page === 1) {
        setStores(newStores);
        setCurrentPage(1);
      } else {
        setStores(prevStores => [...prevStores, ...newStores]);
        setCurrentPage(page);
      }

      setHasNextPage(pagination.hasNextPage);
      setTotalStores(pagination.totalStores);

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
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  // Load next page
  const loadMoreStores = () => {
    if (hasNextPage && !loadingMore) {
      fetchNearbyStores(currentPage + 1, false);
    }
  };

  // Effects
  useEffect(() => {
    console.log('Location updated:', userLocation);
    console.log('Trigger value:', locationUpdateTrigger);
    fetchNearbyStores(1, true);
  }, [userLocation, locationUpdateTrigger]);

  // Refetch when filters change
  useEffect(() => {
    fetchNearbyStores(1, true);
  }, [selectedDistance, selectedSortBy]);

  // Pull-to-refresh functionality
  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchNearbyStores(1, true);
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
    setShowSortDropdown(false);
  };

  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
    setShowDistanceDropdown(false);
  };

  // Render each store item
  const renderStoreItem = ({ item }) => {
    const distanceText = item.distance ? `${item.distance} km` : '0 km';
    const locationText = item.place || item.address || 'Unknown location';
  
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

  // Render Load More button
  const renderLoadMoreButton = () => {
    if (!hasNextPage) return null;

    return (
      <TouchableOpacity 
        style={styles.loadMoreButton} 
        onPress={loadMoreStores}
        disabled={loadingMore}
      >
        {loadingMore ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.loadMoreText}>Load More Stores</Text>
        )}
      </TouchableOpacity>
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

          {/* Results count */}
          <Text style={styles.resultsText}>
            {totalStores} stores found
          </Text>
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
            onPress={() => fetchNearbyStores(1, true)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={stores}
          renderItem={renderStoreItem}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.storesList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={renderLoadMoreButton}
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
    flexDirection: 'column',
    gap: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  resultsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
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
  loadMoreButton: {
    backgroundColor: '#155366',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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

export default HomeScreen;