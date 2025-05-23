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

const StoreGallery = ({ navigation }) => {
  const route = useRoute();
  const [token, setToken] = useState(null);
  const storeParams = route.params || {};
  const storeDetails = storeParams.store;
  const [gallery, setGallery] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [editingImage, setEditingImage] = useState(null);
  const [imageData, setImageData] = useState({
    caption: '',
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
    setImageData({
      caption: '',
      imageUri: '',
    });
    setEditingImage(null);
    setShowAddForm(false);
  };

  // Fetch gallery from backend
  const fetchGallery = async () => {
    try {
      setLoading(true);
      setError('');
      const sellerId = storeDetails._id;
console.log("idselr",sellerId,token);

      const response = await axios.get(`${SERVER_URL}/gallery/${sellerId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = response.data;
      console.log('Fetched gallery:', data);
      setGallery(data.data?.images || []);

    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError('Failed to load gallery. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGallery();
  }, []);

  // Fetch data when component mounts or comes into focus
  useFocusEffect(
    useCallback(() => {
      if (token && storeDetails?._id) {
        fetchGallery();
      }
    }, [token, storeDetails])
  );

  // Image picker handler
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

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log('Selected image:', selectedImage);
        
        setImageData(prev => ({ 
          ...prev, 
          imageUri: selectedImage.uri 
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // Add/Update image
  const handleSubmitImage = async () => {
    if (!imageData.imageUri) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('seller', storeDetails._id);
      formData.append('caption', imageData.caption || 'New upload');
      
      if (imageData.imageUri) {
        const fileExtension = imageData.imageUri.split('.').pop() || 'jpg';
        formData.append('image', {
          uri: imageData.imageUri,
          type: `image/${fileExtension}`,
          name: `gallery_image_${Date.now()}.${fileExtension}`,
        });
      }

      console.log("gallery data", formData);
      
      const imageId = editingImage?._id;
      const url = editingImage 
        ? `${SERVER_URL}/gallery/${storeDetails._id}/image/${imageId}`
        : `${SERVER_URL}/gallery`;

      const method = editingImage ? 'put' : 'post';
      console.log("gallery request", url, method);

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Image saved:', response.data);

      Alert.alert(
        'Success',
        `Image ${editingImage ? 'updated' : 'added'} successfully!`,
        [{
          text: 'OK', onPress: () => {
            resetForm();
            fetchGallery();
          }
        }]
      );

    } catch (err) {
      console.error('Error saving image:', err);
      Alert.alert('Error', 'Failed to save image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete image
  const handleDeleteImage = (imageId) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteImage(imageId)
        }
      ]
    );
  };

  const deleteImage = async (imageId) => {
    try {
      setLoading(true);
  
      const response = await axios.delete(`${SERVER_URL}/gallery/${storeDetails._id}/image/${imageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      Alert.alert('Success', 'Image deleted successfully!');
      fetchGallery();
  
    } catch (err) {
      console.error('Error deleting image:', err);
      Alert.alert('Error', 'Failed to delete image. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Edit image
  const handleEditImage = (item) => {
    setEditingImage(item);
    setImageData({
      caption: item.caption || '',
      imageUri: item.image || '',
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
        <Text style={styles.title}>Store Gallery ({gallery?.length || 0})</Text>
        <TouchableOpacity style={styles.addImageBtn} onPress={toggleAddForm}>
          <Text style={styles.addImageText}>
            {showAddForm ? 'Cancel' : '+ Add Image'}
          </Text>
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={styles.addImageForm}>
          <Text style={styles.formTitle}>
            {editingImage ? 'Edit Image' : 'Add New Image'}
          </Text>
          
          <TextInput
            placeholder="Caption (optional)"
            style={[styles.input, styles.textArea]}
            value={imageData.caption}
            onChangeText={(text) => setImageData({...imageData, caption: text})}
            multiline
            numberOfLines={2}
          />
        
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            <Text style={styles.imagePickerText}>
              {imageData.imageUri ? 'Change Image' : '📷 Pick Image from Gallery'}
            </Text>
          </TouchableOpacity>
        
          {imageData.imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image 
                source={{ uri: imageData.imageUri }} 
                style={styles.previewImage}
                onError={(error) => {
                  console.log('Image load error:', error);
                  Alert.alert('Error', 'Failed to load image');
                }}
              />
              <TouchableOpacity 
                style={styles.removeImageBtn} 
                onPress={() => setImageData({...imageData, imageUri: ''})}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.submitBtn, loading && styles.disabledBtn]} 
              onPress={handleSubmitImage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.submitText}>
                  {editingImage ? 'Update' : 'Add Image'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading && !showAddForm ? (
        <ActivityIndicator size="large" color="#155366" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.galleryGrid}>
          {error && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>{error}</Text>
            </View>
          )}
          {gallery?.length > 0 ? (
            <View style={styles.gridContainer}>
              {gallery.map((item, index) => (
                <View key={item._id} style={styles.galleryItem}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ 
                        uri: item.image || 'https://picsum.photos/300?random=' + index
                      }}
                      style={styles.galleryImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.imageInfo}>
                    <Text style={styles.caption} numberOfLines={2}>
                      {item.caption || 'No caption'}
                    </Text>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => handleEditImage(item)}
                      >
                        <Text style={styles.editText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteImage(item._id)}
                      >
                        <Text style={styles.deleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.noImages}>No Images Found</Text>
              <Text style={styles.noImagesSubtext}>
                Add your first image to get started
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default StoreGallery;

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
  addImageBtn: {
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addImageText: {
    color: '#155366',
    fontWeight: 'bold',
  },
  addImageForm: {
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
    height: 60,
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
  galleryGrid: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  galleryItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  imageInfo: {
    padding: 10,
  },
  caption: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
    minHeight: 32,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: '#f44336',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
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
  noImages: {
    textAlign: 'center',
    color: '#888',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noImagesSubtext: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 14,
    marginTop: 8,
  },
});