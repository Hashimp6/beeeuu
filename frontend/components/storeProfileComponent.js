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
import { SERVER_URL } from "../config";

const StoreProfileComponent = ({ user }) => {
  const navigation = useNavigation();
  const [store, setStore] = useState(null);
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
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
          const userData = await AsyncStorage.getItem('user');
          if (userData !== null) {
            const parsedUser = JSON.parse(userData);
            const response = await axios.get(`${SERVER_URL}/stores/user/${parsedUser._id}`);

            setStore(response.data)
            
      
          }
        } catch (error) {
          console.error('Failed to load user:', error);
        }
      };
  
      fetchSeller();
    if (user) {
      // In a real app, you would make an API call to get store data
      // For now, we'll use dummy data
      const dummyStore =  {
        storeName: "Your Store",
        description: "Professional services with a personal touch",
        place: "123 Main St, City, State",
        category: "Professional Services",
        phone: "+1 (555) 123-4567",
        profileImage: null,
        openingHours: "9:00 AM - 6:00 PM",
        rating: 4.8,
        reviews: 24,
      };
      setStore(dummyStore);
      setEditData({
        storeName: dummyStore.storeName,
        description: dummyStore.description,
        place: dummyStore.place,
        category: dummyStore.category,
        phone: dummyStore.phone,
      });
    }

    // Fetch appointment stats
    // In a real app, you would make an API call
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

          <Text style={styles.storeName}>{store.storeName}</Text>
          <Text style={styles.storeCategory}>{store.category}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#f39c12" />
            <Text style={styles.ratingText}>
              {store.rating} ({store.reviews} reviews)
            </Text>
          </View>
          <Text style={styles.storeCategory}>{store.place}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.pendingAppointments}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stats.completedAppointments}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>${stats.totalRevenue}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editStoreButton} onPress={handleEditStore}>
            <Icon name="edit" size={16} color="#fff" />
            <Text style={styles.editStoreButtonText}>Edit Store Details</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Appointment Management */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="event-note" size={22} color="#155366"/>
          <Text style={styles.sectionTitle}>Appointment Management</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.appointmentOption}
            onPress={() => navigation.navigate("StoreAppointments", { status: "pending" })}
          >
            <View style={styles.appointmentOptionLeft}>
              <View style={[styles.statusDot, styles.pendingDot]} />
              <Text style={styles.appointmentOptionText}>Pending Appointments</Text>
            </View>
            <View style={styles.appointmentCount}>
              <Text style={styles.appointmentCountText}>
                {stats.pendingAppointments}
              </Text>
              <Icon name="chevron-right" size={20} color="#888" />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.appointmentOption}
            onPress={() => navigation.navigate("StoreAppointments", { status: "today" })}
          >
            <View style={styles.appointmentOptionLeft}>
              <View style={[styles.statusDot, styles.todayDot]} />
              <Text style={styles.appointmentOptionText}>Today's Appointments</Text>
            </View>
            <View style={styles.appointmentCount}>
              <Text style={styles.appointmentCountText}>5</Text>
              <Icon name="chevron-right" size={20} color="#888" />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.appointmentOption}
            onPress={() => navigation.navigate("StoreAppointments", { status: "completed" })}
          >
            <View style={styles.appointmentOptionLeft}>
              <View style={[styles.statusDot, styles.completedDot]} />
              <Text style={styles.appointmentOptionText}>Completed Appointments</Text>
            </View>
            <View style={styles.appointmentCount}>
              <Text style={styles.appointmentCountText}>
                {stats.completedAppointments}
              </Text>
              <Icon name="chevron-right" size={20} color="#888" />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.appointmentOption}
            onPress={() => navigation.navigate("StoreAppointments", { status: "cancelled" })}
          >
            <View style={styles.appointmentOptionLeft}>
              <View style={[styles.statusDot, styles.cancelledDot]} />
              <Text style={styles.appointmentOptionText}>Cancelled Appointments</Text>
            </View>
            <View style={styles.appointmentCount}>
              <Text style={styles.appointmentCountText}>3</Text>
              <Icon name="chevron-right" size={20} color="#888" />
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
            onPress={() => navigation.navigate("StoreHours")}
          >
            <View style={styles.settingOptionLeft}>
              <Icon name="access-time" size={20} color="#3498db" />
              <Text style={styles.settingOptionText}>Business Hours</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingOption}
            onPress={() => navigation.navigate("ServiceManagement")}
          >
            <View style={styles.settingOptionLeft}>
              <Icon name="list-alt" size={20} color="#2ecc71" />
              <Text style={styles.settingOptionText}>Manage Services</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingOption}
            onPress={() => navigation.navigate("PaymentSettings")}
          >
            <View style={styles.settingOptionLeft}>
              <Icon name="payment" size={20} color="#9b59b6" />
              <Text style={styles.settingOptionText}>Payment Settings</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#888" />
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
    backgroundColor: "#3498db",
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

export default StoreProfileComponent;