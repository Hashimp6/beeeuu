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

const StoreProfileComponent = () => {
  const navigation = useNavigation();
  const [store, setStore] = useState(null);
    const { user, token,setUser } = useAuth() || {};
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
    const fetchSeller= async () => {
        try {

          if (user!== null) {
            const response = await axios.get(`${SERVER_URL}/stores/user/${user._id}`);

            setStore(response.data)
            
      
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

  const handleEditStore = () => {
    // Navigate to NewStore with existing store data
    navigation.navigate("NewStore", {
      editMode: true,
      storeData: {
        _id:store._id,
        storeName: store.storeName || store.name,
        description: store.description,
        place: store.place,
        category: store.category,
        phone: store.phone,
        profileImage: store.profileImage,
        // Add any other fields you want to pre-fill
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
      const storeId=store._id;
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
        // Update user context if needed
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
    // In a real app, you would make an API call to update store data
    console.log("Saving store data:", editData);
    setStore({ ...store, ...editData });
    Alert.alert("Success", "Store details updated successfully!");
   
  };

  if (!store) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading store information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Store Dashboard */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="dashboard" size={22} color="#155366" />
          <Text style={styles.sectionTitle}>Store Dashboard</Text>
        </View>

        <View style={styles.dashboardCard}>
  <View style={styles.cardContainer}>
    {/* Left side - Image */}
    <View style={styles.leftSection}>
      <View style={styles.storeImageContainer}>
        {store.profileImage ? (
          <Image
            source={{ uri: store.profileImage }}
            style={styles.storeImage}
          />
        ) : (
          <View style={styles.storeInitialAvatar}>
            <Text style={styles.storeInitialLetter}>
              {store.name ? store.name.charAt(0).toUpperCase() : 'S'}
            </Text>
          </View>
        )}
      </View>
    </View>

    {/* Right side - Store Details */}
    <View style={styles.rightSection}>
      <View style={styles.storeDetails}>
        <Text style={styles.storeName}>{store.storeName}</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color="#f39c12" />
          <Text style={styles.ratingText}>
            {store.averageRating} ({store.numberOfRatings} reviews)
          </Text>
        </View>
        
        <Text style={styles.storeLocation}>{store.place}</Text>
      </View>
    </View>
  </View>
  
  {/* Full width Edit Button */}
  <TouchableOpacity style={styles.editStoreButton} onPress={handleEditStore}>
    <Icon name="edit" size={16} color="#fff" />
    <Text style={styles.editStoreButtonText}>Edit</Text>
  </TouchableOpacity>
</View>
      </View>


  

<View style={styles.section}>
  <View style={styles.sectionHeader}>
    <Icon name="shopping-cart" size={22} color="#155366"/>
    <Text style={styles.sectionTitle}>Product Management</Text>
  </View>

  {/* Analytics Dashboard Grid */}
  <View style={styles.dashboardGrid}>
    {/* Pending Orders Card */}
    <TouchableOpacity
      style={[styles.analyticsCard, styles.pendingCard]}
      onPress={() => navigation.navigate("StoreOrders", { status: "pending", storeId: store._id })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, styles.pendingIconBg]}>
          <Icon name="hourglass-empty" size={24} color="#f39c12" />
        </View>
        <View style={styles.cardCount}>
          <Text style={styles.countLabel}>Pending</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTitle}>Pending Orders</Text>
        <Icon name="trending-up" size={16} color="#f39c12" />
      </View>
    </TouchableOpacity>

    {/* Processing Orders Card */}
    <TouchableOpacity
      style={[styles.analyticsCard, styles.processingCard]}
      onPress={() => navigation.navigate("StoreOrders", { status: "processing", storeId: store._id })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, styles.processingIconBg]}>
          <Icon name="refresh" size={24} color="#3498db" />
        </View>
        <View style={styles.cardCount}>
          <Text style={styles.countLabel}>Processing</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTitle}>Processing Orders</Text>
        <Icon name="sync" size={16} color="#3498db" />
      </View>
    </TouchableOpacity>

    {/* Delivered Orders Card */}
    <TouchableOpacity
      style={[styles.analyticsCard, styles.deliveredCard]}
      onPress={() => navigation.navigate("StoreOrders", { status: "delivered", storeId: store._id })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, styles.deliveredIconBg]}>
          <Icon name="check-circle" size={24} color="#2ecc71" />
        </View>
        <View style={styles.cardCount}>
          <Text style={styles.countLabel}>Delivered</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTitle}>Delivered Orders</Text>
        <Icon name="trending-up" size={16} color="#2ecc71" />
      </View>
    </TouchableOpacity>

    {/* Cancelled Orders Card */}
    <TouchableOpacity
      style={[styles.analyticsCard, styles.cancelledCard]}
      onPress={() => navigation.navigate("StoreOrders", { status: "cancelled", storeId: store._id })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, styles.cancelledIconBg]}>
          <Icon name="cancel" size={24} color="#e74c3c" />
        </View>
        <View style={styles.cardCount}>
          <Text style={styles.countLabel}>Cancelled</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTitle}>Cancelled Orders</Text>
        <Icon name="trending-down" size={16} color="#e74c3c" />
      </View>
    </TouchableOpacity>
  </View>


