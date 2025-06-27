// screens/StoreHomeScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { SERVER_URL } from "../../config";
import { useAuth } from "../../context/AuthContext";
import StoreProfileComponent from "../../components/storeProfileComponent";

const { width } = Dimensions.get('window');

const StoreAdminScreen = () => {
  const navigation = useNavigation();
  const { user, token } = useAuth() || {};
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalProducts: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickActions, setQuickActions] = useState([
    {
        id: 1,
        title: "My Appointment",
        icon: "event-available", // changed
        color: "#3498db",
        onPress: () => navigation.navigate("AddProduct"),
      },
      {
        id: 2,
        title: "My Orders",
        icon: "assignment", // changed
        color: "#2ecc71",
        onPress: () => navigation.navigate("ServiceManagement"),
      },
      {
        id: 3,
        title: "My Product & Services",
        icon: "storefront", // changed
        color: "#e67e22",
        onPress: () => navigation.navigate("StoreOrders", { status: "all" }),
      },
      {
        id: 4,
        title: "My Gallery",
        icon: "photo-library", // changed
        color: "#9b59b6",
        onPress: () => navigation.navigate("StoreAnalytics"),
      },
      
  ]);

  useEffect(() => {
    fetchStoreData();
  }, [user]);

  const fetchStoreData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch store information
      const storeResponse = await axios.get(`${SERVER_URL}/stores/user/${user._id}`);
      setStore(storeResponse.data);

      // Fetch dashboard statistics
      await fetchDashboardStats(storeResponse.data._id);
      
      // Fetch recent activity
      await fetchRecentActivity(storeResponse.data._id);
      
    } catch (error) {
      console.error('Failed to load store data:', error);
      Alert.alert("Error", "Failed to load store information");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async (storeId) => {
    try {
      // In a real app, you would make API calls to get actual statistics
      // For now, using dummy data - replace with actual API calls
      const response = await axios.get(`${SERVER_URL}/stores/${storeId}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // If API doesn't exist yet, use dummy data
      setDashboardStats({
        todayAppointments: 5,
        pendingAppointments: 12,
        todayRevenue: 850,
        monthlyRevenue: 15420,
        totalOrders: 45,
        pendingOrders: 8,
        completedOrders: 37,
        totalProducts: 23,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Use dummy data if API fails
      setDashboardStats({
        todayAppointments: 5,
        pendingAppointments: 12,
        todayRevenue: 850,
        monthlyRevenue: 15420,
        totalOrders: 45,
        pendingOrders: 8,
        completedOrders: 37,
        totalProducts: 23,
      });
    }
  };

  const fetchRecentActivity = async (storeId) => {
    try {
      // In a real app, you would make API calls to get recent activity
      // For now, using dummy data
      setRecentActivity([
        {
          id: 1,
          type: "appointment",
          title: "New appointment booked",
          description: "John Doe - Hair Cut",
          time: "2 hours ago",
          icon: "event",
          color: "#3498db",
        },
        {
          id: 2,
          type: "order",
          title: "Order completed",
          description: "Order #12345 - ₹450",
          time: "4 hours ago",
          icon: "shopping-bag",
          color: "#2ecc71",
        },
        {
          id: 3,
          type: "payment",
          title: "Payment received",
          description: "₹850 from Jane Smith",
          time: "6 hours ago",
          icon: "payment",
          color: "#f39c12",
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStoreData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statCardContent}>
        <View style={styles.statCardLeft}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={24} color={color} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickActionCard = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const ActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: item.color + '20' }]}>
        <Icon name={item.icon} size={20} color={item.color} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityDescription}>{item.description}</Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading store dashboard...</Text>
      </View>
    );
  }

  if (!store) {
    return (
      <View style={styles.noStoreContainer}>
        <Icon name="store" size={64} color="#ccc" />
        <Text style={styles.noStoreTitle}>No Store Found</Text>
        <Text style={styles.noStoreDescription}>
          You need to create a store to access this dashboard
        </Text>
        <TouchableOpacity 
          style={styles.createStoreButton}
          onPress={() => navigation.navigate("NewStore")}
        >
          <Text style={styles.createStoreButtonText}>Create Store</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.storeInfo}>
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
            <View style={styles.storeDetails}>
              <Text style={styles.storeName}>{store.name || store.storeName}</Text>
              <Text style={styles.storeCategory}>{store.category}</Text>
              <View style={styles.storeRating}>
                <Icon name="star" size={16} color="#f39c12" />
                <Text style={styles.ratingText}>
                  {store.rating || 4.5} ({store.reviews || 0} reviews)
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate("StoreSettings")}
          >
            <Icon name="settings" size={24} color="#155366" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Today's Appointments"
            value={dashboardStats.todayAppointments}
            icon="event"
            color="#3498db"
            onPress={() => navigation.navigate("StoreAppointments", { status: "today", storeId: store._id })}
          />
          <StatCard
            title="Pending Requests"
            value={dashboardStats.pendingAppointments}
            icon="pending"
            color="#f39c12"
            onPress={() => navigation.navigate("StoreAppointments", { status: "pending", storeId: store._id })}
          />
          <StatCard
            title="Today's Revenue"
            value={`₹${dashboardStats.todayRevenue}`}
            icon="account-balance-wallet"
            color="#2ecc71"
            onPress={() => navigation.navigate("StoreAnalytics")}
          />
          <StatCard
            title="Pending Orders"
            value={dashboardStats.pendingOrders}
            icon="shopping-cart"
            color="#e67e22"
            onPress={() => navigation.navigate("StoreOrders", { status: "pending", storeId: store._id })}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Easy Manage</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.id}
              title={action.title}
              icon={action.icon}
              color={action.color}
              onPress={action.onPress}
            />
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate("ActivityLog")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityContainer}>
          {recentActivity.map((item) => (
            <ActivityItem key={item.id} item={item} />
          ))}
        </View>
      </View>

      {/* Store Profile Component */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Store Management</Text>
        <StoreProfileComponent />
      </View> */}

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  noStoreContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  noStoreTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  noStoreDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  createStoreButton: {
    backgroundColor: "#155366",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createStoreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  storeImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e1e1e1",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: 15,
  },
  storeImage: {
    width: "100%",
    height: "100%",
  },
  storeInitialAvatar: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#155366",
  },
  storeInitialLetter: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  storeDetails: {
    flex: 1,
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
    marginBottom: 4,
  },
  storeRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
  },
  settingsButton: {
    padding: 8,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  viewAllText: {
    fontSize: 14,
    color: "#155366",
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: (width - 50) / 2,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statCardLeft: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: "#666",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: (width - 50) / 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  activityContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: "#999",
  },
  bottomSpacing: {
    height: 20,
  },
});

export default StoreAdminScreen;