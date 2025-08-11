// components/profile/UserProfileComponent.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
  ScrollView,
  Dimensions,
  StatusBar,
} from "react-native";
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from "../context/AuthContext"; // Import useAuth hook
import { SERVER_URL } from "../config";

const { width } = Dimensions.get('window');

const UserProfileComponent = ({ store }) => {
  const { user, setUser } = useAuth() || {}; // Fixed: Use setUser instead of setuser
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [showPolicyDropdown, setShowPolicyDropdown] = useState(false);
  const [userInfo, setUserInfo] = useState(user); // Local state for user data
  const [formData, setFormData] = useState({
    userId: user?._id || "",
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  // Validation states
  const [validation, setValidation] = useState({
    phone: { isValid: true, message: '' },
    address: { isValid: true, message: '' }
  });

  // Update local user info when user prop changes
  useEffect(() => {
    if (user) {
      setUserInfo(user);
      setFormData({
        userId: user._id || "",
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  // Validation functions - now allow empty values
  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10}$/;
    const trimmedPhone = phone.trim();
    
    // Allow empty phone (optional field)
    if (!trimmedPhone) {
      return { isValid: true, message: '' };
    }
    
    if (trimmedPhone.length < 10) {
      return { isValid: false, message: 'Phone number must be at least 10 digits' };
    }
    if (!phoneRegex.test(trimmedPhone)) {
      return { isValid: false, message: 'Please enter a valid phone number' };
    }
    return { isValid: true, message: '' };
  };

  const validateAddress = (address) => {
    const trimmedAddress = address.trim();
    
    // Allow empty address (optional field)
    if (!trimmedAddress) {
      return { isValid: true, message: '' };
    }
    
    if (trimmedAddress.length < 10) {
      return { isValid: false, message: 'Address must be at least 10 characters' };
    }
    if (trimmedAddress.length > 200) {
      return { isValid: false, message: 'Address must be less than 200 characters' };
    }
    return { isValid: true, message: '' };
  };

  // Handle input changes with validation
  const handlePhoneChange = (text) => {
    setFormData({ ...formData, phone: text });
    const phoneValidation = validatePhone(text);
    setValidation(prev => ({
      ...prev,
      phone: phoneValidation
    }));
  };

  const handleAddressChange = (text) => {
    setFormData({ ...formData, address: text });
    const addressValidation = validateAddress(text);
    setValidation(prev => ({
      ...prev,
      address: addressValidation
    }));
  };

  

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const openEditModal = () => {
    // Reset validation when opening modal
    setValidation({
      phone: { isValid: true, message: '' },
      address: { isValid: true, message: '' }
    });
    
    // Set current user data in form when opening modal
    setFormData({
      userId: userInfo?._id || "",
      name: userInfo?.name || "",
      phone: userInfo?.phone || "",
      address: userInfo?.address || "",
    });
    
    setModalVisible(true);
  };

  const handleSave = async () => {
    // Validate all fields before saving
    const phoneValidation = validatePhone(formData.phone);
    const addressValidation = validateAddress(formData.address);

    setValidation({
      phone: phoneValidation,
      address: addressValidation
    });

    // Check if all fields are valid
    if (!phoneValidation.isValid || !addressValidation.isValid) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fix the errors before saving'
      });
      return;
    }

    // Check if at least one field has content
    const trimmedPhone = formData.phone.trim();
    const trimmedAddress = formData.address.trim();
    
    if (!trimmedPhone && !trimmedAddress) {
      Toast.show({
        type: 'error',
        text1: 'No Changes',
        text2: 'Please enter at least phone number or address'
      });
      return;
    }

    try {
      
      
      // Prepare data for update - only send non-empty fields
      const updateData = {
        userId: formData.userId,
      };
      
      if (trimmedPhone) {
        updateData.phone = trimmedPhone;
      }
      
      if (trimmedAddress) {
        updateData.address = trimmedAddress;
      }
  
      
      const response = await axios.put(`${SERVER_URL}/users/change-address`, updateData);
     
  
      if (response.status === 200) {
        // Fixed: Get the user data from the correct response structure
        const updatedUserFromResponse = response.data.user;
        
        if (updatedUserFromResponse) {
          // Update local user info immediately
          setUserInfo(updatedUserFromResponse);
          
          // Fixed: Use setUser instead of setuser with better error handling
          if (setUser && typeof setUser === 'function') {
            setUser(updatedUserFromResponse);
          } else {
            console.warn("setUser function not available from useAuth - check AuthContext");
          }
          
          // Update form data to reflect the changes
          setFormData({
            userId: updatedUserFromResponse._id || "",
            name: updatedUserFromResponse.name || updatedUserFromResponse.username || "",
            phone: updatedUserFromResponse.phone || "",
            address: updatedUserFromResponse.address || "",
          });
          
          Toast.show({
            type: 'success',
            text1: 'Profile Updated',
            text2: 'Your contact details have been updated successfully! 🎉'
          });
          
          setModalVisible(false);
          
          // Removed: Background refetch that might overwrite the changes
          // The update response already contains the latest data
          
        } else {
          console.error("No user data in update response");
          Toast.show({
            type: 'error',
            text1: 'Update Failed',
            text2: 'Invalid response from server'
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: 'Please try again later'
        });
      }
  
    } catch (error) {
      console.error("Save error:", error);
      console.error("Save error details:", error.response?.data || error.message);
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Could not update profile'
      });
    }
  };

  const GlassmorphismCard = ({ children, style }) => (
    <View style={[styles.glassmorphismCard, style]}>
      {children}
    </View>
  );

  const renderEditModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.modalContent,
            {
              transform: [{ scale: modalVisible ? 1 : 0.8 }],
              opacity: modalVisible ? 1 : 0,
            }
          ]}>
            <LinearGradient
              colors={['#14b8a6', '#0f766e']}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Edit Contact Details</Text>
              <Text style={styles.modalSubtitle}>Update your phone number or address</Text>
            </LinearGradient>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
                <TextInput
                  style={[
                    styles.input,
                    !validation.phone.isValid && styles.inputError
                  ]}
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChangeText={handlePhoneChange}
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                />
                {!validation.phone.isValid && (
                  <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={16} color="#ef4444" />
                    <Text style={styles.errorText}>{validation.phone.message}</Text>
                  </View>
                )}
                {validation.phone.isValid && formData.phone.trim() && (
                  <View style={styles.successContainer}>
                    <Icon name="check-circle-outline" size={16} color="#10b981" />
                    <Text style={styles.successText}>Valid phone number</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address (Optional)</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    !validation.address.isValid && styles.inputError
                  ]}
                  placeholder="Enter your address"
                  value={formData.address}
                  onChangeText={handleAddressChange}
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={3}
                />
                {!validation.address.isValid && (
                  <View style={styles.errorContainer}>
                    <Icon name="error-outline" size={16} color="#ef4444" />
                    <Text style={styles.errorText}>{validation.address.message}</Text>
                  </View>
                )}
                {validation.address.isValid && formData.address.trim() && (
                  <View style={styles.successContainer}>
                    <Icon name="check-circle-outline" size={16} color="#10b981" />
                    <Text style={styles.successText}>Valid address</Text>
                  </View>
                )}
              </View>

              <View style={styles.infoNote}>
                <Icon name="info-outline" size={16} color="#0891b2" />
                <Text style={styles.infoText}>
                  You can update either field or both. At least one field is required.
                </Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton, 
                    styles.saveButton,
                    (!validation.phone.isValid || !validation.address.isValid) && styles.saveButtonDisabled
                  ]}
                  onPress={handleSave}
                  disabled={!validation.phone.isValid || !validation.address.isValid}
                >
                  <LinearGradient
                    colors={
                      (!validation.phone.isValid || !validation.address.isValid) 
                        ? ['#94a3b8', '#64748b'] 
                        : ['#14b8a6', '#0f766e']
                    }
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section with Teal Gradient */}
        <LinearGradient
          colors={['#14b8a6', '#0f766e']}
          style={styles.heroSection}
        >
          <Animated.View 
            style={[
              styles.profileHeaderContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.topRow}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#67e8f9', '#22d3ee']}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 
                     userInfo?.username ? userInfo.username.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </LinearGradient>
                <View style={styles.statusIndicator} />
              </View>
              
              {/* Edit Button */}
              <TouchableOpacity 
                style={styles.editButton}
                onPress={openEditModal}
                activeOpacity={0.8}
              >
                <Icon name="edit" size={20} color="#14b8a6" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.profileName}>
              {userInfo?.username || userInfo?.name || "Your Name"}
            </Text>
            <Text style={styles.profileEmail}>
              {userInfo?.email || "user@example.com"}
            </Text>
          </Animated.View>
          
          <GlassmorphismCard style={styles.sectionCard}>
            <View style={styles.fieldsContainer}>
              
              <View style={styles.fieldCard}>
                <View style={styles.fieldIconWrapper}>
                  <Icon name="phone" size={20} color="#14b8a6" />
                </View>
                <View style={styles.fieldInfo}>
                  <Text style={styles.fieldLabel}>Phone Number</Text>
                  <Text style={styles.fieldValue}>
                    {userInfo?.phone || "Not provided"}
                  </Text>
                </View>
              </View>

              <View style={[styles.fieldCard, styles.lastFieldCard]}>
                <View style={styles.fieldIconWrapper}>
                  <Icon name="location-on" size={20} color="#14b8a6" />
                </View>
                <View style={styles.fieldInfo}>
                  <Text style={styles.fieldLabel}>Address</Text>
                  <Text style={styles.fieldValue}>
                    {userInfo?.address || "Not provided"}
                  </Text>
                </View>
              </View>
            </View>
          </GlassmorphismCard>

        </LinearGradient>

        {/* Profile Information Cards */}
        <View style={styles.contentContainer}>
          
          {/* Action Cards */}
          <GlassmorphismCard style={styles.actionCard}>
            <View style={styles.actionHeader}>
              <LinearGradient
                colors={['#14b8a6', '#0f766e']}
                style={styles.actionIcon}
              >
                <Icon name="calendar-today" size={20} color="#fff" />
              </LinearGradient>
              <Text style={styles.actionTitle}>Appointments & Orders</Text>
            </View>
            
            <View style={styles.actionItems}>
              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => navigation.navigate("UsersAppointments",{ user: userInfo,
                  status: "appointment"})}
              >
                <View style={styles.actionItemLeft}>
                  <View style={[styles.actionDot, { backgroundColor: '#06b6d4' }]} />
                  <Text style={styles.actionItemText}>Appointments</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => navigation.navigate("UsersReservations",{ user: userInfo})}
              >
                <View style={styles.actionItemLeft}>
                  <View style={[styles.actionDot, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.actionItemText}>Reservation</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => navigation.navigate("UsersAppointments",{ user: userInfo,
                  status: "order"})}
              >
                <View style={styles.actionItemLeft}>
                  <View style={[styles.actionDot, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.actionItemText}>Orders</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </GlassmorphismCard>

        
          {/* Settings Card */}
          <GlassmorphismCard style={[styles.actionCard, styles.lastCard]}>
            <View style={styles.actionHeader}>
              <LinearGradient
                colors={['#0891b2', '#0e7490']}
                style={styles.actionIcon}
              >
                <Icon name="settings" size={20} color="#fff" />
              </LinearGradient>
              <Text style={styles.actionTitle}>Settings & Privacy</Text>
            </View>
            
            <View style={styles.actionItems}>
              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => navigation.navigate("SettingsScreen")}
              >
                <View style={styles.actionItemLeft}>
                  <Icon name="notifications" size={18} color="#14b8a6" />
                  <Text style={styles.actionItemText}>Notifications</Text>
                </View>
                <Icon name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity 
  style={styles.actionItem}
  onPress={() => setShowPolicyDropdown(!showPolicyDropdown)}
