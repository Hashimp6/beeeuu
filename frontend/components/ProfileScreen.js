// components/ProfileScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import UserProfileComponent from "./userProfileComponent";
import StoreProfileComponent from "./storeProfileComponent";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
  const { logout } = useAuth();
  const navigation = useNavigation();
  const [user, setUser] = useState(null); 
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData !== null) {
          const parsedUser = JSON.parse(userData);
          
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleBecomeSeller = () => {
    navigation.navigate("NewStore");
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  const isSeller = user?.role === "seller";

  return (
    
    <SafeAreaView style={styles.container}>
     

      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        { !isSeller ? (
          <UserProfileComponent user={user} />
        ) : (
          <StoreProfileComponent user={user} />
        )}

        {!isSeller && (
          <TouchableOpacity
            style={styles.becomeSellerButton}
            onPress={handleBecomeSeller}
          >
            <Icon name="add-business" size={20} color="#fff" />
            <Text style={styles.buttonText}>Become a Seller</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#fff" />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: "#e1e1e1",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImage: {
    height: "100%",
    width: "100%",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: "#3498db",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  roleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#3498db",
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#3498db",
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  becomeSellerButton: {
    marginTop: 16,
    backgroundColor: "#155366",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutButton: {
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: "#000000",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
});

export default ProfileScreen;