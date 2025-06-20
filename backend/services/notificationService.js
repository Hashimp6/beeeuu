const { Expo } = require('expo-server-sdk');

// Create Expo SDK instance
const expo = new Expo();

const sendPushNotification = async (pushToken, title, body, data = {}) => {
  try {
    // Check if the push token is valid
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return false;
    }
    
    const message = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
    };

    const ticket = await expo.sendPushNotificationsAsync([message]);
    console.log('Push notification sent:', ticket);
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

const sendChatNotification = async (receiverToken, senderName, messageText, conversationId) => {
  const title = `New message from ${senderName}`;
  const body = messageText.length > 50 ? `${messageText.substring(0, 50)}...` : messageText;
  
  return await sendPushNotification(
    receiverToken,
    title,
    body,
    {
      type: 'chat',
      conversationId,
      senderName
    }
  );
};

module.exports = {
  sendPushNotification,
  sendChatNotification,
};
