import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Alert, ScrollView } from 'react-native';
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
    { value: 'distance', label: 'Nearby', icon: 'location-outline' },
    { value: 'averageRating', label: 'By Rating', icon: 'star-outline' },
    { value: 'storeName', label: 'By Name', icon: 'text-outline' }
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

  // Close dropdowns when touching outside
  const closeDropdowns = () => {
    setShowDistanceDropdown(false);
    setShowSortDropdown(false);
  };

  // Render Compact Horizontal Filter Pills
  const renderCompactFilters = () => (
    <View style={styles.compactFilterSection}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterPills}
      >
        {/* Distance Filter Pill */}
        <TouchableOpacity 
          style={[styles.filterPill, showDistanceDropdown && styles.activeFilterPill]}
          onPress={toggleDistanceDropdown}
          activeOpacity={0.7}
        >
          <Ionicons name="location-outline" size={14} color="#14B8A6" />
          <Text style={styles.filterPillText}>{selectedDistance}km</Text>
          <Ionicons name="chevron-down" size={12} color="#14B8A6" />
        </TouchableOpacity>

        {/* Sort Filter Pill */}
        <TouchableOpacity 
          style={[styles.filterPill, showSortDropdown && styles.activeFilterPill]}
          onPress={toggleSortDropdown}
          activeOpacity={0.7}
        >
          <Ionicons name="funnel-outline" size={14} color="#14B8A6" />
          <Text style={styles.filterPillText}>
            {sortOptions.find(opt => opt.value === selectedSortBy)?.label}
          </Text>
          <Ionicons name="chevron-down" size={12} color="#14B8A6" />
        </TouchableOpacity>

        {/* Store Count Info Pill */}
        <View style={styles.infoPill}>
          <Text style={styles.infoPillText}>{totalStores} stores</Text>
        </View>
      </ScrollView>

      {/* Distance Dropdown */}
      {showDistanceDropdown && (
        <View style={styles.compactDropdown}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownHeaderText}>Distance</Text>
          </View>
          <View style={styles.dropdownGrid}>
            {distanceOptions.map((distance, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.gridItem,
                  selectedDistance === distance && styles.selectedGridItem
                ]}
                onPress={() => handleDistanceSelect(distance)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.gridItemText,
                  selectedDistance === distance && styles.selectedGridItemText
                ]}>
                  {distance}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Sort Dropdown */}
      {showSortDropdown && (
        <View style={styles.compactDropdown}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownHeaderText}>Sort By</Text>
          </View>
          {sortOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.compactDropdownItem,
                selectedSortBy === option.value && styles.selectedCompactDropdownItem
              ]}
              onPress={() => handleSortSelect(option.value)}
              activeOpacity={0.7}
            >
              <View style={styles.compactDropdownItemContent}>
                <Ionicons 
                  name={option.icon} 
                  size={16} 
                  color={selectedSortBy === option.value ? "#155366" : "#666666"} 
                />
                <Text style={[
                  styles.compactDropdownItemText,
                  selectedSortBy === option.value && styles.selectedCompactDropdownItemText
                ]}>
                  {option.label}
                </Text>
              </View>
              {selectedSortBy === option.value && (
                <Ionicons name="checkmark-circle" size={18} color="#155366" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

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
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.loadMoreText}>Loading...</Text>
          </View>
        ) : (
          <View style={styles.loadMoreContent}>
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.loadMoreText}>Load More Stores</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render Loading State
  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingContent}>
        <View style={styles.loadingSpinner}>
          <ActivityIndicator size="large" color="#155366" />
        </View>
        <Text style={styles.loadingTitle}>Finding nearby stores</Text>
        <Text style={styles.loadingSubtitle}>This won't take long...</Text>
      </View>
    </View>
  );

  // Render Error State
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorContent}>
        <View style={styles.errorIconContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        </View>
        <Text style={styles.errorTitle}>Something went wrong</Text>
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
    </View>
  );

  // Render Empty State
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="storefront-outline" size={80} color="#E0E0E0" />
        </View>
        <Text style={styles.emptyTitle}>No stores found</Text>
        <Text style={styles.emptySubText}>
          We couldn't find any stores within {selectedDistance}km of your location.
        </Text>
        <TouchableOpacity 
          style={styles.expandSearchButton} 
          onPress={() => setSelectedDistance(selectedDistance < 500 ? selectedDistance * 2 : 500)}
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={20} color="#155366" />
          <Text style={styles.expandSearchText}>Expand Search Area</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={1} 
      onPress={closeDropdowns}
    >
      {/* Compact Filter Section */}
      {renderCompactFilters()}

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
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          scrollEventThrottle={16}
          onScroll={closeDropdowns}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Compact Filter Styles
  compactFilterSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    zIndex: 1000,
  },
  filterPills: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#14B8A6',
    gap: 4,
    minHeight: 32,
  },
  activeFilterPill: {
    backgroundColor: '#CCFBF1',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#134E4A',
  },
  infoPill: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 4,
  },
  infoPillText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
  },
  
  // Compact Dropdown Styles
  compactDropdown: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1001,
    maxHeight: 200,
  },
  dropdownHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  dropdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  gridItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 50,
    alignItems: 'center',
  },
  selectedGridItem: {
    backgroundColor: '#F0FDFA',
    borderColor: '#14B8A6',
  },
  gridItemText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  selectedGridItemText: {
    color: '#134E4A',
    fontWeight: '600',
  },
  compactDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  selectedCompactDropdownItem: {
    backgroundColor: '#F0F9FF',
  },
  compactDropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactDropdownItemText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  selectedCompactDropdownItemText: {
    color: '#155366',
    fontWeight: '600',
  },
  
  // Existing styles (keeping all your original styles)
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingSpinner: {
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  storesList: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  itemSeparator: {
    height: 12,
  },
  loadMoreButton: {
    backgroundColor: '#155366',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginHorizontal: 4,
    marginTop: 20,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#155366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loadMoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 280,
  },
  errorIconContainer: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: '#155366',
    borderRadius: 16,
    shadowColor: '#155366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyContent: {
    alignItems: 'center',
    maxWidth: 280,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  expandSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E0F2F1',
  },
  expandSearchText: {
    color: '#155366',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HomeScreen;