import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SERVER_URL } from '../config';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileShareHandler from '../components/ProfileShare';

const SellerProfile = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
    const [token, setToken] = useState(null);
  const route = useRoute(); 
  const { user,  isAuthenticated } = useAuth(); 
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [error, setError] = useState('');
  const [gallery, setGallery] = useState([]);
  const { id } = route.params;
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (!storedToken) {
          throw new Error('No token found');
        }
        console.log("token is ", storedToken);
        setToken(storedToken);
      } catch (err) {
        setError(err.message);
      }
    };
    loadToken();
  }, []);
  const openLink = (url) => {
    if (url && url.trim() !== '') {
      Linking.openURL(url);
    }
  };
    // Add a function to handle the chat button press
    const handleChatNow = () => {
      setLoading(true);
      try {
        // Navigate directly to ChatDetail with store information
        // Let the ChatDetailScreen handle the conversation creation
        navigation.navigate('ChatDetail', {
          otherUser: {
            _id: store.userId, // Store owner's user ID
            userId: store.userId, // Providing both formats for flexibility
            username: store.storeName,
            storeName: store.storeName,
            storeId: store._id,
            avatar: store.profileImage || null, // optional
          }
        });
      } catch (error) {
        console.error('Error navigating to chat:', error);
        alert('Could not start chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    const handleAppointment = (productId,productName) => {
      setLoading(true);
      try {
        // Navigate directly to ChatDetail with store information
        // Let the ChatDetailScreen handle the conversation creation
        navigation.navigate('AppointmentCalendar', {
          otherUser: {
            _id: store.userId, // Store owner's user ID
            userId: store.userId, // Providing both formats for flexibility
            username: store.storeName,
            storeName: store.storeName,
            storeId: store._id,
            avatar: store.profileImage || null, // optional
            productName:productName,
            product:productId
          }
        });
      } catch (error) {
        console.error('Error navigating to chat:', error);
        alert('Could not start chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    const handleShare = async () => {
      console.log("sharing store", store);
      
      const profileData = {
        name: store.storeName || 'Store',
        bio: store.description || `${store.category} store in ${store.place}`,
        profileUrl: ProfileShareHandler.generateProfileDeepLink(store._id, 'yourapp'), // Update 'yourapp' to your actual scheme
        imageUrl: store.profileImage || ''
      };
    
      const options = {
        customMessage: `Hey! Check out ${store.storeName}'s store on our app!`,
        includeImage: !!store.profileImage // Only include image if URL exists
      };
    
      const result = await ProfileShareHandler.shareProfile(profileData, options);
      
      if (result.success) {
        console.log('Store profile shared successfully!');
        // Optional: Show success toast/alert to user
      }
    };
    const handleTabChange = async (tab) => {
      setActiveTab(tab);
  
      if (tab === 'gallery') {
        try {
          console.log("ddd",store._id);
          const sellerId=store._id
          const res = await axios.get(`${SERVER_URL}/gallery/${sellerId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
           console.log("resdta",res.data.data.images);
          
          setGallery(res.data.data.images); // Assuming `images` is the array
        } catch (err) {
          console.error('Error fetching gallery:', err);
        }
      }
    };

  const openPhone = (phone) => {
    if (phone && phone.trim() !== '') {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const openWhatsapp = (phone) => {
    if (phone && phone.trim() !== '') {
      // Format phone for WhatsApp - remove spaces and any special characters except +
      const formattedPhone = phone.replace(/[^0-9+]/g, '');
      Linking.openURL(`https://wa.me/${formattedPhone}`);
    }
  };

  useEffect(() => {
    const fetchStore = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${SERVER_URL}/stores/${id}`);
        setStore({
          ...response.data.store,
        });
        
        
      } catch (err) {
        setError('Failed to fetch store details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStore();
  }, [id]);
  useEffect(() => {

    const fetchProducts = async () => {
      if (!store || !store._id) return;

      try {
        const response = await axios.get(`${SERVER_URL}/products/store/${store._id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        setProducts(response.data);
        console.log("prdss",response.data);
        
      } catch (err) {
        console.error(err);
        setError('Failed to fetch products');
      } 
    };

    fetchProducts();
  }, [store]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#155366" />
        <Text style={styles.loadingText}>Loading store details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchStore()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!store) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Store not found</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ 
              uri: store.profileImage || 'https://cdn-icons-png.flaticon.com/512/147/147144.png' 
            }} 
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>{store.storeName || 'Store Name'}</Text>
        <Text style={styles.address}>{store.category || 'Category'}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={16} color="#155366" /> 
          <Text style={styles.location}>{store.place || 'Location'}</Text>
        </View>

        {/* Contact Icons */}
        <View style={styles.iconRow}>
          <TouchableOpacity 
            style={[styles.iconButton, (!store.phone || store.phone === '') && styles.disabledButton]} 
            onPress={() => openPhone(store.phone)}
            disabled={!store.phone || store.phone === ''}
          >
            <Ionicons name="call" size={22} color="#155366" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.iconButton, 
              (!store.socialMedia?.instagram || store.socialMedia?.instagram === '') && styles.disabledButton
            ]} 
            onPress={() => openLink(store.socialMedia?.instagram)}
            disabled={!store.socialMedia?.instagram || store.socialMedia?.instagram === ''}
          >
            <FontAwesome name="instagram" size={22} color="#155366" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.iconButton, 
              (!store.phone && !store.socialMedia?.whatsapp) && styles.disabledButton
            ]} 
            onPress={() => openWhatsapp(store.socialMedia?.whatsapp || store.phone)}
            disabled={!store.phone && !store.socialMedia?.whatsapp}
          >
            <FontAwesome name="whatsapp" size={22} color="#155366" />
          </TouchableOpacity>
        </View>

        {/* Description
        {store.description && (
          <Text style={styles.description}>{store.description}</Text>
        )} */}

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.bookButton} 
            onPress={handleShare}
          >
            <Text style={styles.buttonText}>Share Me</Text>
          </TouchableOpacity>

          <TouchableOpacity 
    style={styles.chatButton}
    onPress={handleChatNow}
  >
    <Text style={styles.chatButtonText}>Chat Now</Text>
  </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'products' && styles.activeTab]}
          onPress={() => handleTabChange('products')}
        >
          <Text style={activeTab === 'products' ? styles.activeTabText : styles.tabText}>
            Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'gallery' && styles.activeTab]}
          onPress={() => handleTabChange('gallery')}
        >
          <Text style={activeTab === 'gallery' ? styles.activeTabText : styles.tabText}>
            Gallery
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'products' ? (
  <View style={styles.productList}>
    {products && products.length > 0 ? (
      products.map((item) => (
        <View key={item._id} style={styles.productCard}>
          <Image
            source={{ 
              uri: item.image || 'https://picsum.photos/300?random=11' 
            }}
            style={styles.productImage}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productDetails}>{item.description}</Text>
            <View style={styles.productFooter}>
              <Text style={styles.productPrice}>₹{item.price}</Text>
              <TouchableOpacity
              style={styles.bookNowBtn}
              onPress={() => {
                if (item.type === 'service') {
                  // Navigate to appointment screen
                  navigation.navigate('Appointment', {
                    itemId: item._id,
                    itemName: item.name,
                    itemDetails: item
                  });
                } else if (item.type === 'product') {
                  // Navigate to order details screen
                  navigation.navigate('OrderDetails', {
                    itemId: item._id,
                    itemName: item.name,
                    itemDetails: item
                  });
                } else {
                  alert("Unknown item type");
                }
              }}
            >
              <Text style={styles.bookNowText}>
                {item.type === 'service' ? 'Book' : 'Buy'}
              </Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      ))
    ) : (
      <View style={styles.noDataContainer}>
        <View style={styles.iconWrapper}>
          <Text style={styles.noDataIcon}>🛍️</Text>
        </View>
        <Text style={styles.noDataTitle}>No Products Found</Text>
        <Text style={styles.noDataSubtitle}>
          It looks like there are no products listed in this store yet. 
          Please check back soon or browse other stores.
        </Text>
      </View>
    )}
  </View>
) : (
  <View style={styles.gallery}>
    {gallery && gallery.length > 0 ? (
    gallery.map((img) => (
      <View key={img._id} style={styles.galleryCard}>
        <Image
          source={{ uri: img.image }}
          style={styles.galleryImage}
          resizeMode="cover"
        />
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>{img.caption}</Text>
        </View>
      </View>
    ))
  ) : (
      <View style={styles.noDataContainer}>
        <View style={styles.iconWrapper}>
          <Text style={styles.noDataIcon}>🖼️</Text>
        </View>
        <Text style={styles.noDataTitle}>No Images in Gallery</Text>
        <Text style={styles.noDataSubtitle}>
          This gallery is currently empty. Images will appear here once added.
        </Text>
      </View>
    )}
  </View>
)}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#155366',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    color: '#ff4040',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#155366',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#155366',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  avatarContainer: {
    padding: 3,
    borderRadius: 10,
    backgroundColor: '#E3F2F7',
    shadowColor: '#155366',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatar: {
    width: 330,
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#155366',
  },
  address: {
    fontSize: 15,
    color: '#505050',
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#505050',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#505050',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  iconRow: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f9f9f9',
  },
  iconWrapper: {
    backgroundColor: '#e0e0e0',
    borderRadius: 60,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
  },
  noDataIcon: {
    fontSize: 60,
  },
  noDataTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  noDataSubtitle: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
  },
  iconButton: {
    backgroundColor: '#E3F2F7',
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#155366',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
    opacity: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
    width: '100%',
    justifyContent: 'space-between',
  },
  bookButton: {
    backgroundColor: '#155366',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
    shadowColor: '#155366',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  chatButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#155366',
    shadowColor: '#155366',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  chatButtonText: {
    color: '#155366',
    fontWeight: 'bold',
    fontSize: 15,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderColor: '#E3F2F7',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    color: '#888',
    fontSize: 16,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderColor: '#155366',
  },
  activeTabText: {
    color: '#155366',
    fontWeight: 'bold',
    fontSize: 16,
  },
  productList: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  productCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 14,
    marginBottom: 16,
    flexDirection: 'row',
    padding: 14,
    shadowColor: '#155366',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#155366',
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 14,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155366',
  },
  productDetails: {
    fontSize: 13,
    color: '#505050',
    marginVertical: 6,
    lineHeight: 18,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#155366',
    fontWeight: '600',
  },
  bookNowBtn: {
    backgroundColor: '#E3F2F7',
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 8,
    shadowColor: '#155366',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bookNowText: {
    color: '#155366',
    fontWeight: '600',
    fontSize: 14,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  
  galleryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  
  galleryImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  
  captionContainer: {
    padding: 4,
  },
  
  captionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  
  noGalleryText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  }
  
});

export default SellerProfile;