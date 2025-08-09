// context/NotificationContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { SERVER_URL } from '../config';
import { useAuth } from './AuthContext';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => {
 return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, token } = useAuth();


  // Load notification settings from storage
  const loadNotificationSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem('notificationsEnabled');
      if (enabled !== null) {
        setNotificationsEnabled(JSON.parse(enabled));
   }
    } catch (error) {
      console.error('❌ [NOTIFICATION] Error loading settings:', error);
    }
    setIsInitialized(true);
  };

  // Save notification settings to storage
  const saveNotificationSettings = async (enabled) => {
    try {
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(enabled));
   } catch (error) {
      console.error('❌ [NOTIFICATION] Error saving settings:', error);
    }
  };

  // Toggle notifications on/off
  const toggleNotifications = async (enabled) => {
    setNotificationsEnabled(enabled);
    await saveNotificationSettings(enabled);

    if (enabled) {
      // Re-register for notifications
   await registerForPushNotificationsAsync();
    } else {
    setExpoPushToken('');
      await clearPushTokenFromServer();
      removeNotificationListeners();
    }
  };

  // Clear push token from server
  const clearPushTokenFromServer = async () => {
   
    if (!token || !user) {
     return;
    }

    try {
      const response = await axios.post(
        `${SERVER_URL}/notifications/remove-token`,
        {
          userId: user._id,
          pushToken: expoPushToken,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );
  if (response.data.success) {
        console.log('✅ [NOTIFICATION] Push token cleared from server successfully');
      }
    } catch (error) {
      console.error('❌ [NOTIFICATION] Error clearing token from server:', error);
    }
  };

  // Check if notifications are enabled
  const areNotificationsEnabled = () => {
    return notificationsEnabled;
  };

  // Register for push notifications
  const registerForPushNotificationsAsync = async (forceRegister = false) => {
   
    // Check if notifications are disabled
    if (!notificationsEnabled && !forceRegister) {
  return null;
    }
    
    if (isRegistering) {
     return expoPushToken;
    }
    
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
        console.warn('⚠️ [NOTIFICATION] Running on simulator/emulator - push notifications not supported');
        if (forceRegister) {
          Alert.alert('Error', 'Must use physical device for Push Notifications');
        }
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
     
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
       const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.error('❌ [NOTIFICATION] Permission denied by user');
        if (forceRegister) {
          Alert.alert('Permission Denied', 'Push notifications are disabled. You can enable them in settings.');
        }
        // Disable notifications in our app settings
        await toggleNotifications(false);
        return null;
      }
  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
     
      if (!projectId) {
        console.error('❌ [NOTIFICATION] Project ID not found in app configuration');
        throw new Error('Project ID not found in app configuration');
      }

     const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      pushToken = tokenData.data;

      setExpoPushToken(pushToken);

      if (token && pushToken) {
       await updatePushTokenOnServer(pushToken);
      } else {
        console.warn('⚠️ [NOTIFICATION] Cannot update server - missing auth token or push token');
     }

      return pushToken;

    } catch (error) {
      console.error('❌ [NOTIFICATION] Registration error:', error);
      console.error('📊 [NOTIFICATION] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      if (forceRegister) {
        Alert.alert('Notification Error', 'Failed to register for push notifications. Please try again.');
      }
      return null;
    } finally {
      setIsRegistering(false);
    }
  };

  // Update push token on server
  const updatePushTokenOnServer = async (pushToken) => {

    try {
      const payload = { 
        pushToken,
        userId: user._id 
      };
      
      
      const response = await axios.put(
        `${SERVER_URL}/notifications/update-push-token`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );

    
      if (response.data.success) {
        console.log('✅ [NOTIFICATION] Push token updated on server successfully');
      } else {
        console.warn('⚠️ [NOTIFICATION] Server returned success: false');
      }
    } catch (error) {
      console.error('❌ [NOTIFICATION] Server update error:', error);
      if (error.response) {
        console.error('📥 [NOTIFICATION] Server response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('📡 [NOTIFICATION] No response received:', error.request);
      } else {
        console.error('⚙️ [NOTIFICATION] Request setup error:', error.message);
      }
    }
  };

  // Setup notification listeners
  const setupNotificationListeners = (navigation) => {
    removeNotificationListeners();

    // Listener for notifications received while app is running
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listener for when user taps on notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {

      const { data } = response.notification.request.content;
  
      // Handle different notification types
      if (data?.type === 'chat' && data?.conversationId) {
  
        if (navigation) {
          navigation.navigate('ChatDetailScreen', {
            conversationId: data.conversationId,
            otherUser: { 
              username: data.senderName 
            }
          });
       } else {
          console.error('❌ [NOTIFICATION] Navigation not available for chat');
        }
      } 
      else if (data?.type === 'appointment' && data?.appointmentId) {
     
        if (navigation) {
          navigation.navigate('AppointmentDetailScreen', {
            appointmentId: data.appointmentId
          });
       } else {
          console.error('❌ [NOTIFICATION] Navigation not available for appointment');
        }
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
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: { seconds: 1 },
      });
   return notificationId;
    } catch (error) {
      console.error('❌ [NOTIFICATION] Error scheduling local notification:', error);
      throw error;
    }
  };

  // Test appointment notification
  const testAppointmentNotification = async () => {
  try {
      await scheduleLocalNotification(
        '🔔 New Appointment Request',
        'John Doe has requested an appointment for Hair Cut',
        { 
          type: 'appointment', 
          appointmentId: 'test123',
          action: 'request' 
        }
      );
  } catch (error) {
      console.error('❌ [NOTIFICATION] Failed to schedule test notification:', error);
    }
  };

  // Clear notification badge
  const clearBadge = async () => {
   try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('❌ [NOTIFICATION] Error clearing badge:', error);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    loadNotificationSettings();
  }, []);

  // Initialize notifications when user is authenticated and settings are loaded
  useEffect(() => {

    if (user && token && !expoPushToken && !isRegistering && notificationsEnabled && isInitialized) {
   registerForPushNotificationsAsync();
    } else {
      console.log('⏸️ [NOTIFICATION] Registration not needed or already in progress');
    }
  }, [user, token, notificationsEnabled, isInitialized]);

  // Cleanup listeners on unmount
  useEffect(() => {
  return () => {
      removeNotificationListeners();
    };
  }, []);

  // Log state changes
  useEffect(() => {
    console.log('📊 [NOTIFICATION] State update - expoPushToken:');
  }, [expoPushToken]);

  useEffect(() => {
    console.log('📊 [NOTIFICATION] State update - notification:');
  }, [notification]);

  useEffect(() => {
    console.log('📊 [NOTIFICATION] State update - isRegistering:', isRegistering);
  }, [isRegistering]);

  useEffect(() => {
    console.log('📊 [NOTIFICATION] State update - notificationsEnabled:', notificationsEnabled);
  }, [notificationsEnabled]);

  const value = {
    expoPushToken,
    notification,
    isRegistering,
    notificationsEnabled,
    isInitialized,
    registerForPushNotificationsAsync,
    setupNotificationListeners,
    removeNotificationListeners,
    scheduleLocalNotification,
    updatePushTokenOnServer,
    clearBadge,
    testAppointmentNotification,
    toggleNotifications,
    areNotificationsEnabled,
    clearPushTokenFromServer,
  };

  console.log('🎁 [NOTIFICATION] Providing context value to children');
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};