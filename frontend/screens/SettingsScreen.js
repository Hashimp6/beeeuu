// screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNotification } from '../context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const { 
    notificationsEnabled, 
    toggleNotifications, 
    isRegistering,
    expoPushToken,
    registerForPushNotificationsAsync,
    testAppointmentNotification,
    isInitialized
  } = useNotification();

  const [isToggling, setIsToggling] = useState(false);

  const handleNotificationToggle = async (value) => {
    setIsToggling(true);
    try {
      await toggleNotifications(value);
      
      if (value) {
        Alert.alert(
          'Notifications Enabled',
          'Push notifications have been enabled. You will receive appointment and chat notifications.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Notifications Disabled',
          'Push notifications have been disabled. You will not receive any notifications.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
    } finally {
      setIsToggling(false);
    }
  };

  const handleRetryRegistration = async () => {
    try {
      const token = await registerForPushNotificationsAsync(true);
      if (token) {
        Alert.alert('Success', 'Notification registration successful!');
      }
    } catch (error) {
      console.error('Error retrying registration:', error);
      Alert.alert('Error', 'Failed to register for notifications. Please try again.');
    }
  };

  const handleTestNotification = async () => {
    try {
      await testAppointmentNotification();
      Alert.alert('Test Sent', 'A test notification has been scheduled.');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const getNotificationStatus = () => {
    if (!isInitialized) return 'Loading...';
    if (!notificationsEnabled) return 'Disabled';
    if (isRegistering) return 'Registering...';
    if (expoPushToken) return 'Active';
    return 'Registration Failed';
  };

  const getStatusColor = () => {
    if (!isInitialized) return '#999';
    if (!notificationsEnabled) return '#f44336';
    if (isRegistering) return '#ff9800';
    if (expoPushToken) return '#4caf50';
    return '#f44336';
  };

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        {/* Main notification toggle */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications" size={24} color="#007AFF" />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingSubtitle}>
                Receive notifications for appointments and messages
              </Text>
            </View>
          </View>
          <View style={styles.settingRight}>
            {isToggling ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#ccc', true: '#007AFF' }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
                disabled={isToggling}
              />
            )}
          </View>
        </View>

        {/* Notification status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[styles.statusValue, { color: getStatusColor() }]}>
              {getNotificationStatus()}
            </Text>
          </View>
          
          {expoPushToken && (
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Token:</Text>
              <Text style={styles.tokenText} numberOfLines={1} ellipsizeMode="middle">
                {expoPushToken}
              </Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          {notificationsEnabled && !expoPushToken && !isRegistering && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetryRegistration}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Retry Registration</Text>
            </TouchableOpacity>
          )}

          {notificationsEnabled && expoPushToken && (
            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestNotification}
            >
              <Ionicons name="send" size={20} color="#007AFF" />
              <Text style={styles.testButtonText}>Send Test Notification</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Additional settings can be added here */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Notifications</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            • Appointment notifications: Get notified when you receive appointment requests or updates
          </Text>
          <Text style={styles.infoText}>
            • Chat notifications: Get notified when you receive new messages
          </Text>
          <Text style={styles.infoText}>
            • You can disable notifications at any time from this screen
          </Text>
          <Text style={styles.infoText}>
            • Some features may require notifications to work properly
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingRight: {
    marginLeft: 15,
  },
  statusContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    width: 60,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    flex: 1,
  },
  buttonContainer: {
    marginTop: 15,
    gap: 10,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  testButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  infoContainer: {
    paddingTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default SettingsScreen;