>
  <View style={styles.actionItemLeft}>
    <Icon name="lock" size={18} color="#14b8a6" />
    <Text style={styles.actionItemText}>T&C and Privacy Policy</Text>
  </View>
  <Icon name="chevron-right" size={20} color="#94a3b8" />
</TouchableOpacity>

{showPolicyDropdown && (
  <View style={styles.dropdown}>
    <TouchableOpacity onPress={() => Linking.openURL('https://www.serchby.com/privacy-policy')}>
      <Text style={styles.dropdownLink}>Privacy Policy</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => Linking.openURL('https://www.serchby.com/terms')}>
      <Text style={styles.dropdownLink}>Terms & Conditions</Text>
    </TouchableOpacity>
  </View>
)}

            </View>
          </GlassmorphismCard>

        </View>
      </ScrollView>

      {renderEditModal()}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileHeaderContainer: {
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
  },
  dropdown: {
    marginLeft: 40,
    marginTop: 4,
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 8,
  },
  
  dropdownLink: {
    fontSize: 14,
    color: '#155366',
    marginBottom: 8,
    textDecorationLine: 'underline',
  }
,  
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  avatarText: {
    color: '#0f766e',
    fontSize: 36,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 35,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#fff',
  },
  editButton: {
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 24,
  },
  contentContainer: {
    padding: 20,
    marginTop: -20,
  },
  glassmorphismCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sectionCard: {
    marginBottom: 20,
  },
  fieldsContainer: {
    gap: 0,
  },
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  lastFieldCard: {
    borderBottomWidth: 0,
  },
  fieldIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  actionCard: {
    marginBottom: 16,
  },
  lastCard: {
    marginBottom: 0,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  actionItems: {
    gap: 0,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  actionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  actionItemText: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  modalBody: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  successText: {
    color: '#10b981',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#0891b2',
  },
  infoText: {
    color: '#0891b2',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    alignItems: 'center',
  },
  saveButton: {
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserProfileComponent;