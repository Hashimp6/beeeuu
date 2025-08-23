import { useRoute, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
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
    type: '',
    price: '',
    imageUris: [], // Changed from imageUri to imageUris array
  });

  // Create ref for ScrollView
  const scrollViewRef = React.useRef(null);

  // Calculate helper values for image management
  const totalImages = product.imageUris.length;
  const canAddMore = totalImages < 5;

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (!storedToken) {
          throw new Error('No token found');
        }
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
      type: '',
      price: '',
      imageUris: [], // Reset to empty array
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!storeDetails || !storeDetails._id) {
        throw new Error('Store details not available');
      }
      
      const storeId = storeDetails._id;

      const response = await axios.get(`${SERVER_URL}/products/store/${storeId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = response.data;
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
  }, [token, storeDetails]);

  // Fetch data when component mounts or comes into focus
  useFocusEffect(
    useCallback(() => {
      if (token && storeDetails?._id) {
        fetchProducts();
      }
    }, [token, storeDetails])
  );

  // Updated image picker to handle multiple images
  const pickMultipleImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to select images.',
          [{ text: 'OK' }]
        );
        return;
      }

      const remainingSlots = 5 - totalImages;
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Allow multiple selection
        quality: 0.8,
        allowsMultipleSelection: true, // Enable multiple selection
        selectionLimit: remainingSlots, // Limit to remaining slots
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImageUris = result.assets.map(asset => asset.uri);
        
        // Validate file sizes (5MB each)
        const validImages = [];
        for (const asset of result.assets) {
          if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
            Alert.alert('File Too Large', 'Each image must be less than 5MB');
            continue;
          }
          validImages.push(asset.uri);
        }
        
        setProduct(prev => ({ 
          ...prev, 
          imageUris: [...prev.imageUris, ...validImages].slice(0, 5) // Ensure max 5 images
        }));
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to select images. Please try again.');
    }
  };

  // Remove image from array
  const removeImage = (indexToRemove) => {
    setProduct(prev => ({
      ...prev,
      imageUris: prev.imageUris.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Handle type change (for non-restaurant stores)
  const handleTypeChange = (value) => {
    setProduct({ ...product, type: value });
  };

  // Add/Update product with proper validation
  const handleSubmitProduct = async () => {
    // Enhanced validation
    if (!product.name.trim() || !product.price.trim() || !product.category) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Category, Price)');
      return;
    }

    // Validate type for non-restaurant stores
    if (storeDetails.category !== "Restaurant" && !product.type) {
      Alert.alert('Error', 'Please select a type (Product or Service)');
      return;
    }

    // Validate price is a number
    if (isNaN(parseFloat(product.price)) || parseFloat(product.price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (!storeDetails || !storeDetails._id) {
      Alert.alert('Error', 'Store information is missing');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('store', storeDetails._id);
      formData.append('name', product.name.trim());
      formData.append('description', product.description.trim());
      formData.append('category', product.category);
      
      // Always append type - default to 'product' for restaurants
      const typeValue = storeDetails.category === "Restaurant" ? 'product' : product.type;
      formData.append('type', typeValue);
      
      formData.append('price', parseFloat(product.price).toString());
      
      // Append multiple images
      if (product.imageUris.length > 0) {
        product.imageUris.forEach((uri, index) => {
          const fileExtension = uri.split('.').pop() || 'jpg';
          formData.append('images', {
            uri: uri,
            type: `image/${fileExtension}`,
            name: `product_image_${Date.now()}_${index}.${fileExtension}`,
          });
        });
      }

      const productId = editingProduct?._id;
      const url = editingProduct 
        ? `${SERVER_URL}/products/${productId}`
        : `${SERVER_URL}/products/add`;

      const method = editingProduct ? 'put' : 'post';
    
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

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
      const errorMessage = err.response?.data?.message || 'Failed to save product. Please try again.';
      Alert.alert('Error', errorMessage);
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
      const errorMessage = err.response?.data?.message || 'Failed to delete product. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Edit product - updated to handle multiple images and auto-scroll
  const handleEditProduct = (item) => {
    setEditingProduct(item);
    setProduct({
      name: item.name || '',
      description: item.description || '',
      category: item.category || '',
      type: item.type || (storeDetails.category === "Restaurant" ? 'product' : ''), // Default for restaurants
      price: item.price ? item.price.toString() : '',
      imageUris: item.images || [], // Set existing images array
    });
    setShowAddForm(true);
    
    // Auto-scroll to top with animation
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true
      });
    }, 100); // Small delay to ensure form is rendered
  };

  const toggleAddForm = () => {
    if (showAddForm) {
      resetForm();
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowAddForm(true);
      
      // Auto-scroll to top when adding new product
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: 0,
          animated: true
        });
      }, 100);
    }
  };

  // Show loading state if token is not loaded yet
  if (!token && !error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#155366" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  // Show error state if token loading failed
  if (error && !token) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 20 }}>
          Authentication Error: {error}
        </Text>
        <TouchableOpacity 
          style={styles.submitBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.submitText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      ref={scrollViewRef} // Add ref to ScrollView
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

          {/* Product Name */}
          <TextInput
            placeholder="Product Name *"
            placeholderTextColor="#666"
            style={styles.input}
            value={product.name}
            onChangeText={(text) => setProduct({ ...product, name: text })}
          />

          {/* Description */}
          <TextInput
            placeholder="Description"
            placeholderTextColor="#666"
            style={[styles.input, styles.textArea]}
            value={product.description}
            onChangeText={(text) => setProduct({ ...product, description: text })}
            multiline
            numberOfLines={3}
          />

          {/* Type Dropdown - Only show for non-restaurant stores */}
          {storeDetails.category !== "Restaurant" && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Type *</Text>
              <Picker
                selectedValue={product.type}
                onValueChange={handleTypeChange}
                style={styles.picker}
              >
                <Picker.Item label="Select Type" value="" />
                <Picker.Item label="Product" value="product" />
                <Picker.Item label="Service" value="service" />
              </Picker>
            </View>
          )}

          {/* Category Dropdown */}
          <Picker
            selectedValue={product.category}
            onValueChange={(value) => setProduct({ ...product, category: value })}
            style={styles.picker}
          >
            <Picker.Item label="Select Category *" value="" />
            <Picker.Item label="Signature" value="signature" />
            <Picker.Item label="Starters" value="starter" />
            <Picker.Item label="Main Course" value="main-course" />
            <Picker.Item label="Chinese" value="chinese" />
            <Picker.Item label="Indian / Curry" value="indian" />
            <Picker.Item label="Biryani & Rice" value="biryani" />
            <Picker.Item label="Breads" value="breads" />
            <Picker.Item label="Pasta & Noodles" value="pasta-noodles" />
            <Picker.Item label="Soups" value="soups" />
            <Picker.Item label="Salads" value="salads" />
            <Picker.Item label="Breakfast" value="breakfast" />
            <Picker.Item label="Snacks / Quick Bites" value="snacks" />
            <Picker.Item label="Pizza" value="pizza" />
            <Picker.Item label="Burgers" value="burgers" />
            <Picker.Item label="Sandwiches" value="sandwiches" />
            <Picker.Item label="Coffee Specials" value="coffee-specials" />
            <Picker.Item label="Tea" value="tea" />
            <Picker.Item label="Coffee" value="coffee" />
            <Picker.Item label="Drinks" value="drinks" />
            <Picker.Item label="Mocktails" value="mocktails" />
            <Picker.Item label="Mojitos" value="mojitos" />
            <Picker.Item label="Shakes" value="shakes" />
            <Picker.Item label="Smoothies" value="smoothies" />
            <Picker.Item label="Falooda" value="falooda" />
            <Picker.Item label="Cakes" value="cakes" />
            <Picker.Item label="Desserts" value="desserts" />
            <Picker.Item label="Combo Meal" value="combo-meal" />
            <Picker.Item label="Today's Special" value="today-special" />
          </Picker>

          {/* Multiple Images Upload */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Images ({totalImages}/5)</Text>
            
            {/* Image Preview Grid */}
            {totalImages > 0 && (
              <View style={styles.imageGrid}>
                {product.imageUris.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri }} 
                      style={styles.previewImage}
                    />
                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      style={styles.removeImageBtn}
                    >
                      <Text style={styles.removeImageText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Upload Button */}
            {canAddMore && (
              <TouchableOpacity 
                style={styles.imagePicker} 
                onPress={pickMultipleImages}
              >
                <Text style={styles.imagePickerText}>
                  📷 {totalImages > 0 ? 'Add More Images' : 'Pick Images from Gallery'}
                </Text>
                <Text style={styles.imagePickerSubtext}>
                  Max 5 images, 5MB each
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Price */}
          <TextInput
            placeholder="Price (₹) *"
            placeholderTextColor="#666"
            keyboardType="numeric"
            style={styles.input}
            value={product.price}
            onChangeText={(text) => setProduct({ ...product, price: text })}
          />

          {/* Buttons */}
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
                      uri: item.images?.[0] || 'https://picsum.photos/300?random=11'
                    }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  {/* Show image count if multiple images */}
                  {item.images && item.images.length > 1 && (
                    <View style={styles.imageCountBadge}>
                      <Text style={styles.imageCountText}>+{item.images.length - 1}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.desc} numberOfLines={2}>
                    {item.description}
                  </Text>
                  {item.category && (
                    <Text style={styles.category}>{item.category}</Text>
                  )}
                  {item.type && (
                    <Text style={styles.category}>{item.type}</Text>
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
  formGroup: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#155366',
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#f5f5f5',
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: 'black',
    fontSize: 16,
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
  imagePickerSubtext: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: (screenWidth - 80) / 2,
    height: 120,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,0,0,0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    color: 'black', 
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
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  imageCountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
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
    marginBottom: 2,
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