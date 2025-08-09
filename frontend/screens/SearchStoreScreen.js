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
import { useAuth } from '../context/AuthContext';
import * as Animatable from 'react-native-animatable';
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
  const[categoryGroups,setCategoryGroups]=useState([])
  const{user,token}=useAuth()
  // Debounce state
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  useEffect(() => {
    if (user && token) {
      fetchCategories();
    }
  }, [user, token]);
  
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/category/group`);
      const data = response.data;
  
      const mainCategories = data.map((group, index) => ({
        id: group._id || `group-${index}`,
        name: group.title, // use only main title
        apiEndpoint: group.title.toLowerCase().replace(/\s+/g, '-'), // optional formatting
      }));
  
      setCategoryGroups(mainCategories); // categoryGroups now holds only main categories
    } catch (error) {
      console.error('Error fetching main categories:', error);
    }
  };
  
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
    setSearchText('');
  
    try {
      const response = await axios.get(`${SERVER_URL}/search/category/${category.name}`, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.data.success) {
        setStores(response.data.data.stores);
        setPagination(response.data.data.pagination);
      } else {
        Alert.alert('Error', `No stores found under ${category.name}`);
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
  const renderCategoryItem = ({ item, index }) => {
    const colors = [
      // Modern gradient-inspired solids with premium feel
      { bg: '#6366f1', accent: '#8b5cf6' }, // Indigo to Purple
      { bg: '#0ea5e9', accent: '#06b6d4' }, // Sky to Cyan  
      { bg: '#10b981', accent: '#059669' }, // Emerald depth
      { bg: '#f59e0b', accent: '#d97706' }, // Amber warmth
      { bg: '#ef4444', accent: '#dc2626' }, // Red sophistication
      { bg: '#8b5cf6', accent: '#a855f7' }, // Purple elegance
      { bg: '#06b6d4', accent: '#0891b2' }, // Cyan professional
      { bg: '#f97316', accent: '#ea580c' }, // Orange energy
      { bg: '#84cc16', accent: '#65a30d' }, // Lime fresh
      { bg: '#ec4899', accent: '#db2777' }, // Pink modern
      { bg: '#6b7280', accent: '#4b5563' }, // Slate premium
      { bg: '#14b8a6', accent: '#0d9488' }, // Teal sophisticated
    ];
    
    const colorPair = colors[index % colors.length];
    
    // Create random organic shapes by varying the border radius
    const getRandomShape = () => {
      const shapes = [
        { borderTopLeftRadius: 25, borderTopRightRadius: 45, borderBottomLeftRadius: 35, borderBottomRightRadius: 15 },
        { borderTopLeftRadius: 40, borderTopRightRadius: 20, borderBottomLeftRadius: 10, borderBottomRightRadius: 50 },
        { borderTopLeftRadius: 30, borderTopRightRadius: 30, borderBottomLeftRadius: 40, borderBottomRightRadius: 20 },
        { borderTopLeftRadius: 15, borderTopRightRadius: 35, borderBottomLeftRadius: 25, borderBottomRightRadius: 45 },
        { borderTopLeftRadius: 50, borderTopRightRadius: 10, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
      ];
      return shapes[index % shapes.length];
    };
  
    const randomRotation = (index * 7) % 20 - 10; // Random rotation between -10 and 10 degrees
    const randomHeight = 120 + (index % 3) * 15; // Varying heights
  
    return (
      <Animatable.View 
        animation="fadeInUp" 
        duration={800} 
        delay={index * 150}
        style={[
          styles.organicCardContainer,
          { 
            transform: [{ rotate: `${randomRotation}deg` }],
            height: randomHeight,
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.organicCard,
            {
              backgroundColor: colorPair.bg,
              ...getRandomShape(),
              height: randomHeight,
            }
          ]}
          onPress={() => handleCategoryPress(item)}
          activeOpacity={0.8}
        >
          {/* Floating accent elements */}
          <View style={[styles.floatingAccent, { backgroundColor: colorPair.accent }]} />
          <View style={[styles.floatingAccent2, { backgroundColor: colorPair.accent }]} />
          
          {/* Subtle pattern overlay */}
          <View style={styles.patternOverlay}>
            <View style={[styles.patternDot, { backgroundColor: colorPair.accent }]} />
            <View style={[styles.patternDot, { backgroundColor: colorPair.accent }]} />
            <View style={[styles.patternDot, { backgroundColor: colorPair.accent }]} />
          </View>
          
          {/* Content */}
          <View style={styles.cardContent}>
            <Text style={styles.organicCardText} numberOfLines={2}>
              {item.name}
            </Text>
            
            {/* Decorative underline */}
            <View style={[styles.decorativeUnderline, { backgroundColor: colorPair.accent }]} />
          </View>
          
          {/* Bottom accent curve */}
          <View style={[styles.bottomAccent, { backgroundColor: colorPair.accent }]} />
        </TouchableOpacity>
      </Animatable.View>
    );
  };
  
  
  
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
<FlatList
  data={categoryGroups}
  renderItem={renderCategoryItem}
  keyExtractor={(item) => item.id.toString()}
  numColumns={2}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
/>
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
  category3DCard: {
    flex: 1,
    margin: 10,
    paddingVertical: 24,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    transform: [{ scale: 1 }],
    backgroundColor: '#14b8a6',
  },
  
  category3DText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '700',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
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
    backgroundColor: '#0D9488',
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
  organicCardContainer: {
    flex: 1,
    margin: 8,
    marginVertical: 12,
  },
  
  organicCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  
  floatingAccent: {
    position: 'absolute',
    top: 15,
    right: 20,
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.6,
  },
  
  floatingAccent2: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.4,
  },
  
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.1,
    flexDirection: 'row',
    gap: 10,
  },
  
  patternDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  
  cardContent: {
    zIndex: 2,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  
  organicCardText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    lineHeight: 22,
  },
  
  decorativeUnderline: {
    width: 30,
    height: 3,
    borderRadius: 2,
    marginTop: 8,
    opacity: 0.8,
  },
  
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    opacity: 0.3,
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
  categoryTextCard: {
    flex: 1,
    margin: 8,
    height: 100,
    backgroundColor: '#14b8a6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    transform: [{ scale: 1 }],
  },
  
  categoryText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 10,
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