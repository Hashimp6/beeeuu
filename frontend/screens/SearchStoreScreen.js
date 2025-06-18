import React, { useState, useEffect } from 'react';
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

const { width } = Dimensions.get('window');

const StoreSearchPage = ({ navigation }) => {
  const [loading, setLoading] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({});
  const [imageErrors, setImageErrors] = useState({}); // Track image loading errors

  const categories = [
    {
      id: 1,
      name: 'Face',
      // Using more reliable image URLs
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
      name: 'Makeup',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
      apiEndpoint: 'makeup-services'
    },
    {
      id: 4,
      name: 'Nails',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
      apiEndpoint: 'nail-services'
    },
    {
      id: 5,
      name: 'Henna',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
      apiEndpoint: 'henna-services'
    },
    {
      id: 6,
      name: 'Skincare',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
      apiEndpoint: 'skincare-services'
    },
    {
      id: 7,
      name: 'Eyebrows',
      image: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
      apiEndpoint: 'eyebrow-services'
    },
    {
      id: 8,
      name: 'Massage',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80',
      apiEndpoint: 'massage-services'
    }
  ];

  const handleImageError = (imageId) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  const handleImageLoad = (imageId) => {
    setImageErrors(prev => ({ ...prev, [imageId]: false }));
  };

  const handleSearch = async () => {
    if (!searchText.trim()) {
      Alert.alert('Search Error', 'Please enter a search term');
      return;
    }

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

  const handleCategoryPress = async (category) => {
    setLoading(category.id);
    setSelectedCategory(category);

    try {
      const categoryName=category.apiEndpoint
      const response = await axios.get(`${SERVER_URL}/search/category/${categoryName}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
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
    // Clear image errors on refresh
    setImageErrors({});
    if (selectedCategory) {
      await handleCategoryPress(selectedCategory);
    } else if (searchText.trim()) {
      await handleSearch();
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
          // Fallback view when image fails to load
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
            // Add loading indicator for slow networks
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
    <TouchableOpacity style={styles.storeCard} onPress={() => {
      // Navigate to store details
      // navigation.navigate('StoreDetails', { store: item });
    }}>
      <View style={styles.storeImageContainer}>
        {imageErrors[`store-${item._id}`] ? (
          // Fallback view when store image fails to load
          <View style={styles.storeImageFallback}>
            <Icon name="store" size={50} color="#ccc" />
            <Text style={styles.fallbackText}>No Image</Text>
          </View>
        ) : (
          <Image
            source={{ 
              uri: item.profileImage || 'https://via.placeholder.com/400x200/f0f0f0/999999?text=Store+Image' 
            }}
            style={styles.storeImage}
            resizeMode="cover"
            onError={() => handleImageError(`store-${item._id}`)}
            onLoad={() => handleImageLoad(`store-${item._id}`)}
          />
        )}
      </View>
      
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.storeName}</Text>
        <Text style={styles.storeCategory}>{item.category}</Text>
        {item.description && (
          <Text style={styles.storeDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.storeMetaContainer}>
          {item.place && (
            <View style={styles.storeMetaItem}>
              <Icon name="location-on" size={16} color="#666" />
              <Text style={styles.storeMetaText}>{item.place}</Text>
            </View>
          )}
          
          {item.rating && (
            <View style={styles.storeMetaItem}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.storeMetaText}>{item.rating}</Text>
            </View>
          )}
          
          {item.distance && (
            <View style={styles.storeMetaItem}>
              <Icon name="near-me" size={16} color="#666" />
              <Text style={styles.storeMetaText}>{item.distance} km</Text>
            </View>
          )}
        </View>

        {item.phone && (
          <View style={styles.contactContainer}>
            <TouchableOpacity style={styles.contactButton}>
              <Icon name="phone" size={18} color="#155366" />
              <Text style={styles.contactText}>Call</Text>
            </TouchableOpacity>
            
            {item.socialMedia?.whatsapp && (
              <TouchableOpacity style={styles.contactButton}>
                <Icon name="message" size={18} color="#25D366" />
                <Text style={styles.contactText}>WhatsApp</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (stores.length > 0) {
      return (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {selectedCategory ? `${selectedCategory.name} Services` : 'Search Results'}
            </Text>
            <TouchableOpacity onPress={clearResults} style={styles.clearButton}>
              <Icon name="clear" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          {pagination.totalStores && (
            <Text style={styles.resultsCount}>
              Found {pagination.totalStores} stores
            </Text>
          )}

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
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
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
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
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
  },
  searchInput: {
    height: 48,
    fontSize: 16,
    color: '#333',
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
  listContainer: {
    paddingHorizontal: 7,
    paddingBottom: 20,
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