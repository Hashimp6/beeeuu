// components/profile/StoreProfileComponent.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { SERVER_URL } from "../config";
import Toast from "react-native-toast-message";

const StoreProfileComponent = () => {
  const navigation = useNavigation();
  const [store, setStore] = useState(null);
  const { user, token, setUser } = useAuth() || {};
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
  });
  const [showSettingsScreen, setShowSettingsScreen] = useState(false);
  const [upiDropdownVisible, setUpiDropdownVisible] = useState(false);
  const [upiModalVisible, setUpiModalVisible] = useState(false);
  const [upiInput, setUpiInput] = useState("");
  const [isUpdatingUpi, setIsUpdatingUpi] = useState(false);
  const [editData, setEditData] = useState({
    storeName: "",
    description: "",
    place: "",
    category: "",
    phone: "",
  });

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        if (user !== null) {
          const response = await axios.get(`${SERVER_URL}/stores/user/${user._id}`);
          setStore(response.data);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };

    fetchSeller();

    setStats({
      pendingAppointments: 12,
      completedAppointments: 38,
      totalRevenue: 2450,
    });
  }, [user]);

  const toggleStoreStatus = async () => {
    try {
      const newStatus = !store.isActive;

      const response = await axios.put(
        `${SERVER_URL}/stores/toggle-active/${store._id}`,
        { isActive: newStatus }
      );

      setStore((prevStore) => ({
        ...prevStore,
        isActive: response.data.isActive,
      }));

      Toast.show({
        type: 'success',
        text1: `Store is now ${response.data.isActive ? "Open" : "Closed"}`,
      });

    } catch (error) {
      console.error("Toggle failed", error);

      Toast.show({
        type: 'error',
        text1: 'Failed to change store status',
        text2: 'Please try again later',
      });
    }
  };

  const handleEditStore = () => {
    navigation.navigate("NewStore", {
      editMode: true,
      storeData: {
        _id: store._id,
        storeName: store.storeName || store.name,
        description: store.description,
        place: store.place,
        category: store.category,
        phone: store.phone,
        profileImage: store.profileImage,
      }
    });
  };

  const handleUpdateUpi = async () => {
    if (!upiInput.trim()) {
      Alert.alert("Error", "Please enter a valid UPI ID");
      return;
    }

    setIsUpdatingUpi(true);
    try {
      const storeId = store._id;
      const response = await axios.put(
        `${SERVER_URL}/upi/${storeId}/upi`,
        { upi: upiInput },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setUser((prevUser) => ({
          ...prevUser,
          upi: upiInput
        }));
        Alert.alert("Success", "UPI ID updated successfully!");
        setUpiModalVisible(false);
        setUpiDropdownVisible(false);
      } else {
        Alert.alert("Error", "Failed to update UPI ID");
      }
    } catch (error) {
      console.error("Error updating UPI:", error);
      Alert.alert("Error", "Failed to update UPI ID. Please try again.");
    } finally {
      setIsUpdatingUpi(false);
    }
  };

  const handleSaveStore = () => {
    setStore({ ...store, ...editData });
    Alert.alert("Success", "Store details updated successfully!");
  };

  // Check if store is restaurant type
  const isRestaurant = store?.category?.toLowerCase() === 'restaurant';

  if (!store) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Store Info Section */}
      <View style={styles.storeInfoCard}>
          <View style={styles.storeHeader}>
            <View style={styles.storeImageSection}>
              {store.profileImage ? (
                <Image
                  source={{ uri: store.profileImage }}
                  style={styles.storeImage}
                />
              ) : (
                <View style={styles.storeInitialAvatar}>
                  <Text style={styles.storeInitialLetter}>
                    {store.storeName ? store.storeName.charAt(0).toUpperCase() : 'S'}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.storeDetailsSection}>
              <Text style={styles.storeName}>{store.storeName}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {store.averageRating || '4.5'} ({store.numberOfRatings || '0'} reviews)
                </Text>
              </View>
              <Text style={styles.storeLocation}>
                <Icon name="place" size={14} color="#666" /> {store.place}
              </Text>
              <Text style={styles.storeCategory}>
                <Icon name="category" size={14} color="#666" /> {store.category}
              </Text>
            </View>

            <View style={styles.statusSection}>
              <TouchableOpacity onPress={toggleStoreStatus} style={styles.statusToggle}>
                <View
                  style={[
                    styles.toggleIndicator,
                    { backgroundColor: store.isActive ? "#2ecc71" : "#e74c3c" },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleCircle,
                      {
                        alignSelf: store.isActive ? "flex-end" : "flex-start",
                        backgroundColor: "#fff",
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.statusLabel, { color: store.isActive ? "#2ecc71" : "#e74c3c" }]}>
                  {store.isActive ? "OPEN" : "CLOSED"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={handleEditStore}>
            <Icon name="edit" size={18} color="#fff" />
            <Text style={styles.editButtonText}>Edit Store Details</Text>
          </TouchableOpacity>
        </View>

      {/* Orders Management Section */}
      <View style={styles.managementSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="shopping-cart" size={24} color="#155366" />
            <Text style={styles.sectionTitle}>Orders Management</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Track and manage your orders</Text>
        </View>

        <View style={styles.cardsGrid}>
          <TouchableOpacity
            style={[styles.managementCard, styles.pendingOrderCard]}
            onPress={() => navigation.navigate("StoreOrders", { status: "pending", storeId: store._id })}
            activeOpacity={0.7}
          >
            <View style={styles.cardIconContainer}>
              <Icon name="access-time" size={28} color="#f39c12" />
            </View>
            <Text style={styles.cardTitle}>Pending Orders</Text>
            <Text style={styles.cardDescription}>Orders waiting for confirmation</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardAction}>View All</Text>
              <Icon name="arrow-forward" size={16} color="#f39c12" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.managementCard, styles.processingOrderCard]}
            onPress={() => navigation.navigate("StoreOrders", { status: "processing", storeId: store._id })}
            activeOpacity={0.7}
          >
            <View style={styles.cardIconContainer}>
              <Icon name="autorenew" size={28} color="#3498db" />
            </View>
            <Text style={styles.cardTitle}>Processing</Text>
            <Text style={styles.cardDescription}>Orders being prepared</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardAction}>View All</Text>
              <Icon name="arrow-forward" size={16} color="#3498db" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.managementCard, styles.deliveredOrderCard]}
            onPress={() => navigation.navigate("StoreOrders", { status: "delivered", storeId: store._id })}
            activeOpacity={0.7}
          >
            <View style={styles.cardIconContainer}>
              <Icon name="check-circle" size={28} color="#2ecc71" />
            </View>
            <Text style={styles.cardTitle}>Delivered</Text>
            <Text style={styles.cardDescription}>Successfully completed orders</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardAction}>View All</Text>
              <Icon name="arrow-forward" size={16} color="#2ecc71" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.managementCard, styles.cancelledOrderCard]}
            onPress={() => navigation.navigate("StoreOrders", { status: "cancelled", storeId: store._id })}
            activeOpacity={0.7}
          >
            <View style={styles.cardIconContainer}>
              <Icon name="cancel" size={28} color="#e74c3c" />
            </View>
            <Text style={styles.cardTitle}>Cancelled</Text>
            <Text style={styles.cardDescription}>Orders that were cancelled</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardAction}>View All</Text>
              <Icon name="arrow-forward" size={16} color="#e74c3c" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Appointments Management Section - Only show for non-restaurants */}
      {!isRestaurant && (
        <View style={styles.managementSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="event" size={24} color="#8e44ad" />
              <Text style={styles.sectionTitle}>Appointments Management</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Schedule and manage appointments</Text>
          </View>

          <View style={styles.cardsGrid}>
            <TouchableOpacity
              style={[styles.managementCard, styles.upcomingAppointmentCard]}
              onPress={() => navigation.navigate("StoreAppointments", { status: "confirmed", storeId: store._id })}
              activeOpacity={0.7}
            >
              <View style={styles.cardIconContainer}>
                <Icon name="schedule" size={28} color="#f39c12" />
              </View>
              <Text style={styles.cardTitle}>Upcoming</Text>
              <Text style={styles.cardDescription}>Scheduled appointments</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardAction}>View All</Text>
                <Icon name="arrow-forward" size={16} color="#f39c12" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.managementCard, styles.pendingAppointmentCard]}
              onPress={() => navigation.navigate("StoreAppointments", { status: "pending", storeId: store._id })}
              activeOpacity={0.7}
            >
              <View style={styles.cardIconContainer}>
                <Icon name="pending" size={28} color="#8e44ad" />
              </View>
              <Text style={styles.cardTitle}>Pending</Text>
              <Text style={styles.cardDescription}>Awaiting confirmation</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardAction}>View All</Text>
                <Icon name="arrow-forward" size={16} color="#8e44ad" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.managementCard, styles.todayAppointmentCard]}
              onPress={() => navigation.navigate("StoreAppointments", { status: "today", storeId: store._id })}
              activeOpacity={0.7}
            >
              <View style={styles.cardIconContainer}>
                <Icon name="today" size={28} color="#3498db" />
              </View>
              <Text style={styles.cardTitle}>Today</Text>
              <Text style={styles.cardDescription}>Today's appointments</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardAction}>View All</Text>
                <Icon name="arrow-forward" size={16} color="#3498db" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.managementCard, styles.completedAppointmentCard]}
              onPress={() => navigation.navigate("StoreAppointments", { status: "completed", storeId: store._id })}
              activeOpacity={0.7}
            >
              <View style={styles.cardIconContainer}>
                <Icon name="done-all" size={28} color="#2ecc71" />
              </View>
              <Text style={styles.cardTitle}>Completed</Text>
              <Text style={styles.cardDescription}>Finished appointments</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardAction}>View All</Text>
                <Icon name="arrow-forward" size={16} color="#2ecc71" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Store Management Section */}
      <View style={styles.managementSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="settings" size={24} color="#34495e" />
            <Text style={styles.sectionTitle}>Store Management</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Manage your store settings and content</Text>
        </View>

        <View style={styles.settingsGrid}>
          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => navigation.navigate("StoreOffers", { store })}
          >
            <Icon name="local-offer" size={24} color="#e74c3c" />
            <Text style={styles.settingTitle}>Offers & Deals</Text>
            <Text style={styles.settingDescription}>Manage promotional offers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => navigation.navigate("storeProduct", { store })}
          >
            <Icon name="inventory" size={24} color="#3498db" />
            <Text style={styles.settingTitle}>Products</Text>
            <Text style={styles.settingDescription}>Manage your inventory</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => navigation.navigate("storeGallery", { store })}
          >
            <Icon name="photo-library" size={24} color="#9b59b6" />
            <Text style={styles.settingTitle}>Gallery</Text>
            <Text style={styles.settingDescription}>Manage store images</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => navigation.navigate("SettingsScreen")}
          >
            <Icon name="notifications" size={24} color="#f39c12" />
            <Text style={styles.settingTitle}>Notifications</Text>
            <Text style={styles.settingDescription}>Manage alerts & updates</Text>
          </TouchableOpacity>
        </View>

        {/* Subscription Card */}
        <TouchableOpacity
          style={styles.subscriptionCard}
          onPress={() => navigation.navigate("SubscriptionPlans", { store })}
        >
          <View style={styles.subscriptionContent}>
            <View style={styles.subscriptionIcon}>
              <Icon name="star" size={28} color="#FFD700" />
            </View>
            <View style={styles.subscriptionText}>
              <Text style={styles.subscriptionTitle}>Premium Subscription</Text>
              <Text style={styles.subscriptionDescription}>
                Unlock advanced features and boost your store visibility
              </Text>
            </View>
            <Icon name="arrow-forward" size={24} color="#155366" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  
  
  // Store Info Card
  storeInfoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  storeImageSection: {
    marginRight: 16,
  },
  storeImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  storeInitialAvatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#155366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeInitialLetter: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  storeDetailsSection: {
    flex: 1,
    paddingRight: 10,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  storeLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeCategory: {
    fontSize: 14,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusSection: {
    alignItems: 'center',
  },
  statusToggle: {
    alignItems: 'center',
  },
  toggleIndicator: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
    marginBottom: 4,
  },
  toggleCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  editButton: {
    backgroundColor: '#155366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#155366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Management Sections
  managementSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
    marginTop: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 34,
  },

  // Cards Grid
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  managementCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderLeftWidth: 4,
  },
  
  // Order Cards
  pendingOrderCard: {
    borderLeftColor: '#f39c12',
    backgroundColor: '#fefcf8',
  },
  processingOrderCard: {
    borderLeftColor: '#3498db',
    backgroundColor: '#f8fbff',
  },
  deliveredOrderCard: {
    borderLeftColor: '#2ecc71',
    backgroundColor: '#f8fff8',
  },
  cancelledOrderCard: {
    borderLeftColor: '#e74c3c',
    backgroundColor: '#fff8f8',
  },
  
  // Appointment Cards
  upcomingAppointmentCard: {
    borderLeftColor: '#f39c12',
    backgroundColor: '#fefcf8',
  },
  pendingAppointmentCard: {
    borderLeftColor: '#8e44ad',
    backgroundColor: '#faf8ff',
  },
  todayAppointmentCard: {
    borderLeftColor: '#3498db',
    backgroundColor: '#f8fbff',
  },
  completedAppointmentCard: {
    borderLeftColor: '#2ecc71',
    backgroundColor: '#f8fff8',
  },

  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 12,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAction: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34495e',
  },

  // Settings Grid
  settingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  settingDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Subscription Card
  subscriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#155366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#e8f4f8',
  },
  subscriptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff8dc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subscriptionText: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155366',
    marginBottom: 4,
  },
  subscriptionDescription: {
    fontSize: 13,
    color: '#7f8c8d',
    lineHeight: 18,
  },

  bottomSpacing: {
    height: 20,
  },
});

export default StoreProfileComponent;