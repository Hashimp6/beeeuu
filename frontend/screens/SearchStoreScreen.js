import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SERVER_URL } from '../config';

const { width } = Dimensions.get('window');

const StoreSearchPage = () => {
  const [loading, setLoading] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const categories = [
    {
      id: 1,
      name: 'Face',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop',
      apiEndpoint: 'face-services'
    },
    {
      id: 2,
      name: 'Hair',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=300&fit=crop',
      apiEndpoint: 'hair-services'
    },
    {
      id: 3,
      name: 'Makeup',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop',
      apiEndpoint: 'makeup-services'
    },
    {
      id: 4,
      name: 'Nails',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=300&fit=crop',
      apiEndpoint: 'nail-services'
    },
    {
      id: 5,
      name: 'Henna',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
      apiEndpoint: 'henna-services'
    },
    {
      id: 6,
      name: 'Skincare',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=300&fit=crop',
      apiEndpoint: 'skincare-services'
    },
    {
      id: 7,
      name: 'Eyebrows',
      image: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=300&h=300&fit=crop',
      apiEndpoint: 'eyebrow-services'
    },
    {
      id: 8,
      name: 'Massage',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=300&fit=crop',
      apiEndpoint: 'massage-services'
    }
  ];

  const handleSearch = async () => {
    if (!searchText.trim()) {
      Alert.alert('Search Error', 'Please enter a search term');
      return;
    }

    setSearchLoading(true);

    try {
      const response = await axios.get(`${SERVER_URL}/search/query`, {
        params: { q: searchText },
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer your-token-here',
        },
      });

      console.log('Search results:', response.data);
      Alert.alert('Search Success', `Found results for "${searchText}"`);
      // navigation.navigate('SearchResults', { query: searchText, data: response.data });

    } catch (error) {
      console.error('Search Error:', error);
      Alert.alert('Search Error', 'Failed to search. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCategoryPress = async (category) => {
    setLoading(category.id);

    try {
      const response = await axios.get(`${SERVER_URL}/search/category/${category.apiEndpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer your-token-here',
        },
      });

      console.log(`${category.name} data:`, response.data);
      Alert.alert('Success', `Loaded ${category.name} services successfully!`);
      // navigation.navigate('CategoryDetails', { category, data: response.data });

    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', `Failed to load ${category.name} services. Please try again.`);
    } finally {
      setLoading(null);
    }
  };
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
      disabled={loading === item.id}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.categoryImage}
          resizeMode="cover"
        />
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

      {/* Categories Section */}
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
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
  },
  searchInputContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  listContainer: {
    paddingHorizontal: 7,
    paddingBottom: 20,
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
});

export default StoreSearchPage;