</View>


<View style={styles.section}>
  <View style={styles.sectionHeader}>
    <Icon name="event-note" size={22} color="#155366"/>
    <Text style={styles.sectionTitle}>Appointment Management</Text>
  </View>

  {/* Appointment Analytics Dashboard Grid */}
  <View style={styles.dashboardGrid}>
    {/* Coming Appointments Card */}
    <TouchableOpacity
      style={[styles.analyticsCard, styles.comingCard]}
      onPress={() => navigation.navigate("StoreAppointments", { status: "confirmed", storeId: store._id })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, styles.comingIconBg]}>
          <Icon name="schedule" size={24} color="#f39c12" />
        </View>
        <View style={styles.cardCount}>
          <Text style={styles.countLabel}>Coming</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTitle}>Coming Appointments</Text>
        <Icon name="arrow-forward" size={16} color="#f39c12" />
      </View>
    </TouchableOpacity>

    {/* Pending Appointments Card */}
    <TouchableOpacity
      style={[styles.analyticsCard, styles.pendingAppointmentCard]}
      onPress={() => navigation.navigate("StoreAppointments", { status: "pending", storeId: store._id })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, styles.pendingAppointmentIconBg]}>
          <Icon name="pending-actions" size={24} color="#8e44ad" />
        </View>
        <View style={styles.cardCount}>
          <Text style={styles.countLabel}>Pending</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTitle}>Pending Appointments</Text>
        <Icon name="timer" size={16} color="#8e44ad" />
      </View>
    </TouchableOpacity>

    {/* Today's Appointments Card */}
    <TouchableOpacity
      style={[styles.analyticsCard, styles.todayCard]}
      onPress={() => navigation.navigate("StoreAppointments", { status: "today", storeId: store._id })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, styles.todayIconBg]}>
          <Icon name="today" size={24} color="#3498db" />
        </View>
        <View style={styles.cardCount}>
          <Text style={styles.countLabel}>Today</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTitle}>Today's Appointments</Text>
        <Icon name="event-available" size={16} color="#3498db" />
      </View>
    </TouchableOpacity>

    {/* Completed Appointments Card */}
    <TouchableOpacity
      style={[styles.analyticsCard, styles.completedAppointmentCard]}
      onPress={() => navigation.navigate("StoreAppointments", { status: "completed", storeId: store._id })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, styles.completedAppointmentIconBg]}>
          <Icon name="check-circle" size={24} color="#2ecc71" />
        </View>
        <View style={styles.cardCount}>
          <Text style={styles.countLabel}>Completed</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTitle}>Completed Appointments</Text>
        <Icon name="done-all" size={16} color="#2ecc71" />
      </View>
    </TouchableOpacity>

    {/* Cancelled Appointments Card */}
    <TouchableOpacity
      style={[styles.analyticsCard, styles.cancelledAppointmentCard]}
      onPress={() => navigation.navigate("StoreAppointments", { status: "cancelled", storeId: store._id })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, styles.cancelledAppointmentIconBg]}>
          <Icon name="cancel" size={24} color="#e74c3c" />
        </View>
        <View style={styles.cardCount}>
          <Text style={styles.countLabel}>Cancelled</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardTitle}>Cancelled Appointments</Text>
        <Icon name="event-busy" size={16} color="#e74c3c" />
      </View>
    </TouchableOpacity>
  </View>

