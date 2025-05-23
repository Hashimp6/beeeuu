import { useRoute, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SERVER_URL } from '../config';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

if (Platform.OS === 'android') UIManager.setLayoutAnimationEnabledExperimental(true);

const { width: screenWidth } = Dimensions.get('window');

const SellerProfile = ({ navigation }) => {
  const route = useRoute();
  const [token, setToken] = useState(null);
  const storeParams = route.params || {};
  const storeDetails = storeParams.store;
  const [store, setStore] = useState({ products: [] });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [product, setProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    imageUri: '',
  });

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

  // Reset form function
  const resetForm = () => {
    setProduct({
      name: '',
      description: '',
      category: '',
      price: '',
      imageUri: '',
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const storeId = storeDetails._id;

      const response = await axios.get(`${SERVER_URL}/products/store/${storeId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = response.data;
      console.log('Fetched products:', data);
      setStore({ products: data || [] });

    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, []);

  // Fetch data when component mounts or comes into focus
  useFocusEffect(
    useCallback(() => {
      if (token && storeDetails?._id) {
        fetchProducts();
      }
    }, [token, storeDetails])
  );

  // Fixed image picker handler
  const pickImage = async () => {
    try {
      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to select images.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker - FIXED: Use correct enum
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Use array format instead of enum
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log('Selected image:', selectedImage);
        
        setProduct(prev => ({ 
          ...prev, 
          imageUri: selectedImage.uri 
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // FIXED: Add/Update product with proper null checking
  const handleSubmitProduct = async () => {
    if (!product.name || !product.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('store', storeDetails._id);
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('category', product.category);
      formData.append('price', product.price);
      
      if (product.imageUri) {
        const fileExtension = product.imageUri.split('.').pop() || 'jpg';
        formData.append('image', {
          uri: product.imageUri,
          type: `image/${fileExtension}`,
          name: `product_image_${Date.now()}.${fileExtension}`,
        });
      }

      console.log("daataa", formData);
      
      // FIXED: Safe access to _id with optional chaining
      const productId = editingProduct?._id;
      const url = editingProduct 
        ? `${SERVER_URL}/products/${productId}`
        : `${SERVER_URL}/products/add`;

      const method = editingProduct ? 'put' : 'post';
      console.log("every", url, formData, token);

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Product saved:', response.data);

      Alert.alert(
        'Success',
        `Product ${editingProduct ? 'updated' : 'added'} successfully!`,
        [{
          text: 'OK', onPress: () => {
            resetForm();
            fetchProducts();
          }
        }]
      );

    } catch (err) {
      console.error('Error saving product:', err);
      Alert.alert('Error', 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteProduct(productId)
        }
      ]
    );
  };

  const deleteProduct = async (productId) => {
    try {
      setLoading(true);
  
      const response = await axios.delete(`${SERVER_URL}/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      Alert.alert('Success', 'Product deleted successfully!');
      fetchProducts();
  
    } catch (err) {
      console.error('Error deleting product:', err);
      Alert.alert('Error', 'Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Edit product
  const handleEditProduct = (item) => {
    setEditingProduct(item);
    setProduct({
      name: item.name,
      description: item.description,
      category: item.category || '',
      price: item.price.toString(),
      imageUri: item.image|| '',
    });
    setShowAddForm(true);
  };

  

  const toggleAddForm = () => {
    if (showAddForm) {
      resetForm();
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowAddForm(true);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Products ({store?.products?.length || 0})</Text>
        <TouchableOpacity style={styles.addProductBtn} onPress={toggleAddForm}>
          <Text style={styles.addProductText}>
            {showAddForm ? 'Cancel' : '+ Add Product'}
          </Text>
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={styles.addProductForm}>
          <Text style={styles.formTitle}>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Text>
          
          <TextInput
            placeholder="Product Name *"
            style={styles.input}
            value={product.name}
            onChangeText={(text) => setProduct({...product, name: text})}
          />
          
          <TextInput
            placeholder="Description"
            style={[styles.input, styles.textArea]}
            value={product.description}
            onChangeText={(text) => setProduct({...product, description: text})}
            multiline
            numberOfLines={3}
          />
          
          <TextInput
            placeholder="Category"
            style={styles.input}
            value={product.category}
            onChangeText={(text) => setProduct({...product, category: text})}
          />
        
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <Text style={styles.imagePickerText}>
              {product.imageUri ? 'Change Image' : '📷 Pick Image from Gallery'}
            </Text>
          </TouchableOpacity>
        
          {product.imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image 
                source={{ uri: product.imageUri }} 
                style={styles.previewImage}
                onError={(error) => {
                  console.log('Image load error:', error);
                  Alert.alert('Error', 'Failed to load image');
                }}
              />
              <TouchableOpacity 
                style={styles.removeImageBtn} 
                onPress={() => setProduct({...product, imageUri: ''})}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        
          <TextInput
            placeholder="Price (₹) *"
            keyboardType="numeric"
            style={styles.input}
            value={product.price}
            onChangeText={(text) => setProduct({...product, price: text})}
          />
        
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.submitBtn, loading && styles.disabledBtn]} 
              onPress={handleSubmitProduct}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.submitText}>
                  {editingProduct ? 'Update' : 'Add Product'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading && !showAddForm ? (
        <ActivityIndicator size="large" color="#155366" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.productList}>
          {error && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>{error}</Text>
            </View>
          )}
          {store?.products?.length > 0 ? (
            store.products.map((item) => (
              <View key={item._id} style={styles.card}>
                <View style={styles.imageContainer}>
                  <Image
                    source={{ 
                      uri: item.image || 'https://picsum.photos/300?random=11' 
                    }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.desc} numberOfLines={2}>
                    {item.description}
                  </Text>
                  {item.category && (
                    <Text style={styles.category}>{item.category}</Text>
                  )}
                  <View style={styles.footer}>
                    <Text style={styles.price}>₹{item.price}</Text>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => handleEditProduct(item)}
                      >
                        <Text style={styles.editText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteProduct(item._id)}
                      >
                        <Text style={styles.deleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.noProducts}>No Products Found</Text>
              <Text style={styles.noProductsSubtext}>
                Add your first product to get started
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default SellerProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f8ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 40,
    backgroundColor: '#155366',
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  addProductBtn: {
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addProductText: {
    color: '#155366',
    fontWeight: 'bold',
  },
  addProductForm: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    margin: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#155366',
    marginBottom: 15,
    textAlign: 'center',
  },
  imagePicker: {
    backgroundColor: '#e0f7fa',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#b2ebf2',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    color: '#155366',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginTop: 10,
    alignItems: 'center',
  },
  previewImage: {
    width: screenWidth - 80,
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  submitBtn: {
    backgroundColor: '#155366',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  cancelBtn: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  infoText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  productList: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    minHeight: 140,
  },
  imageContainer: {
    width: 130,
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155366',
    lineHeight: 20,
  },
  desc: {
    fontSize: 13,
    color: '#666',
    marginVertical: 4,
    lineHeight: 18,
  },
  category: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    color: '#155366',
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  deleteBtn: {
    backgroundColor: '#f44336',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  noProducts: {
    textAlign: 'center',
    color: '#888',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noProductsSubtext: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 14,
    marginTop: 8,
  },
});