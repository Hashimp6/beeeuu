import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar,
  Dimensions
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const { width } = Dimensions.get('window');

const AddOfferScreen = ({ route, navigation }) => {
  const { store, editOffer } = route?.params || {};
  const isEditing = !!editOffer;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    originalPrice: '',
    offerPrice: '',
    validFrom: new Date().toISOString(),
    validDuration: '24', // hours
    category: 'Food & Beverages',
    tags: '',
    image: null
  });
  const [imageUri, setImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Duration options
  const durationOptions = [
    { label: '1 Day', value: '24' },
    { label: '2 Days', value: '48' },
    { label: '3 Days', value: '72' },
    { label: '5 Days', value: '120' },
    { label: '7 Days', value: '168' }
  ];
  

  // Category options
  const categoryOptions = [
    'Food & Beverages',
    'Fashion & Clothing',
    'Electronics',
    'Health & Beauty',
    'Home & Garden',
    'Sports & Fitness',
    'Travel & Tourism',
    'Entertainment',
    'Education',
    'Services',
    'Others'
  ];

  // Pre-fill form data when editing
  useEffect(() => {
    if (isEditing && editOffer) {
      // Calculate duration from validFrom and validTo for editing
      let duration = '24';
      if (editOffer.validFrom && editOffer.validTo) {
        const fromDate = new Date(editOffer.validFrom);
        const toDate = new Date(editOffer.validTo);
        const diffHours = Math.ceil((toDate - fromDate) / (1000 * 60 * 60));
        duration = diffHours.toString();
      }

      setFormData({
        title: editOffer.title || '',
        description: editOffer.description || '',
        discountType: editOffer.discountType || 'percentage',
        discountValue: editOffer.discountValue?.toString() || '',
        originalPrice: editOffer.originalPrice?.toString() || '',
        offerPrice: editOffer.offerPrice?.toString() || '',
        validFrom: editOffer.validFrom || new Date().toISOString(),
        validDuration: duration,
        category: editOffer.category || 'Food & Beverages',
        tags: Array.isArray(editOffer.tags) ? editOffer.tags.join(', ') : (editOffer.tags || ''),
        image: null
      });

      // Set image preview if editing and has existing image
      if (editOffer.image) {
        setImageUri(editOffer.image);
      }
    }
  }, [isEditing, editOffer]);

  const showToast = (message, type) => {
    Alert.alert(
      type === 'success' ? 'Success' : 'Error',
      message,
      [{ text: 'OK' }]
    );
  };
  // Convert ISO date string to DD-MM-YYYY
const formatToDDMMYYYY = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
  // Convert DD-MM-YYYY to ISO string with time
  const parseDDMMYYYYtoISO = (ddmmyyyy) => {
    const [day, month, year] = ddmmyyyy.split('-');
    const iso = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    return iso.toISOString();
  };
  

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        
        // Check file size (5MB limit)
        if (asset.fileSize > 5 * 1024 * 1024) {
          showToast('Image size should be less than 5MB', 'error');
          return;
        }

        setFormData(prev => ({
          ...prev,
          image: {
            uri: asset.uri,
            type: asset.type,
            name: asset.fileName || 'image.jpg',
          }
        }));
        setImageUri(asset.uri);
      }
    });
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImageUri(null);
  };

  const calculateValidTo = (validFrom, durationHours) => {
    const fromDate = new Date(validFrom);
    const toDate = new Date(fromDate.getTime() + (parseInt(durationHours) * 60 * 60 * 1000));
    return toDate.toISOString();
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      showToast('Please enter a title', 'error');
      return;
    }
    
    if (!formData.description.trim()) {
      showToast('Please enter a description', 'error');
      return;
    }

    if (!formData.originalPrice.trim()) {
      showToast('Please enter original price', 'error');
      return;
    }

    if (!formData.offerPrice.trim()) {
      showToast('Please enter offer price', 'error');
      return;
    }

    if (!formData.discountValue.trim()) {
      showToast('Please enter discount value', 'error');
      return;
    }

    if (!store?.id && !store?._id) {
      showToast('Store information is missing', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('discountType', formData.discountType);
      formDataToSend.append('discountValue', formData.discountValue);
      formDataToSend.append('originalPrice', formData.originalPrice);
      formDataToSend.append('offerPrice', formData.offerPrice);
      formDataToSend.append('validFrom', formData.validFrom);
      formDataToSend.append('validTo', calculateValidTo(formData.validFrom, formData.validDuration));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('storeId', store.id || store._id);
      
      // Only append image if a new file was selected
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      let url, method;
      
      if (isEditing) {
        url = `YOUR_SERVER_URL/offers/${editOffer.id || editOffer._id}`;
        method = 'PUT';
      } else {
        url = 'YOUR_SERVER_URL/offers';
        method = 'POST';
      }

      const response = await fetch(url, {
        method: method,
        body: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        const successMessage = isEditing 
          ? 'Offer updated successfully!' 
          : 'Offer created successfully!';
        
        showToast(successMessage, 'success');
        
        // Navigate back after success
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        const errorMessage = responseData.message || 
          (isEditing ? 'Failed to update offer' : 'Failed to create offer');
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const PickerButton = ({ value, label, isSelected, onPress }) => (
    <TouchableOpacity
      style={[styles.pickerButton, isSelected && styles.pickerButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.pickerButtonText, isSelected && styles.pickerButtonTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d9488" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Offer' : 'Add New Offer'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isEditing ? 'Update your offer details' : 'Create an amazing offer'}
        </Text>
        {store && (
          <Text style={styles.storeText}>
            Store: {store.storeName || store.name}
          </Text>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Offer Title</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholder="Enter offer title"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Enter offer description"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Category Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              {categoryOptions.map((category) => (
                <PickerButton
                  key={category}
                  value={category}
                  label={category}
                  isSelected={formData.category === category}
                  onPress={() => handleInputChange('category', category)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Discount Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Discount Type</Text>
            <View style={styles.pickerContainer}>
              <PickerButton
                value="percentage"
                label="Percentage (%)"
                isSelected={formData.discountType === 'percentage'}
                onPress={() => handleInputChange('discountType', 'percentage')}
              />
              <PickerButton
                value="fixed"
                label="Fixed Amount"
                isSelected={formData.discountType === 'fixed'}
                onPress={() => handleInputChange('discountType', 'fixed')}
              />
            </View>
          </View>

          {/* Discount Value */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
            </Text>
            <TextInput
              style={styles.textInput}
              value={formData.discountValue}
              onChangeText={(value) => handleInputChange('discountValue', value)}
              placeholder={formData.discountType === 'percentage' ? '10' : '50'}
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          {/* Price Fields Row */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Original Price (₹)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.originalPrice}
                onChangeText={(value) => handleInputChange('originalPrice', value)}
                placeholder="100"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Offer Price (₹)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.offerPrice}
                onChangeText={(value) => handleInputChange('offerPrice', value)}
                placeholder="80"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>
            
          </View>
          <View style={styles.inputGroup}>
  <Text style={styles.label}>Offer Start Date (DD-MM-YYYY)</Text>
  <TextInput
    style={styles.textInput}
    placeholder="21-07-2025"
    placeholderTextColor="#9ca3af"
    value={formatToDDMMYYYY(formData.validFrom)}
    onChangeText={(value) => {
      const iso = parseDDMMYYYYtoISO(value);
      handleInputChange('validFrom', iso);
    }}
  />
</View>



          {/* Offer Duration */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Offer Duration</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.durationContainer}>
              {durationOptions.map((option) => (
                <PickerButton
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  isSelected={formData.validDuration === option.value}
                  onPress={() => handleInputChange('validDuration', option.value)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Tags Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags (comma separated)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.tags}
              onChangeText={(value) => handleInputChange('tags', value)}
              placeholder="discount, sale, special offer"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Image Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Offer Image</Text>
            
            {!imageUri ? (
              <TouchableOpacity style={styles.imageUploadButton} onPress={handleImageUpload}>
                <Text style={styles.imageUploadIcon}>📷</Text>
                <Text style={styles.imageUploadText}>Click to upload image</Text>
                <Text style={styles.imageUploadSubtext}>PNG, JPG up to 5MB</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
                {isEditing && !formData.image && (
                  <View style={styles.currentImageBadge}>
                    <Text style={styles.currentImageText}>Current Image</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Offer Preview Card */}
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewContent}>
              <Text style={styles.previewOfferTitle}>{formData.title || 'Offer Title'}</Text>
              <Text style={styles.previewDescription}>{formData.description || 'Offer description'}</Text>
              <View style={styles.previewPriceRow}>
                <Text style={styles.previewOriginalPrice}>₹{formData.originalPrice || '100'}</Text>
                <Text style={styles.previewOfferPrice}>₹{formData.offerPrice || '80'}</Text>
                <Text style={styles.previewDiscount}>
                  {formData.discountValue || '20'}{formData.discountType === 'percentage' ? '% OFF' : ' OFF'}
                </Text>
              </View>
              <Text style={styles.previewCategory}>{formData.category}</Text>
              {formData.validDuration && (
                <Text style={styles.previewDuration}>
                  Valid for: {durationOptions.find(d => d.value === formData.validDuration)?.label || '24 Hours'}
                </Text>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </Text>
              </View>
            ) : (
              <View style={styles.submitButtonContent}>
                <Text style={styles.submitButtonIcon}>
                  {isEditing ? '📝' : '📤'}
                </Text>
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Update Offer' : 'Create Offer'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Cancel Button for Edit Mode */}
          {isEditing && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#a7f3d0',
    textAlign: 'center',
    marginTop: 8,
  },
  storeText: {
    color: '#5eead4',
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#a7f3d0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  durationContainer: {
    flexDirection: 'row',
  },
  pickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#a7f3d0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    marginRight: 8,
    minWidth: 80,
  },
  pickerButtonSelected: {
    borderColor: '#0d9488',
    backgroundColor: '#f0fdfa',
  },
  pickerButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  pickerButtonTextSelected: {
    color: '#0d9488',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  halfWidth: {
    flex: 1,
  },
  imageUploadButton: {
    width: '100%',
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#5eead4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  imageUploadIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  imageUploadText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  imageUploadSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#a7f3d0',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  currentImageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#0d9488',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentImageText: {
    color: '#ffffff',
    fontSize: 12,
  },
  previewCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d9488',
    marginBottom: 12,
  },
  previewContent: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewOfferTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  previewPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  previewOriginalPrice: {
    fontSize: 16,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  previewOfferPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  previewDiscount: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  previewCategory: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  previewDuration: {
    fontSize: 12,
    color: '#0d9488',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#0d9488',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonIcon: {
    fontSize: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default AddOfferScreen;