</View>


      {/* Store Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="settings" size={22} color="#155366" />
          <Text style={styles.sectionTitle}>Store Settings</Text>
        </View>

        <View style={styles.card}>
        <TouchableOpacity
  style={styles.settingOption}
  onPress={() => {
    navigation.navigate("StoreOffers", { store });
  }}
>
            <View style={styles.settingOptionLeft}>
              <Icon name="local-offer" size={20} color="#e74c3c" />
              <Text style={styles.settingOptionText}>Offers</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>

        <TouchableOpacity
            style={styles.settingOption}
            onPress={() =>  navigation.navigate("storeProduct", { store})}
          >
            <View style={styles.settingOptionLeft}>
              <Icon name="shopping-bag" size={20} color="#3498db" />
              <Text style={styles.settingOptionText}>Products</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity
  style={styles.settingOption}
  onPress={() => navigation.navigate("storeGallery", { store })}
>
  <View style={styles.settingOptionLeft}>
    <Icon name="photo-library" size={20} color="#9b59b6" />
    <Text style={styles.settingOptionText}>Gallery</Text>
  </View>
  <Icon name="chevron-right" size={20} color="#888" />
</TouchableOpacity>
        

          <TouchableOpacity
            style={styles.settingOption}
            onPress={() => navigation.navigate("SettingsScreen")}
          >
            <View style={styles.settingOptionLeft}>
              <Icon name="list-alt" size={20} color="#2ecc71" />
              <Text style={styles.settingOptionText}>Manage Notifications</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
  style={styles.settingOption}
  onPress={() => setUpiDropdownVisible(!upiDropdownVisible)}
>
  <View style={styles.settingOptionLeft}>
    <Icon name="payment" size={20} color="#9b59b6" />
    <Text style={styles.settingOptionText}>Payment Settings</Text>
  </View>
  <Icon 
    name={upiDropdownVisible ? "keyboard-arrow-up" : "chevron-right"} 
    size={20} 
    color="#888" 
  />
</TouchableOpacity>
{upiDropdownVisible && (
  <View style={styles.upiDropdown}>
    <View style={styles.upiSection}>
      <Text style={styles.upiLabel}>Current UPI ID:</Text>
      <Text style={styles.currentUpi}>
        {user?.upi || "No UPI ID set"}
      </Text>
      <TouchableOpacity
        style={styles.updateUpiButton}
        onPress={() => setUpiModalVisible(true)}
      >
        <Icon name="edit" size={16} color="#fff" />
        <Text style={styles.updateUpiButtonText}>
          {user?.upi ? "Update UPI" : "Add UPI"}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
)}

{/* UPI Update Modal */}
<Modal
  visible={upiModalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setUpiModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.upiModalContent}>
      <Text style={styles.modalTitle}>Update UPI ID</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>UPI ID</Text>
        <TextInput
          style={styles.input}
          value={upiInput}
          onChangeText={setUpiInput}
          placeholder="Enter your UPI ID (e.g., user@paytm)"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.modalButton, styles.cancelButton]}
          onPress={() => {
            setUpiModalVisible(false);
            setUpiInput(user?.upi || "");
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.modalButton, styles.saveButton]}
          onPress={handleUpdateUpi}
          disabled={isUpdatingUpi}
        >
          <Text style={styles.saveButtonText}>
            {isUpdatingUpi ? "Updating..." : "Update"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

<View style={styles.divider} />

<TouchableOpacity
  style={styles.settingOption}
  onPress={() => navigation.navigate("SubscriptionPlans", { store})}
>
  <View style={styles.settingOptionLeft}>
    <Icon name="autorenew" size={22} color="#27ae60" />
    <Text style={styles.settingOptionText}>Subscription</Text>
  </View>
  <Icon name="chevron-right" size={22} color="#bdc3c7" />
</TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingOption}
            onPress={() => navigation.navigate("StoreAnalytics")}
          >
            <View style={styles.settingOptionLeft}>
              <Icon name="bar-chart" size={20} color="#e67e22" />
              <Text style={styles.settingOptionText}>Analytics & Reports</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
          
        </View>
       
      </View>
      <TouchableOpacity
  style={styles.tempButton}
  onPress={() => navigation.navigate("StoreAdmin")} // 🔁 Change this to your target screen name
