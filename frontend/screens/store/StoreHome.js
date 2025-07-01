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
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { SERVER_URL } from "../../config";
import { useAuth } from "../../context/AuthContext";
import PaymentConfirmationComponent from "../../components/PaymentConfirmationComponent";

const { width } = Dimensions.get('window');

const StoreAdminScreen= () => {
  const navigation = useNavigation();
  const [store, setStore] = useState(null);
  const { user, token, setUser } = useAuth() || {};
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
  });
  const [upiDropdownVisible, setUpiDropdownVisible] = useState(false);
  const [upiModalVisible, setUpiModalVisible] = useState(false);
  const [upiInput, setUpiInput] = useState("");
  const [isUpdatingUpi, setIsUpdatingUpi] = useState(false);
  const [selectedView, setSelectedView] = useState(null);

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
    setUpiInput(user?.upi || "");
  }, [user]);

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

  if (!store) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading store information...</Text>
        </View>
      </View>
    );
  }

  const appointmentData = [
    { 
      title: "Coming Soon", 
      icon: "schedule", 
      color: "#3498db", 
      status: "confirmed",
      count: 8 
    },
    { 
      title: "Pending", 
      icon: "hourglass-empty", 
      color: "#f39c12", 
      status: "pending",
      count: 12 
    },
    { 
      title: "Today", 
      icon: "today", 
      color: "#9b59b6", 
      status: "today",
      count: 3 
    },
    { 
      title: "Completed", 
      icon: "check-circle", 
      color: "#2ecc71", 
      status: "completed",
      count: 38 
    },
    { 
      title: "Cancelled", 
      icon: "cancel", 
      color: "#e74c3c", 
      status: "cancelled",
      count: 5 
    },
    { 
      title: "Payment Confirmation", 
      icon: "money", 
      color: "#34495e", 
      status: "all",
      count: 66 
    },
  ];

  const orderData = [
    { 
      title: "Pending", 
      icon: "pending", 
      color: "#f39c12", 
      status: "pending" 
    },
   
    { 
      title: "Completed", 
      icon: "check-circle", 
      color: "#2ecc71", 
      status: "completed" 
    },
    { 
      title: "Cancelled", 
      icon: "cancel", 
      color: "#e74c3c", 
      status: "cancelled" 
    },
    { 
        title: "Payment Confirmation", 
        icon: "payment", 
        color: "#3498db", 
        status: "processing" 
      },
  ];

//   return selectedView === 'payment' ? (
//     <PaymentConfirmationComponent storeId={store._id} />
//   ) : (
  
