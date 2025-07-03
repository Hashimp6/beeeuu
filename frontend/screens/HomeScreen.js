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

  // Render Distance Filter
  const renderDistanceFilter = () => (
    <View style={styles.dropdownWrapper}>
      <TouchableOpacity 
        style={[styles.filterButton, showDistanceDropdown && styles.filterButtonActive]}
        onPress={toggleDistanceDropdown}
        activeOpacity={0.7}
      >
        <View style={styles.filterButtonContent}>
          <Ionicons name="location-outline" size={16} color="#155366" />
          <Text style={styles.filterButtonText}>{selectedDistance}km</Text>
          <Ionicons 
            name={showDistanceDropdown ? "chevron-up" : "chevron-down"} 
            size={16} 
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
              activeOpacity={0.7}
            >
              <Text style={[
                styles.dropdownItemText,
                selectedDistance === distance && styles.selectedDropdownItemText
              ]}>
                {distance} km
              </Text>
              {selectedDistance === distance && (
                <Ionicons name="checkmark" size={18} color="#155366" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // Render Sort Filter
  const renderSortFilter = () => (
    <View style={styles.dropdownWrapper}>
      <TouchableOpacity 
        style={[styles.filterButton, showSortDropdown && styles.filterButtonActive]}
        onPress={toggleSortDropdown}
        activeOpacity={0.7}
      >
        <View style={styles.filterButtonContent}>
          <Ionicons name="funnel-outline" size={16} color="#155366" />
          <Text style={styles.filterButtonText}>
            {sortOptions.find(opt => opt.value === selectedSortBy)?.label}
          </Text>
          <Ionicons 
            name={showSortDropdown ? "chevron-up" : "chevron-down"} 
            size={16} 
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
              activeOpacity={0.7}
            >
              <Text style={[
                styles.dropdownItemText,
                selectedSortBy === option.value && styles.selectedDropdownItemText
              ]}>
                {option.label}
              </Text>
              {selectedSortBy === option.value && (
                <Ionicons name="checkmark" size={18} color="#155366" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // Render Loading State
  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#155366" />
      <Text style={styles.loadingText}>Finding nearby stores...</Text>
    </View>
  );

  // Render Error State
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={60} color="#FF6B6B" />
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity 
        style={styles.retryButton} 
        onPress={() => fetchNearbyStores(1, true)}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Empty State
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="storefront-outline" size={80} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>No stores found nearby</Text>
      <Text style={styles.emptySubText}>
        Try adjusting your distance filter or check back later
      </Text>
      <TouchableOpacity 
        style={styles.adjustFiltersButton} 
        onPress={() => setSelectedDistance(100)}
        activeOpacity={0.7}
      >
        <Text style={styles.adjustFiltersText}>Expand Search Area</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Stores</Text>
        <Text style={styles.headerSubtitle}>
          {totalStores > 0 ? `${totalStores} stores found` : 'Discovering local stores'}
        </Text>
      </View> */}

      {/* Filter Section */}
          <View style={styles.filterButtons}>
            {renderDistanceFilter()}
            {renderSortFilter()}
        </View>

      {/* Content */}
      {loading && !refreshing ? (
        renderLoadingState()
      ) : error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={stores}
          renderItem={renderStoreItem}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          contentContainerStyle={[
            styles.storesList,
            stores.length === 0 && styles.emptyListContainer
          ]}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={renderLoadMoreButton}
          ListEmptyComponent={renderEmptyState}
          onEndReached={loadMoreStores}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  filterRow: {
    flexDirection: 'column',
    gap: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  dropdownWrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 1000,
  },
  filterButton: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#155366',
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 48,
  },
  filterButtonActive: {
    borderColor: '#155366',
    backgroundColor: '#E8F5E8',
    shadowColor: '#155366',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  filterButtonText: {
    color: '#155366',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  attachedDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0F2F1',
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1001,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
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
    fontSize: 15,
    color: '#333333',
    fontWeight: '500',
  },
  selectedDropdownItemText: {
    color: '#155366',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  storesList: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  loadMoreButton: {
    backgroundColor: '#155366',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#155366',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#155366',
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  adjustFiltersButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0F2F1',
  },
  adjustFiltersText: {
    color: '#155366',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;