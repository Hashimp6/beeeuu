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
      console.log('💾 [NOTIFICATION] Settings saved - enabled:', enabled);
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
    console.log('🌐 [NOTIFICATION] Clearing push token from server...');
    
    if (!token || !user) {
      console.log('⚠️ [NOTIFICATION] No auth token or user - cannot clear server token');
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

      console.log('📥 [NOTIFICATION] Server response:', response.data);
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
    console.log('📱 [NOTIFICATION] Starting push notification registration...');
    
    // Check if notifications are disabled
    if (!notificationsEnabled && !forceRegister) {
      console.log('🔕 [NOTIFICATION] Notifications disabled - skipping registration');
      return null;
    }
    
    if (isRegistering) {
      console.log('⏳ [NOTIFICATION] Registration already in progress, returning existing token');
      return expoPushToken;
    }
    
    setIsRegistering(true);
    let pushToken;

    try {
      console.log('🔧 [NOTIFICATION] Platform:', Platform.OS);
      console.log('📱 [NOTIFICATION] Device check:', Device.isDevice ? 'Physical device' : 'Simulator/Emulator');

      if (Platform.OS === 'android') {
        console.log('🤖 [NOTIFICATION] Setting up Android notification channel...');
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
        console.log('✅ [NOTIFICATION] Android notification channel configured');
      }

      if (!Device.isDevice) {
        console.warn('⚠️ [NOTIFICATION] Running on simulator/emulator - push notifications not supported');
        if (forceRegister) {
          Alert.alert('Error', 'Must use physical device for Push Notifications');
        }
        return null;
      }

      console.log('🔍 [NOTIFICATION] Checking existing permissions...');
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('📋 [NOTIFICATION] Existing permission status:', existingStatus);
      
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('❓ [NOTIFICATION] Requesting permissions...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('📋 [NOTIFICATION] Permission request result:', finalStatus);
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

      console.log('✅ [NOTIFICATION] Permissions granted, getting project ID...');
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      console.log('🆔 [NOTIFICATION] Project ID:', projectId || 'NOT FOUND');
      
      if (!projectId) {
        console.error('❌ [NOTIFICATION] Project ID not found in app configuration');
        throw new Error('Project ID not found in app configuration');
      }

      console.log('🎫 [NOTIFICATION] Getting Expo push token...');
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      pushToken = tokenData.data;

      console.log('🎫 [NOTIFICATION] Expo Push Token received:', pushToken);
      setExpoPushToken(pushToken);

      if (token && pushToken) {
        console.log('🔄 [NOTIFICATION] Updating push token on server...');
        await updatePushTokenOnServer(pushToken);
      } else {
        console.warn('⚠️ [NOTIFICATION] Cannot update server - missing auth token or push token');
        console.log('🔑 [NOTIFICATION] Auth token present:', !!token);
        console.log('🎫 [NOTIFICATION] Push token present:', !!pushToken);
      }

      console.log('✅ [NOTIFICATION] Registration completed successfully');
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
      console.log('🏁 [NOTIFICATION] Registration process finished');
    }
  };

  // Update push token on server
  const updatePushTokenOnServer = async (pushToken) => {
    console.log('🌐 [NOTIFICATION] Updating push token on server...');
    console.log('🔗 [NOTIFICATION] Server URL:', SERVER_URL);
    console.log('🎫 [NOTIFICATION] Push token to update:', pushToken);
    console.log('👤 [NOTIFICATION] User ID:', user?._id);
    
    try {
      const payload = { 
        pushToken,
        userId: user._id 
      };
      
      console.log('📤 [NOTIFICATION] Sending request with payload:', payload);
      
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

      console.log('📥 [NOTIFICATION] Server response status:', response.status);
      console.log('📥 [NOTIFICATION] Server response data:', response.data);

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
          console.log('✅ [NOTIFICATION] Navigated to ChatDetailScreen');
        } else {
          console.error('❌ [NOTIFICATION] Navigation not available for chat');
        }
      } 
      else if (data?.type === 'appointment' && data?.appointmentId) {
     
        if (navigation) {
          navigation.navigate('AppointmentDetailScreen', {
            appointmentId: data.appointmentId
          });
          console.log('✅ [NOTIFICATION] Navigated to AppointmentDetailScreen');
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
    console.log('✅ [NOTIFICATION] Listeners setup complete');
    return listeners;
  };

  // Remove notification listeners
  const removeNotificationListeners = () => {
    console.log('🗑️ [NOTIFICATION] Removing notification listeners...');
    
    if (notificationListeners.notificationListener) {
      console.log('🗑️ [NOTIFICATION] Removing notification listener');
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
      console.log('✅ [NOTIFICATION] Local notification scheduled with ID:', notificationId);
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
      console.log('✅ [NOTIFICATION] Test appointment notification scheduled');
    } catch (error) {
      console.error('❌ [NOTIFICATION] Failed to schedule test notification:', error);
    }
  };

  // Clear notification badge
  const clearBadge = async () => {
    console.log('🔢 [NOTIFICATION] Clearing badge count...');
    try {
      await Notifications.setBadgeCountAsync(0);
      console.log('✅ [NOTIFICATION] Badge cleared');
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
      console.log('🚀 [NOTIFICATION] Starting notification registration...');
      registerForPushNotificationsAsync();
    } else {
      console.log('⏸️ [NOTIFICATION] Registration not needed or already in progress');
    }
  }, [user, token, notificationsEnabled, isInitialized]);

  // Cleanup listeners on unmount
  useEffect(() => {
    console.log('🔧 [NOTIFICATION] Setting up cleanup for component unmount');
    return () => {
      console.log('🧹 [NOTIFICATION] Component unmounting - cleaning up listeners');
      removeNotificationListeners();
    };
  }, []);

  // Log state changes
  useEffect(() => {
    console.log('📊 [NOTIFICATION] State update - expoPushToken:', expoPushToken || 'Not set');
  }, [expoPushToken]);

  useEffect(() => {
    console.log('📊 [NOTIFICATION] State update - notification:', notification ? 'New notification received' : 'No notification');
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