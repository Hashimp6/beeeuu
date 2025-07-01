import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  TextInput,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { SERVER_URL } from '../config';
import SellerCard from '../components/SellersCard';

const { width } = Dimensions.get('window');

const StoreSearchPage = ({ navigation }) => {
  const [loading, setLoading] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  
  // Debounce state
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  const categoryGroups = [
    {
      id: 'beauty',
      title: '💄 iBeauty',
      icon: '💄',
      categories: [
        {
          id: 1,
          name: 'Face',
          image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
          apiEndpoint: 'face-services'
        },
        {
          id: 2,
          name: 'Hair',
          image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
          apiEndpoint: 'hair-services'
        },
        {
          id: 3,
          name: 'Nails',
          image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
          apiEndpoint: 'nail-services'
        },
        {
          id: 4,
          name: 'Mehandi',
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
          apiEndpoint: 'henna-services'
        },
        {
          id: 5,
          name: 'Bridal Makeup',
          image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
          apiEndpoint: 'bridal-makeup-services'
        },
        {
          id: 6,
          name: 'Hair Styling',
          image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
          apiEndpoint: 'hair-styling-services'
        },
        {
          id: 7,
          name: 'Dressing',
          image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
          apiEndpoint: 'dressing-services'
        },
        {
          id: 8,
          name: 'Styling',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
          apiEndpoint: 'styling-services'
        }
      ]
    },
    {
      id: 'food',
      title: '🍰 Food',
      icon: '🍰',
      categories: [
        {
          id: 9,
          name: 'Desserts',
          image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
          apiEndpoint: 'dessert-services'
        },
        {
          id: 10,
          name: 'Cakes',
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
          apiEndpoint: 'cake-services'
        },
        {
          id: 11,
          name: 'Pickles',
          image: 'https://images.unsplash.com/photo-1599909533124-5d3b26c2e3a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
          apiEndpoint: 'pickle-services'
        },
        {
          id: 12,
          name: 'Traditional Snacks',
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
          apiEndpoint: 'traditional-snack-services'
        }
      ]
    },
    {
      id: 'gifts',
      title: '🎁 Gifts',
      icon: '🎁',
      categories: [
        {
          id: 13,
          name: 'Gift Bouquets',
          image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
          apiEndpoint: 'gift-bouquet-services'
        },
        {
          id: 14,
          name: 'Hampers',
          image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
          apiEndpoint: 'hamper-services'
        },
        {
          id: 15,
          name: 'Custom Gifts',
          image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
          apiEndpoint: 'custom-gift-services'
        }
      ]
    }
  ];

  // Debounce effect for search text
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  // Auto-search when debounced text changes
  useEffect(() => {
    if (debouncedSearchText.trim()) {
      performSearch(debouncedSearchText);
    } else if (debouncedSearchText === '') {
      // Clear results when search is empty
      setStores([]);
      setSelectedCategory(null);
      setPagination({});
    }
  }, [debouncedSearchText]);

  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSelectedCategory(null);

    try {
      const response = await axios.get(`${SERVER_URL}/search/query`, {
        params: { q: searchQuery },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        console.log("store1s",response.data.data.stores);
        
        setStores(response.data.data.stores);
        setPagination(response.data.data.pagination);
      } else {
        // Don't show alert for auto-search, just clear results
        setStores([]);
        setPagination({});
      }

    } catch (error) {
      console.error('Search Error:', error);
      // Only show alert if it's a manual search, not auto-search
      setStores([]);
      setPagination({});
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleManualSearch = async () => {
    if (!searchText.trim()) {
      Alert.alert('Search Error', 'Please enter a search term');
      return;
    }

    // For manual search, perform immediately
    setSearchLoading(true);
    setSelectedCategory(null);

    try {
      const response = await axios.get(`${SERVER_URL}/search/query`, {
        params: { q: searchText },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        console.log("store2s",response.data.data.stores);
        setStores(response.data.data.stores);
        setPagination(response.data.data.pagination);
      } else {
        Alert.alert('Search Error', 'No results found');
        setStores([]);
      }

    } catch (error) {
      console.error('Search Error:', error);
      Alert.alert('Search Error', 'Failed to search. Please try again.');
      setStores([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleImageError = (imageId) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  const handleImageLoad = (imageId) => {
    setImageErrors(prev => ({ ...prev, [imageId]: false }));
  };

  const handleCategoryPress = async (category) => {
    setLoading(category.id);
    setSelectedCategory(category);
    // Clear search text when selecting category
    setSearchText('');

    try {
      const categoryName = category.apiEndpoint;
      const response = await axios.get(`${SERVER_URL}/search/category/${categoryName}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        console.log("store3s",response.data.data.stores);
        setStores(response.data.data.stores);
        setPagination(response.data.data.pagination);
      } else {
        Alert.alert('Error', `No ${category.name} services found`);
        setStores([]);
      }

    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', `Failed to load ${category.name} services. Please try again.`);
      setStores([]);
    } finally {
      setLoading(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setImageErrors({});
    if (selectedCategory) {
      await handleCategoryPress(selectedCategory);
    } else if (searchText.trim()) {
      await performSearch(searchText);
    }
    setRefreshing(false);
  };

  const clearResults = () => {
    setStores([]);
    setSelectedCategory(null);
    setSearchText('');
    setPagination({});
    setImageErrors({});
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      disabled={loading === item.id}
    >
      <View style={styles.imageContainer}>
        {imageErrors[`category-${item.id}`] ? (
          <View style={styles.imageFallback}>
            <Icon name="image" size={40} color="#ccc" />
            <Text style={styles.fallbackText}>{item.name}</Text>
          </View>
        ) : (
          <Image
            source={{ uri: item.image }}
            style={styles.categoryImage}
            resizeMode="cover"
            onError={() => handleImageError(`category-${item.id}`)}
            onLoad={() => handleImageLoad(`category-${item.id}`)}
            loadingIndicatorSource={{ uri: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' }}
          />
        )}
        {loading === item.id && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderStoreCard = ({ item }) => (
    <SellerCard
      id={item._id}
      image={item.profileImage || 'https://via.placeholder.com/400x200/f0f0f0/999999?text=Store+Image'}
      name={item.storeName}
      rating={item.averageRating}
      location={item.place}
      category={item.category}
      description={item.description}
    />
  );

  const renderCategorySection = (group) => (
    <View key={group.id} style={styles.categorySection}>
      <Text style={styles.sectionTitle}>{group.title}</Text>
      <FlatList
        data={group.categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={styles.sectionGrid}
      />
    </View>
  );

  const renderContent = () => {
    if (stores.length > 0) {
      return (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
           
            {pagination.totalStores && (
            <Text style={styles.resultsCount}>
              Found {pagination.totalStores} stores
            </Text>
          )}

            <TouchableOpacity onPress={clearResults} style={styles.clearButton}>
              <Icon name="clear" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
  data={stores}
  renderItem={renderStoreCard}
  keyExtractor={(item) => item._id}
  showsVerticalScrollIndicator={false}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
  }
  contentContainerStyle={styles.storesList}
/>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.categoriesContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {categoryGroups.map(group => renderCategorySection(group))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Section */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for services..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            onSubmitEditing={handleManualSearch}
          />
          {searchLoading && (
            <View style={styles.searchInputLoading}>
              <ActivityIndicator size="small" color="#155366" />
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleManualSearch}
          disabled={searchLoading}
        >
          {searchLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="search" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  searchInputLoading: {
    paddingRight: 8,
  },
  searchButton: {
    backgroundColor: '#155366',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoriesContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionGrid: {
    paddingHorizontal: 7,
    paddingTop: 10,
  },
  categoryCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: (width - 64) / 2,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeImageFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    padding: 12,
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  storesList: {
    paddingBottom: 20,
  },
  storeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  storeImageContainer: {
    height: 200,
  },
  storeImage: {
    width: '100%',
    height: '100%',
  },
  storeInfo: {
    padding: 16,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  storeCategory: {
    fontSize: 14,
    color: '#155366',
    fontWeight: '500',
    marginBottom: 8,
  },
  storeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  storeMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  storeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  storeMetaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  contactContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

export default StoreSearchPage;