import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';

export class NotificationService {
  // Send local notification when receiving a message
  static async showMessageNotification(message, senderName, conversationId) {
    // Only show notification if app is in background
    if (AppState.currentState === 'background' || AppState.currentState === 'inactive') {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `New message from ${senderName}`,
            body: message.text || 'New message',
            data: { 
              conversationId,
              messageId: message._id,
              type: 'chat_message'
            },
            sound: 'default',
          },
          trigger: null, // Show immediately
        });
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  }

  // Send local notification when sending a message (for confirmation)
  static async showMessageSentNotification(recipientName) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Message Sent',
          body: `Your message to ${recipientName} was delivered`,
          data: { type: 'message_sent' },
        },
        trigger: {
          seconds: 1, // Show after 1 second
        },
      });
    } catch (error) {
      console.error('Error showing sent notification:', error);
    }
  }

  // Cancel all notifications for a specific conversation
  static async cancelConversationNotifications(conversationId) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const notificationsToCancel = scheduledNotifications.filter(
        notification => notification.content.data?.conversationId === conversationId
      );
      
      for (const notification of notificationsToCancel) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }
}