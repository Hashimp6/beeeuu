import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '../config';

const NewStore = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get params
  const { editMode = false, storeData = {} } = route.params || {};
  console.log("datastt", storeData);

  // Form state - Initialize with existing data if in edit mode
  const [storeName, setStoreName] = useState(storeData.storeName || storeData.name || '');
  const [description, setDescription] = useState(storeData.description || '');
  const [imageUri, setImageUri] = useState(storeData.profileImage || '');
  const [imageInfo, setImageInfo] = useState(null);
  const [place, setPlace] = useState(storeData.place || '');
  const [phone, setPhone] = useState(storeData.phone || '');
  const [whatsapp, setWhatsapp] = useState(storeData.socialMedia?.whatsapp || '');
  const [instagram, setInstagram] = useState(storeData.socialMedia?.instagram || '');
  const [facebook, setFacebook] = useState(storeData.socialMedia?.facebook || '');
  const [website, setWebsite] = useState(storeData.socialMedia?.website || '');
  const [category, setCategory] = useState(storeData.category || '');
  const [storeNameAvailable, setStoreNameAvailable] = useState(null);
  const [checkingName, setCheckingName] = useState(false);

  // Validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // UI state
  const [loading, setLoading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const categories = [
    'Restaurant', 
    'Retail', 
    'Electronics', 
    'Fashion', 
    'Grocery', 
    'Services', 
    'Beauty', 
    'Health', 
    'Home & Decor',
    'Books & Stationery',
    'Sports & Fitness',
    'Entertainment',
    'Other'
  ];

  // Location API configuration
  const LOCATION_API_KEY = 'AIzaSyAWdpzsOIeDYSG76s3OncbRHmm5pBwiG24';
  const LOCATION_API_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

  // Validation functions
  const validateStoreName = (name) => {
    if (!name || name.trim().length === 0) {
      return 'Store name is required';
    }
    if (name.trim().length < 3) {
      return 'Store name must be at least 3 characters long';
    }
    if (name.trim().length > 50) {
      return 'Store name must be less than 50 characters';
    }
    if (!/^[a-zA-Z0-9\s&.-]+$/.test(name)) {
      return 'Store name can only contain letters, numbers, spaces, &, ., and -';
    }
    return null;
  };

  const validatePhone = (phoneNumber) => {
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      return 'Phone number is required';
    }
    
    // Remove all non-digit characters for validation
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      return 'Phone number must be at least 10 digits';
    }
    if (cleanPhone.length > 15) {
      return 'Phone number must be less than 15 digits';
    }
    
    // Indian phone number pattern (more flexible)
    const indianPhonePattern = /^[6-9]\d{9}$|^[+]?91[6-9]\d{9}$/;
    if (!indianPhonePattern.test(cleanPhone) && cleanPhone.length === 10) {
      return 'Please enter a valid Indian phone number';
    }
    
    return null;
  };

  const validateWhatsApp = (whatsappNumber) => {
    if (!whatsappNumber || whatsappNumber.trim().length === 0) {
      return null; // WhatsApp is optional
    }
    
    const cleanWhatsApp = whatsappNumber.replace(/\D/g, '');
    
    if (cleanWhatsApp.length < 10) {
      return 'WhatsApp number must be at least 10 digits';
    }
    if (cleanWhatsApp.length > 15) {
      return 'WhatsApp number must be less than 15 digits';
    }
    
    return null;
  };

  const validateURL = (url, fieldName) => {
    if (!url || url.trim().length === 0) {
      return null; // URL fields are optional
    }
    
    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      return `Please enter a valid ${fieldName} URL`;
    }
    
    return null;
  };

  const validateInstagram = (url) => {
    if (!url || url.trim().length === 0) {
      return null;
    }
    
    const instagramPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/;
    if (!instagramPattern.test(url)) {
      return 'Please enter a valid Instagram URL (e.g., https://instagram.com/username)';
    }
    
    return null;
  };

  const validateFacebook = (url) => {
    if (!url || url.trim().length === 0) {
      return null;
    }
    
    const facebookPattern = /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9._]+\/?$/;
    if (!facebookPattern.test(url)) {
      return 'Please enter a valid Facebook URL (e.g., https://facebook.com/page)';
    }
    
    return null;
  };

  const validateDescription = (desc) => {
    if (desc && desc.length > 500) {
      return 'Description must be less than 500 characters';
    }
    return null;
  };

  const validatePlace = (location) => {
    if (location && location.length > 100) {
      return 'Location must be less than 100 characters';
    }
    return null;
  };

  // Function to validate all fields
  const validateField = (fieldName, value) => {
    let error = null;
    
    switch (fieldName) {
      case 'storeName':
        error = validateStoreName(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'whatsapp':
        error = validateWhatsApp(value);
        break;
      case 'instagram':
        error = validateInstagram(value);
        break;
      case 'facebook':
        error = validateFacebook(value);
        break;
      case 'website':
        error = validateURL(value, 'website');
        break;
      case 'description':
        error = validateDescription(value);
        break;
      case 'place':
        error = validatePlace(value);
        break;
      case 'category':
        if (!value) {
          error = 'Please select a category';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  // Handle field changes with validation
  const handleFieldChange = (fieldName, value) => {
    // Update the field value
    switch (fieldName) {
      case 'storeName':
        setStoreName(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      case 'whatsapp':
        setWhatsapp(value);
        break;
      case 'instagram':
        setInstagram(value);
        break;
      case 'facebook':
        setFacebook(value);
        break;
      case 'website':
        setWebsite(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'place':
        setPlace(value);
        break;
      default:
        break;
    }

    // Validate the field
    const error = validateField(fieldName, value);
    
    // Update errors state
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  // Handle field blur (when user leaves the field)
  const handleFieldBlur = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return phone;
  };

  // Set navigation header based on mode
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: editMode ? 'Edit Store' : 'Register Store',
      headerStyle: {
        backgroundColor: '#000000',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [editMode, navigation]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (storeName.trim().length > 2 && !editMode) {
        checkStoreNameAvailability();
      } else {
        setStoreNameAvailable(null);
        setCheckingName(false);
      }
    }, 800);
  
    return () => clearTimeout(delayDebounceFn);
  }, [storeName, editMode]);

  // Handle location input and get suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (place.length > 2) {
        fetchLocationSuggestions();
      } else {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [place]);

  const fetchLocationSuggestions = async () => {
    try {
      const response = await axios.get(LOCATION_API_URL, {
        params: {
          input: place,
          key: LOCATION_API_KEY,
          types: 'geocode'
        }
      });
      
      if (response.data.predictions) {
        setLocationSuggestions(response.data.predictions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  const selectLocation = (description) => {
    setPlace(description);
    setShowSuggestions(false);
    // Validate the selected location
    const error = validateField('place', description);
    setErrors(prev => ({
      ...prev,
      place: error
    }));
  };

  const selectCategory = (selectedCategory) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
    // Clear category error when selected
    setErrors(prev => ({
      ...prev,
      category: null
    }));
  };

  const checkStoreNameAvailability = async () => {
    setCheckingName(true);
    setStoreNameAvailable(null);
    
    try {
      const response = await axios.get(`${SERVER_URL}/search/checkName`, {
        params: { name: storeName.trim() }
      });
      
      setStoreNameAvailable(response.data.available);
    } catch (error) {
      console.error('Error checking store name:', error);
      setStoreNameAvailable(null);
    } finally {
      setCheckingName(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const selectedImageUri = result.assets[0].uri;
        setImageUri(selectedImageUri);
        
        const fileInfo = await FileSystem.getInfoAsync(selectedImageUri);
        const fileExtension = selectedImageUri.split('.').pop();
        
        setImageInfo({
          uri: selectedImageUri,
          name: `store_profile_${Date.now()}.${fileExtension}`,
          type: `image/${fileExtension}`,
          size: fileInfo.size
        });
        
        // Clear image validation error
        setErrors(prev => ({
          ...prev,
          image: null
        }));
        
        console.log('Image selected for upload');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
      console.error(error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all fields
    newErrors.storeName = validateStoreName(storeName);
    newErrors.phone = validatePhone(phone);
    newErrors.whatsapp = validateWhatsApp(whatsapp);
    newErrors.instagram = validateInstagram(instagram);
    newErrors.facebook = validateFacebook(facebook);
    newErrors.website = validateURL(website, 'website');
    newErrors.description = validateDescription(description);
    newErrors.place = validatePlace(place);
    
    // Validate category
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    
    // Validate image
    if (!imageUri) {
      newErrors.image = 'Please upload a store logo';
    }
    
    // Check store name availability
    if (!editMode && storeNameAvailable === false) {
      newErrors.storeName = 'Store name is already taken. Please choose a different name.';
    }
    
    // Filter out null errors
    const filteredErrors = Object.keys(newErrors).reduce((acc, key) => {
      if (newErrors[key]) {
        acc[key] = newErrors[key];
      }
      return acc;
    }, {});
    
    setErrors(filteredErrors);
    
    // Mark all fields as touched
    setTouched({
      storeName: true,
      phone: true,
      whatsapp: true,
      instagram: true,
      facebook: true,
      website: true,
      description: true,
      place: true,
      category: true,
      image: true
    });
    
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill the all fields before submitting');
      return;
    }
  
    setLoading(true);
  
    try {
      const formData = new FormData();
  
      if (imageInfo) {
        formData.append('profileImage', {
          uri: imageInfo.uri,
          name: imageInfo.name,
          type: imageInfo.type,
        });
      }
  
      formData.append('storeName', storeName);
      formData.append('description', description);
      formData.append('place', place);
      formData.append('phone', phone);
      formData.append('category', category);
  
      const socialMedia = {
        whatsapp: whatsapp || "",
        instagram: instagram || "",
        facebook: facebook || "",
        website: website || "",
      };
  
      formData.append('socialMedia', JSON.stringify(socialMedia));
  
      const storeId = storeData._id;
      console.log("storid", storeData._id);
      
      const endpoint = editMode 
        ? `${SERVER_URL}/stores/${storeId}` 
        : `${SERVER_URL}/stores/register`;
      
      const method = editMode ? 'put' : 'post';
  
      const response = await axios[method](endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
  
      if (response.data) {
        Alert.alert(
          'Success',
          editMode ? 'Store updated successfully!' : 'Store registered successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate("profile")
            }
          ]
        );
        
        if (!editMode) {
          try {
            const userData = await AsyncStorage.getItem('user');
            if (userData !== null) {
              const user = JSON.parse(userData);
              user.role = 'seller';
              await AsyncStorage.setItem('user', JSON.stringify(user));
            }
          } catch (error) {
            console.error('Error updating role in AsyncStorage:', error);
          }
        }
        
        resetForm();
        
        if (editMode) {
          navigation.goBack();
        } else {
          navigation.navigate('Home');
        }
      }
  
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      Alert.alert('Error', 
        error.response?.data?.message || 
        `Failed to ${editMode ? 'update' : 'register'} store`
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (!editMode) {
      setStoreName('');
      setDescription('');
      setImageUri('');
      setImageInfo(null);
      setPlace('');
      setPhone('');
      setWhatsapp('');
      setInstagram('');
      setFacebook('');
      setWebsite('');
      setCategory('');
      setErrors({});
      setTouched({});
    }
  };

  // Helper function to determine input style based on validation
  const getInputStyle = (fieldName) => {
    const hasError = errors[fieldName] && touched[fieldName];
    const isValid = !errors[fieldName] && touched[fieldName] && 
                   ((fieldName === 'storeName' && storeName.trim().length > 0) ||
                    (fieldName === 'phone' && phone.trim().length > 0) ||
                    (fieldName === 'whatsapp' && whatsapp.trim().length > 0) ||
                    (fieldName === 'instagram' && instagram.trim().length > 0) ||
                    (fieldName === 'facebook' && facebook.trim().length > 0) ||
                    (fieldName === 'website' && website.trim().length > 0) ||
                    (fieldName === 'description' && description.trim().length > 0) ||
                    (fieldName === 'place' && place.trim().length > 0));

    return [
      styles.input,
      hasError && styles.inputError,
      isValid && styles.inputSuccess
    ];
  };

  // Render location suggestions
  const renderLocationSuggestions = () => {
    if (!showSuggestions || locationSuggestions.length === 0) return null;
    
    return (
      <View style={styles.suggestionContainer}>
        {locationSuggestions.map((item) => (
          <TouchableOpacity 
            key={item.place_id}
            style={styles.suggestionItem}
            onPress={() => selectLocation(item.description)}
          >
            <Ionicons name="location-outline" size={16} color="#555" />
            <Text style={styles.suggestionText}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const renderCategoryModal = () => {
    return (
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    category === item && styles.selectedCategoryItem
                  ]}
                  onPress={() => selectCategory(item)}
                >
                  <Text style={[
                    styles.categoryText,
                    category === item && styles.selectedCategoryText
                  ]}>
                    {item}
                  </Text>
                  {category === item && (
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {editMode ? 'Edit Your Store' : 'Register Your Store'}
          </Text>
          <Text style={styles.subtitle}>
            {editMode ? 'Update your store details' : 'Fill in the details to start selling'}
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={40} color="#888" />
                <Text style={styles.placeholderText}>Upload Logo</Text>
              </View>
            )}
          </TouchableOpacity>
          {imageUri && (
            <Text style={styles.uploadSuccess}>
              {editMode && !imageInfo ? 'Current image' : 'Image selected'}
            </Text>
          )}
          {errors.image && touched.image && (
            <Text style={styles.errorText}>{errors.image}</Text>
          )}
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Store Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Store Name*</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={getInputStyle('storeName')}
                value={storeName}
                onChangeText={(value) => handleFieldChange('storeName', value)}
                onBlur={() => handleFieldBlur('storeName')}
                placeholder="Enter your store name"
                placeholderTextColor="#888"
              />
              {!editMode && checkingName && (
                <ActivityIndicator 
                  size="small" 
                  color="#666" 
                  style={styles.inputIcon}
                />
              )}
              {!editMode && !checkingName && storeNameAvailable === true && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={20} 
                  color="#28a745" 
                  style={styles.inputIcon}
                />
              )}
              {!editMode && !checkingName && storeNameAvailable === false && (
                <Ionicons 
                  name="close-circle" 
                  size={20} 
                  color="#dc3545" 
                  style={styles.inputIcon}
                />
              )}
            </View>
            {errors.storeName && touched.storeName && (
              <Text style={styles.errorText}>{errors.storeName}</Text>
            )}
            {!editMode && storeNameAvailable === true && (
              <Text style={styles.successText}>Store name is available</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[getInputStyle('description'), styles.textArea]}
              value={description}
              onChangeText={(value) => handleFieldChange('description', value)}
              onBlur={() => handleFieldBlur('description')}
              placeholder="Describe your store and what you sell"
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
            {errors.description && touched.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category*</Text>
            <TouchableOpacity 
              style={[
                styles.categorySelector,
                errors.category && touched.category && styles.inputError
              ]}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={category ? styles.categoryValue : styles.categoryPlaceholder}>
                {category || "Select a category"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {errors.category && touched.category && (
              <Text style={styles.errorText}>{errors.category}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={getInputStyle('place')}
              value={place}
              onChangeText={(value) => handleFieldChange('place', value)}
              onBlur={() => handleFieldBlur('place')}
              placeholder="Enter store location"
              placeholderTextColor="#888"
              maxLength={100}
            />
            {renderLocationSuggestions()}
            {errors.place && touched.place && (
              <Text style={styles.errorText}>{errors.place}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number*</Text>
            <TextInput
              style={getInputStyle('phone')}
              value={phone}
              onChangeText={(value) => handleFieldChange('phone', value)}
              onBlur={() => handleFieldBlur('phone')}
              placeholder="Enter 10-digit phone number"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              maxLength={15}
            />
            {errors.phone && touched.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Social Media</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>WhatsApp</Text>
            <TextInput
              style={getInputStyle('whatsapp')}
              value={whatsapp}
              onChangeText={(value) => handleFieldChange('whatsapp', value)}
              onBlur={() => handleFieldBlur('whatsapp')}
              placeholder="WhatsApp number (optional)"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              maxLength={15}
            />
            {errors.whatsapp && touched.whatsapp && (
              <Text style={styles.errorText}>{errors.whatsapp}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram</Text>
            <TextInput
              style={getInputStyle('instagram')}
              value={instagram}
              onChangeText={(value) => handleFieldChange('instagram', value)}
              onBlur={() => handleFieldBlur('instagram')}
              placeholder="https://instagram.com/username"
              placeholderTextColor="#888"
              keyboardType="url"
              autoCapitalize="none"
            />
            {errors.instagram && touched.instagram && (
              <Text style={styles.errorText}>{errors.instagram}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Facebook</Text>
            <TextInput
              style={getInputStyle('facebook')}
              value={facebook}
              onChangeText={(value) => handleFieldChange('facebook', value)}
              onBlur={() => handleFieldBlur('facebook')}
              placeholder="https://facebook.com/page"
              placeholderTextColor="#888"
              keyboardType="url"
              autoCapitalize="none"
            />
            {errors.facebook && touched.facebook && (
              <Text style={styles.errorText}>{errors.facebook}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={getInputStyle('website')}
              value={website}
              onChangeText={(value) => handleFieldChange('website', value)}
              onBlur={() => handleFieldBlur('website')}
              placeholder="https://www.yourwebsite.com"
              placeholderTextColor="#888"
              keyboardType="url"
              autoCapitalize="none"
            />
            {errors.website && touched.website && (
              <Text style={styles.errorText}>{errors.website}</Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {editMode ? 'Update Store' : 'Register Store'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      {renderCategoryModal()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#000000',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 8,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  imagePickerButton: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  uploadSuccess: {
    color: '#28a745',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  formContainer: {
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 10,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 16,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  categorySelector: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryValue: {
    fontSize: 16,
    color: '#000000',
  },
  categoryPlaceholder: {
    fontSize: 16,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedCategoryItem: {
    backgroundColor: '#000000',
  },
  categoryText: {
    fontSize: 16,
    color: '#333333',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  suggestionContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    zIndex: 1000,
    maxHeight: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    right: 15,
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 1.5,
    backgroundColor: '#fff5f5',
  },
  inputSuccess: {
    borderColor: '#28a745',
    borderWidth: 1.5,
    backgroundColor: '#f8fff9',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  successText: {
    color: '#28a745',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
});

export default NewStore;