>
  <Text style={styles.tempButtonText}>new Store Admin Page</Text>
</TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  dashboardCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  storeImageContainer: {
    height: 90,
    width: 90,
    borderRadius: 45,
    backgroundColor: "#e1e1e1",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 12,
  },
  storeImage: {
    height: "100%",
    width: "100%",
  },
  storeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  storeCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingText: {
    marginLeft: 4,
    color: "#666",
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    height: "100%",
  },
  editStoreButton: {
    flexDirection: "row",
    backgroundColor: "#155366",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  editStoreButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  tempButton: {
  backgroundColor: "#4CAF50",
  paddingVertical: 12,
  marginHorizontal: 16,
  marginBottom: 30,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
},

tempButtonText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "600",
},

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  appointmentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  appointmentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  appointmentOptionText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
  },
  appointmentCount: {
    flexDirection: "row",
    alignItems: "center",
  },
  appointmentCountText: {
    marginRight: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pendingDot: {
    backgroundColor: "#f39c12",
  },
  acceptDot: {
    backgroundColor: "#8e44ad",
  },
  todayDot: {
    backgroundColor: "#3498db",
  },
  completedDot: {
    backgroundColor: "#2ecc71",
  },
  cancelledDot: {
    backgroundColor: "#e74c3c",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  settingOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  settingOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingOptionText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
  },
  upiDropdown: {
    backgroundColor: "#f8f9fa",
    marginHorizontal: 16,
    marginTop: -8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  upiSection: {
    alignItems: "flex-start",
  },
  upiLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  currentUpi: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 12,
  },
  updateUpiButton: {
    flexDirection: "row",
    backgroundColor: "#9b59b6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  updateUpiButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 14,
  },
  upiModalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f2f6",
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: "#155366",
    marginLeft: 8,
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  dashboardCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftSection: {
    alignItems: 'center',
    marginRight: 16,
  },
  storeImageContainer: {
    marginBottom: 12,
  },
  storeImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  storeInitialAvatar: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#155366',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#155366',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  storeInitialLetter: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  editStoreButton: {
    backgroundColor: '#155366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    shadowColor: '#00acc1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
    marginTop:6, // Space between card content and button
    width: '100%', // Full width of the container
  },
  editStoreButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  rightSection: {
    flex: 1,
    justifyContent: 'center',
  },
  storeDetails: {
    gap: 8,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  storeLocation: {
    fontSize: 14,
    color: '#888',
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 2,
  },
  analyticsCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderLeftWidth: 4,
  },
  pendingCard: {
    borderLeftColor: '#f39c12',
    backgroundColor: '#fefcf3',
  },
  processingCard: {
    borderLeftColor: '#3498db',
    backgroundColor: '#f3f9ff',
  },
  deliveredCard: {
    borderLeftColor: '#2ecc71',
    backgroundColor: '#f3fff8',
  },
  cancelledCard: {
    borderLeftColor: '#e74c3c',
    backgroundColor: '#fff3f3',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingIconBg: {
    backgroundColor: '#fef5e7',
  },
  processingIconBg: {
    backgroundColor: '#ebf3fd',
  },
  deliveredIconBg: {
    backgroundColor: '#eafaf1',
  },
  cancelledIconBg: {
    backgroundColor: '#fdeaea',
  },
  cardCount: {
    alignItems: 'flex-end',
  },
  countNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    lineHeight: 32,
  },
  countLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#155366',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e8f4f8',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#155366',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default StoreProfileComponent;