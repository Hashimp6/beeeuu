const { Expo } = require('expo-server-sdk');

// Create Expo SDK instance
const expo = new Expo();

const sendPushNotification = async (pushTokens, title, body, data = {}) => {
  try {

    // Ensure pushTokens is an array
    const tokensArray = Array.isArray(pushTokens) ? pushTokens : [pushTokens];
    
    // Filter out invalid tokens
    const validTokens = tokensArray.filter(token => {
      const isValid = token && Expo.isExpoPushToken(token);
      if (!isValid) {
        console.error(`❌ Invalid push token: ${token}`);
      }
      return isValid;
    });

    if (validTokens.length === 0) {
      console.error('❌ No valid push tokens found');
      return false;
    }

 
    // Create messages for all valid tokens
    const messages = validTokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'default',
    }));

  
    // Send notifications in chunks (Expo recommends max 100 per batch)
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
     } catch (error) {
        console.error('❌ Error sending chunk:', error);
      }
    }

 
    // Check for errors in tickets
    const errorTickets = tickets.filter(ticket => ticket.status === 'error');
    if (errorTickets.length > 0) {
      console.error('❌ Some notifications failed:', errorTickets);
    }

    return tickets.length > errorTickets.length; // Return true if at least one succeeded
  } catch (error) {
    console.error('❌ Error in sendPushNotification:', error);
    return false;
  }
};

const sendChatNotification = async (receiverTokens, senderName, messageText, conversationId) => {
  const title = `New message from ${senderName}`;
  const body = messageText.length > 50 ? `${messageText.substring(0, 50)}...` : messageText;
  
  return await sendPushNotification(
    receiverTokens,
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