//   );
return selectedView === 'payment' ? (
    <PaymentConfirmationComponent storeId={store._id} />
  ) : (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
    {/* Store Header */}
    <View style={styles.header}>
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
      
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{store.storeName || store.name}</Text>
        <Text style={styles.storeCategory}>{store.category}</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color="#f39c12" />
          <Text style={styles.ratingText}>
            {store.rating || 4.8} ({store.reviews || 24} reviews)
          </Text>
        </View>
        <Text style={styles.storeLocation}>{store.place}</Text>
      </View>
      
      <TouchableOpacity style={styles.editButton} onPress={handleEditStore}>
        <Icon name="edit" size={18} color="#155366" />
      </TouchableOpacity>
    </View>

    {/* Quick Stats */}
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.pendingAppointments}</Text>
        <Text style={styles.statLabel}>Pending</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.completedAppointments}</Text>
        <Text style={styles.statLabel}>Completed</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>₹{stats.totalRevenue}</Text>
        <Text style={styles.statLabel}>Revenue</Text>
      </View>
    </View>

    {/* Appointments Section */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Appointments</Text>
      <View style={styles.gridContainer}>
        {appointmentData.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.gridItem, { backgroundColor: item.color + '15' }]}
            onPress={() => {
              if (item.title === 'Payment Confirmation') {
                setSelectedView('payment');
              } else {
                navigation.navigate("StoreOrders", { 
                  status: item.status, 
                  storeId: store._id 
                });
              }
            }}
            
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Icon name={item.icon} size={24} color="#fff" />
            </View>
            <Text style={styles.gridItemTitle}>{item.title}</Text>
            {/* {item.count && (
              <Text style={[styles.gridItemCount, { color: item.color }]}>
                {item.count}
              </Text>
            )} */}
          </TouchableOpacity>
        ))}
      </View>
    </View>

    {/* Orders Section */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Orders</Text>
      <View style={styles.gridContainer}>
        {orderData.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.gridItem, { backgroundColor: item.color + '15' }]}
            onPress={() => navigation.navigate("StoreOrders", { 
              status: item.status, 
              storeId: store._id 
            })}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Icon name={item.icon} size={24} color="#fff" />
            </View>
            <Text style={styles.gridItemTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

    {/* Management Section */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Management</Text>
      <View style={styles.managementRow}>
        <TouchableOpacity
          style={[styles.managementCard, { backgroundColor: '#3498db15' }]}
          onPress={() => navigation.navigate("storeProduct", { store })}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#3498db' }]}>
            <Icon name="shopping-bag" size={28} color="#fff" />
          </View>
          <Text style={styles.managementCardTitle}>Products</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.managementCard, { backgroundColor: '#9b59b615' }]}
          onPress={() => navigation.navigate("storeGallery", { store })}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#9b59b6' }]}>
            <Icon name="photo-library" size={28} color="#fff" />
          </View>
          <Text style={styles.managementCardTitle}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>

    {/* Payment Settings */}
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.paymentCard}
        onPress={() => setUpiDropdownVisible(!upiDropdownVisible)}
      >
        <View style={styles.paymentHeader}>
          <View style={styles.paymentLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#27ae60' }]}>
              <Icon name="payment" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.paymentTitle}>Payment Settings</Text>
              <Text style={styles.paymentSubtitle}>
                {user?.upi ? `UPI: ${user.upi}` : "Setup UPI for payments"}
              </Text>
            </View>
          </View>
          <Icon 
            name={upiDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={24} 
            color="#666" 
          />
        </View>
        
        {upiDropdownVisible && (
          <View style={styles.paymentDropdown}>
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
        )}
      </TouchableOpacity>
    </View>

    {/* Additional Options */}
    <View style={styles.section}>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate("StoreHours")}
        >
          <Icon name="access-time" size={24} color="#3498db" />
          <Text style={styles.optionText}>Business Hours</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate("ServiceManagement")}
        >
          <Icon name="list-alt" size={24} color="#2ecc71" />
          <Text style={styles.optionText}>Manage Services</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate("StoreAnalytics")}
        >
          <Icon name="bar-chart" size={24} color="#e67e22" />
          <Text style={styles.optionText}>Analytics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate("StoreAdmin")}
        >
          <Icon name="admin-panel-settings" size={24} color="#9b59b6" />
          <Text style={styles.optionText}>Admin Panel</Text>
        </TouchableOpacity>
      </View>
    </View>

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
  },
  loadingText: {
    fontSize: 16,
    color: "#888",
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  storeImageContainer: {
    height: 70,
    width: 70,
    borderRadius: 35,
    backgroundColor: "#e1e1e1",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  storeImage: {
    height: "100%",
    width: "100%",
  },
  storeInitialAvatar: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#155366",
  },
  storeInitialLetter: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  storeInfo: {
    flex: 1,
    marginLeft: 15,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  storeCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: "#666",
    fontSize: 13,
  },
  storeLocation: {
    fontSize: 13,
    color: "#888",
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginTop: 1,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 55) / 2,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  gridItemCount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  managementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  managementCard: {
    width: (width - 55) / 2,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  managementCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  paymentSubtitle: {
    fontSize: 13,
    color: '#666',
    marginLeft: 12,
    marginTop: 2,
  },
  paymentDropdown: {
    marginTop: 15,
    alignItems: 'flex-start',
  },
  updateUpiButton: {
    flexDirection: "row",
    backgroundColor: "#27ae60",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  updateUpiButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 14,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: (width - 55) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 6,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
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
});


export default StoreAdminScreen;