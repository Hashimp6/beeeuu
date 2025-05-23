// components/profile/UserProfileComponent.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

const UserProfileComponent = ({ user }) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState("");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const handleSave = () => {
    // Here you would implement the API call to update user details
    console.log("Saving user data:", formData);
    Alert.alert("Success", "Profile updated successfully!");
    setModalVisible(false);
    setEditMode("");
  };

  const renderEditModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit {editMode.charAt(0).toUpperCase() + editMode.slice(1)}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={`Enter your ${editMode}`}
              value={formData[editMode]}
              onChangeText={(text) =>
                setFormData({ ...formData, [editMode]: text })
              }
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

//   const openEditModal = (field) => {
//     setEditMode(field);
//     setModalVisible(true);
//   };

  return (
    <View style={styles.container}>
      {/* Personal Information */}
      {/* <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="person" size={22} color="#3498db" />
          <Text style={styles.sectionTitle}>Personal Information</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.profileItem}>
            <View style={styles.profileItemLeft}>
              <Text style={styles.profileLabel}>Name</Text>
              <Text style={styles.profileValue}>{user?.name || "Not set"}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openEditModal("name")}
            >
              <Icon name="edit" size={18} color="#3498db" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileItem}>
            <View style={styles.profileItemLeft}>
              <Text style={styles.profileLabel}>Email</Text>
              <Text style={styles.profileValue}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileItem}>
            <View style={styles.profileItemLeft}>
              <Text style={styles.profileLabel}>Phone</Text>
              <Text style={styles.profileValue}>
                {user?.phone || "Not set"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openEditModal("phone")}
            >
              <Icon name="edit" size={18} color="#3498db" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileItem}>
            <View style={styles.profileItemLeft}>
              <Text style={styles.profileLabel}>Address</Text>
              <Text style={styles.profileValue}>
                {user?.address || "Not set"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openEditModal("address")}
            >
              <Icon name="edit" size={18} color="#3498db" />
            </TouchableOpacity>
          </View>
        </View>
      </View> */}

      {/* Appointments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="event" size={22} color="#3498db" />
          <Text style={styles.sectionTitle}>My Appointments</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.appointmentOption}
            onPress={() => navigation.navigate("Appointments", { status: "upcoming" })}
          >
            <View style={styles.appointmentOptionLeft}>
              <Icon name="calendar-today" size={20} color="#3498db" />
              <Text style={styles.appointmentOptionText}>Upcoming Appointments</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.appointmentOption}
            onPress={() => navigation.navigate("Appointments", { status: "completed" })}
          >
            <View style={styles.appointmentOptionLeft}>
              <Icon name="check-circle" size={20} color="#2ecc71" />
              <Text style={styles.appointmentOptionText}>Completed Appointments</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.appointmentOption}
            onPress={() => navigation.navigate("Appointments", { status: "cancelled" })}
          >
            <View style={styles.appointmentOptionLeft}>
              <Icon name="cancel" size={20} color="#e74c3c" />
              <Text style={styles.appointmentOptionText}>Cancelled Appointments</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="settings" size={22} color="#3498db" />
          <Text style={styles.sectionTitle}>Settings</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.settingOption}
            onPress={() => navigation.navigate("NotificationSettings")}
          >
            <View style={styles.settingOptionLeft}>
              <Icon name="notifications" size={20} color="#f39c12" />
              <Text style={styles.settingOptionText}>Notification Preferences</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingOption}
            onPress={() => navigation.navigate("PasswordChange")}
          >
            <View style={styles.settingOptionLeft}>
              <Icon name="lock" size={20} color="#9b59b6" />
              <Text style={styles.settingOptionText}>Change Password</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingOption}
            onPress={() => navigation.navigate("AccountSettings")}
          >
            <View style={styles.settingOptionLeft}>
              <Icon name="security" size={20} color="#34495e" />
              <Text style={styles.settingOptionText}>Privacy & Security</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      {renderEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  profileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  profileItemLeft: {
    flex: 1,
  },
  profileLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    color: "#333",
  },
  editButton: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
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
    width: "80%",
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
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
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

export default UserProfileComponent;