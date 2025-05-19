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

const screenWidth = Dimensions.get('window').width;

// Sample gallery and products data until real data is available
const dummyGalleryImages = [
  'https://picsum.photos/200?random=1',
  'https://picsum.photos/200?random=2',
  'https://picsum.photos/200?random=3',
  'https://picsum.photos/200?random=4',
  'https://picsum.photos/200?random=5',
  'https://picsum.photos/200?random=6',
];

const dummyProducts = [
  {
    id: '1',
    image: 'https://picsum.photos/300?random=11',
    name: 'Coconut Oil 1L',
    details: 'Pure cold-pressed organic coconut oil.',
    price: '₹250',
  },
  {
    id: '2',
    image: 'https://picsum.photos/300?random=12',
    name: 'Homemade Soap',
    details: 'Natural handmade herbal soap bar.',
    price: '₹80',
  },
  {
    id: '3',
    image: 'https://picsum.photos/300?random=13',
    name: 'Banana Chips',
    details: 'Crunchy Kerala-style banana chips.',
    price: '₹120',
  },
];

const SellerProfile = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute(); 
  const { user, token, isAuthenticated } = useAuth(); 
  const [store, setStore] = useState(null);
  const [error, setError] = useState('');
  const { id } = route.params;

  const openLink = (url) => {
    if (url && url.trim() !== '') {
      Linking.openURL(url);
    }
  };
    // Add a function to handle the chat button press
    const handleChatNow = async () => {
      setLoading(true);
      try {
        
        // First, check if a conversation already exists or create a new one
        const response = await axios.post(
          `${SERVER_URL}/messages/conversations`,
          {
            receiverId: store.userId // Store owner's user ID
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // Get conversation ID from response
        const { conversationId } = response.data;
        
       console.log("convid",conversationId);
       

        navigation.navigate('ChatDetail', {
          conversationId,
          otherUser: {
            _id: store.userId,
            username: store.storeName,
            storeName: store.storeName,
            storeId: store._id,
            avatar: store.profileImage || null, // optional
          }
        });
        
        
      } catch (error) {
        console.error('Error starting chat:', error);
        alert('Could not start chat. Please try again.');
      }  finally {
        // Reset loading state regardless of success or failure
        setLoading(false);
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
          products: response.data.products,
          gallery: response.data.gallery,
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
            onPress={() => navigation.navigate('AppointmentCalendar', { storeId: store._id })}
          >
            <Text style={styles.buttonText}>Book Now</Text>
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
          onPress={() => setActiveTab('products')}
        >
          <Text style={activeTab === 'products' ? styles.activeTabText : styles.tabText}>
            Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'gallery' && styles.activeTab]}
          onPress={() => setActiveTab('gallery')}
        >
          <Text style={activeTab === 'gallery' ? styles.activeTabText : styles.tabText}>
            Gallery
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'products' ? (
        <View style={styles.productList}>
          {store.products && store.products.length > 0 ? (
            store.products.map((item) => (
              <View key={item._id} style={styles.productCard}>
                <Image 
                  source={{ uri: item.images?.[0] || 'https://picsum.photos/300?random=11' }} 
                  style={styles.productImage} 
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productDetails}>{item.description}</Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>₹{item.price}</Text>
                    <TouchableOpacity 
                      style={styles.bookNowBtn}
                      onPress={() => navigation.navigate('ProductDetails', { product: item })}
                    >
                      <Text style={styles.bookNowText}>Book</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
          //   <View style={styles.noDataContainer}>
          //   <Text style={styles.noDataIcon}>🛒</Text>
          //   <Text style={styles.noDataText}>No Products Available</Text>
          // </View>
            // Using dummy products when no real products exist
            dummyProducts.map((item) => (
              <View key={item.id} style={styles.productCard}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productDetails}>{item.details}</Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>{item.price}</Text>
                    <TouchableOpacity style={styles.bookNowBtn}>
                      <Text style={styles.bookNowText}>Book</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      ) : (
        <View style={styles.gallery}>
          {store.gallery && store.gallery.length > 0 ? (
            store.gallery.map((img, index) => (
              <View key={index} style={styles.galleryImageContainer}>
                <Image source={{ uri: img }} style={styles.galleryImage} />
              </View>
            ))
          ) : (
          //   <View style={styles.noDataContainer}>
          //   <Text style={styles.noDataIcon}>🖼️</Text>
          //   <Text style={styles.noDataText}>No Images in Gallery</Text>
          // </View>
            // Using dummy gallery when no real gallery exists
            dummyGalleryImages.map((img, index) => (
              <View key={index} style={styles.galleryImageContainer}>
                <Image source={{ uri: img }} style={styles.galleryImage} />
              </View>
            ))
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
    borderRadius: 60,
    backgroundColor: '#E3F2F7',
    shadowColor: '#155366',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    paddingHorizontal: 20,
    marginTop: 15,
    justifyContent: 'space-between',
  },
  galleryImageContainer: {
    width: (screenWidth - 50) / 3,
    height: (screenWidth - 50) / 3,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#155366',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    backgroundColor: '#E3F2F7',
    padding: 2,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
});

export default SellerProfile;