// context/NotificationContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import axios from 'axios';
import { SERVER_URL } from '../config';
import { useAuth } from './AuthContext';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const NotificationContext = createContext({});

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(null);
  const [notificationListeners, setNotificationListeners] = useState({});
  const [isRegistering, setIsRegistering] = useState(false);
  const { user, token } = useAuth();

  // Register for push notifications
  const registerForPushNotificationsAsync = async () => {
    if (isRegistering) return expoPushToken;
    
    setIsRegistering(true);
    let pushToken;

    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      if (!Device.isDevice) {
        Alert.alert('Error', 'Must use physical device for Push Notifications');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Push notifications are disabled. You can enable them in settings.');
        return null;
      }

      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found in app configuration');
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      pushToken = tokenData.data;

      console.log('Expo Push Token:', pushToken);
      setExpoPushToken(pushToken);

      if (token && pushToken) {
        await updatePushTokenOnServer(pushToken);
      }

      return pushToken;

    } catch (error) {
      console.error('Error registering for push notifications:', error);
      Alert.alert('Notification Error', 'Failed to register for push notifications');
      return null;
    } finally {
      setIsRegistering(false);
    }
  };

  // Update push token on server
  const updatePushTokenOnServer = async (pushToken) => {
    try {
      const response = await axios.put(
        `${SERVER_URL}/notifications/update-push-token`,
        { pushToken },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        console.log('Push token updated on server successfully');
      }
    } catch (error) {
      console.error('Error updating push token on server:', error);
    }
  };

  // Setup notification listeners
  const setupNotificationListeners = (navigation) => {
    removeNotificationListeners();

    // Listener for notifications received while app is running
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      setNotification(notification);
    });

    // Listener for when user taps on notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      
      const { data } = response.notification.request.content;
      
      // Handle different notification types
      if (data?.type === 'chat' && data?.conversationId) {
        navigation.navigate('ChatDetailScreen', {
          conversationId: data.conversationId,
          otherUser: { 
            username: data.senderName 
          }
        });
      } 
      else if (data?.type === 'appointment' && data?.appointmentId) {
        // Navigate to appointment details or appointments list
        navigation.navigate('AppointmentDetailScreen', {
          appointmentId: data.appointmentId
        });
        // Alternative: Navigate to appointments list
        // navigation.navigate('AppointmentsScreen', { 
        //   highlightAppointment: data.appointmentId 
        // });
      }
    });

    const listeners = {
      notificationListener,
      responseListener
    };

    setNotificationListeners(listeners);
    return listeners;
  };

  // Remove notification listeners
  const removeNotificationListeners = () => {
    if (notificationListeners.notificationListener) {
      Notifications.removeNotificationSubscription(notificationListeners.notificationListener);
    }
    if (notificationListeners.responseListener) {
      Notifications.removeNotificationSubscription(notificationListeners.responseListener);
    }
    setNotificationListeners({});
  };

  // Schedule local notification (for testing)
  const scheduleLocalNotification = async (title, body, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  };

  // Test appointment notification
  const testAppointmentNotification = async () => {
    await scheduleLocalNotification(
      '🔔 New Appointment Request',
      'John Doe has requested an appointment for Hair Cut',
      { 
        type: 'appointment', 
        appointmentId: 'test123',
        action: 'request' 
      }
    );
  };

  // Clear notification badge
  const clearBadge = async () => {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  };

  // Initialize notifications when user is authenticated
  useEffect(() => {
    if (user && token && !expoPushToken && !isRegistering) {
      registerForPushNotificationsAsync();
    }
  }, [user, token]);

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      removeNotificationListeners();
    };
  }, []);

  const value = {
    expoPushToken,
    notification,
    isRegistering,
    registerForPushNotificationsAsync,
    setupNotificationListeners,
    removeNotificationListeners,
    scheduleLocalNotification,
    updatePushTokenOnServer,
    clearBadge,
    testAppointmentNotification, // For testing
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};