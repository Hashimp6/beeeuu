import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SERVER_URL } from '../config'; // Import your config

const { width } = Dimensions.get('window');

const CategoryManagementScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    icon: null,
  });
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    image: null,
    apiEndpoint: '',
  });

  const API_BASE_URL = `${SERVER_URL}/category`;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/group`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  const pickImage = async (type) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Camera roll permission is required to select images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'category') {
        setCategoryForm({ ...categoryForm, icon: result.assets[0] });
      } else {
        setSubcategoryForm({ ...subcategoryForm, image: result.assets[0] });
      }
    }
  };

  const createFormData = (data, imageField, imageData) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key !== imageField && data[key]) {
        formData.append(key, data[key]);
      }
    });

    if (imageData) {
      formData.append(imageField, {
        uri: imageData.uri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });
    }

    return formData;
  };

  const handleCategorySubmit = async () => {
    if (!categoryForm.title.trim()) {
      Alert.alert('Error', 'Please enter a category title');
      return;
    }

    try {
      setLoading(true);
      const formData = createFormData(categoryForm, 'icon', categoryForm.icon);

      const url = editMode ? 
        `${API_BASE_URL}/group/${selectedCategory._id}` : 
        `${API_BASE_URL}/group`;
      
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        Alert.alert('Success', `Category ${editMode ? 'updated' : 'created'} successfully`);
        resetCategoryForm();
        setModalVisible(false);
        fetchCategories();
      } else {
        throw new Error('Failed to save category');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategorySubmit = async () => {
    if (!subcategoryForm.name.trim() || !subcategoryForm.apiEndpoint.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const formData = createFormData(subcategoryForm, 'image', subcategoryForm.image);

      const url = editMode ? 
        `${API_BASE_URL}/group/${selectedCategory._id}/sub/${selectedSubcategory._id}` :
        `${API_BASE_URL}/group/${selectedCategory._id}/sub`;
      
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        Alert.alert('Success', `Subcategory ${editMode ? 'updated' : 'created'} successfully`);
        resetSubcategoryForm();
        setSubModalVisible(false);
        fetchCategories();
      } else {
        throw new Error('Failed to save subcategory');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? This will also delete all subcategories.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await fetch(`${API_BASE_URL}/group/${categoryId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                Alert.alert('Success', 'Category deleted successfully');
                fetchCategories();
              } else {
                throw new Error('Failed to delete category');
              }
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const deleteSubcategory = async (categoryId, subcategoryId) => {
    Alert.alert(
      'Delete Subcategory',
      'Are you sure you want to delete this subcategory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await fetch(`${API_BASE_URL}/group/${categoryId}/sub/${subcategoryId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                Alert.alert('Success', 'Subcategory deleted successfully');
                fetchCategories();
              } else {
                throw new Error('Failed to delete subcategory');
              }
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const resetCategoryForm = () => {
    setCategoryForm({ title: '', icon: null });
    setEditMode(false);
    setSelectedCategory(null);
  };

  const resetSubcategoryForm = () => {
    setSubcategoryForm({ name: '', image: null, apiEndpoint: '' });
    setEditMode(false);
    setSelectedSubcategory(null);
  };

  const openCategoryModal = (category = null) => {
    if (category) {
      setCategoryForm({ title: category.title, icon: null });
      setSelectedCategory(category);
      setEditMode(true);
    } else {
      resetCategoryForm();
    }
    setModalVisible(true);
  };

  const openSubcategoryModal = (category, subcategory = null) => {
    setSelectedCategory(category);
    if (subcategory) {
      setSubcategoryForm({
        name: subcategory.name,
        image: null,
        apiEndpoint: subcategory.apiEndpoint,
      });
      setSelectedSubcategory(subcategory);
      setEditMode(true);
    } else {
      resetSubcategoryForm();
    }
    setSubModalVisible(true);
  };

  const renderCategoryCard = (category) => (
    <View key={category._id} style={styles.categoryCard}>
      <LinearGradient
        colors={['#0d9488', '#14b8a6']}
        style={styles.categoryHeader}
      >
        <View style={styles.categoryHeaderContent}>
          <View style={styles.categoryInfo}>
            {category.icon && (
              <Image source={{ uri: category.icon }} style={styles.categoryIcon} />
            )}
            <Text style={styles.categoryTitle}>{category.title}</Text>
          </View>
          <View style={styles.categoryActions}>
            <TouchableOpacity
              onPress={() => openCategoryModal(category)}
              style={styles.actionButton}
            >
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteCategory(category._id)}
              style={styles.actionButton}
            >
              <Ionicons name="trash" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.subcategoriesContainer}>
        <View style={styles.subcategoryHeader}>
          <Text style={styles.subcategoryHeaderText}>Subcategories</Text>
          <TouchableOpacity
            onPress={() => openSubcategoryModal(category)}
            style={styles.addSubButton}
          >
            <Ionicons name="add-circle" size={24} color="#667eea" />
          </TouchableOpacity>
        </View>

        {category.categories && category.categories.length > 0 ? (
          category.categories.map((subcategory) => (
            <View key={subcategory._id} style={styles.subcategoryItem}>
              <View style={styles.subcategoryContent}>
                {subcategory.image && (
                  <Image source={{ uri: subcategory.image }} style={styles.subcategoryImage} />
                )}
                <View style={styles.subcategoryDetails}>
                  <Text style={styles.subcategoryName}>{subcategory.name}</Text>
                  <Text style={styles.subcategoryEndpoint}>{subcategory.apiEndpoint}</Text>
                </View>
              </View>
              <View style={styles.subcategoryActions}>
                <TouchableOpacity
                  onPress={() => openSubcategoryModal(category, subcategory)}
                  style={styles.editButton}
                >
                  <Ionicons name="pencil" size={16} color="#0d9488" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteSubcategory(category._id, subcategory._id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash" size={16} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noSubcategories}>No subcategories added yet</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#ffffff', '#e6fffa']} style={styles.header}>
        <Text style={styles.headerTitle}>Category Management</Text>
        <TouchableOpacity
          onPress={() => openCategoryModal()}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#0d9488" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
          </View>
        ) : categories.length > 0 ? (
          categories.map(renderCategoryCard)
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="category" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No categories found</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add your first category</Text>
          </View>
        )}
      </ScrollView>

      {/* Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Edit Category' : 'Add Category'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={categoryForm.title}
                  onChangeText={(text) => setCategoryForm({ ...categoryForm, title: text })}
                  placeholder="Enter category title"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category Icon</Text>
                <TouchableOpacity
                  onPress={() => pickImage('category')}
                  style={styles.imagePickerButton}
                >
                  {categoryForm.icon ? (
                    <Image source={{ uri: categoryForm.icon.uri }} style={styles.selectedImage} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="camera" size={40} color="#999" />
                      <Text style={styles.imagePickerText}>Tap to select icon</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleCategorySubmit}
                style={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editMode ? 'Update Category' : 'Create Category'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Subcategory Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={subModalVisible}
        onRequestClose={() => setSubModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Edit Subcategory' : 'Add Subcategory'}
              </Text>
              <TouchableOpacity
                onPress={() => setSubModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subcategory Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={subcategoryForm.name}
                  onChangeText={(text) => setSubcategoryForm({ ...subcategoryForm, name: text })}
                  placeholder="Enter subcategory name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>API Endpoint *</Text>
                <TextInput
                  style={styles.textInput}
                  value={subcategoryForm.apiEndpoint}
                  onChangeText={(text) => setSubcategoryForm({ ...subcategoryForm, apiEndpoint: text })}
                  placeholder="Enter API endpoint"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subcategory Image</Text>
                <TouchableOpacity
                  onPress={() => pickImage('subcategory')}
                  style={styles.imagePickerButton}
                >
                  {subcategoryForm.image ? (
                    <Image source={{ uri: subcategoryForm.image.uri }} style={styles.selectedImage} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="camera" size={40} color="#999" />
                      <Text style={styles.imagePickerText}>Tap to select image</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleSubcategorySubmit}
                style={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editMode ? 'Update Subcategory' : 'Add Subcategory'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdfa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#b2f5ea',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d9488',
  },
  addButton: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryHeader: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  categoryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
  },
  subcategoriesContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  subcategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subcategoryHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addSubButton: {
    padding: 4,
  },
  subcategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0d9488',
  },
  subcategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subcategoryImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  subcategoryDetails: {
    flex: 1,
  },
  subcategoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  subcategoryEndpoint: {
    fontSize: 12,
    color: '#666',
  },
  subcategoryActions: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
  },
  noSubcategories: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#b2f5ea',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: '#b2f5ea',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdfa',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePickerText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#0d9488',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CategoryManagementScreen;