import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Variables to store listeners
let notificationListener = null;
let responseListener = null;

const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      
 } catch (e) {
      token = `${e}`;
      console.error('Error getting push token:', e);
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
};

const setupNotificationListeners = (navigation) => {
  // Listener for notifications received while app is running
  notificationListener = Notifications.addNotificationReceivedListener(notification => {
});

  // Listener for when user taps on notification
  responseListener = Notifications.addNotificationResponseReceivedListener(response => { 
    const { data } = response.notification.request.content;
    
    if (data.type === 'chat' && data.conversationId) {
      // Navigate to chat screen
      navigation.navigate('ChatScreen', { 
        conversationId: data.conversationId,
        otherUserName: data.senderName 
      });
    }
  });
};

const removeNotificationListeners = () => {
  if (notificationListener) {
    Notifications.removeNotificationSubscription(notificationListener);
  }
  if (responseListener) {
    Notifications.removeNotificationSubscription(responseListener);
  }
};

const scheduleLocalNotification = async (title, body, data = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: { seconds: 1 },
  });
};

export {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
  removeNotificationListeners,
  scheduleLocalNotification,
};

