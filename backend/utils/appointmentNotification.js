// utils/appointmentNotifications.js
const User = require('../models/userModel');
const Store = require('../models/storeModel');
const { sendPushNotification } = require('../services/notificationService');

// Send appointment notification to a user
const sendAppointmentNotification = async (userId, title, body, appointmentData) => {
  try {
    // Get user's push tokens
    const user = await User.findById(userId).select('pushTokens username');

    if (!user || !user.pushTokens || user.pushTokens.length === 0) {
      console.log(`No push tokens found for user: ${userId}`);
      return false;
    }

    const results = await Promise.allSettled(
      user.pushTokens.map(token =>
        sendPushNotification(token, title, body, {
          type: 'appointment',
          appointmentId: appointmentData._id,
          action: appointmentData.action || 'view',
        })
      )
    );

    const anySuccess = results.some(
      result => result.status === 'fulfilled' && result.value === true
    );

    if (anySuccess) {
      console.log(`✅ Appointment notification sent to ${user.username}`);
    } else {
      console.log(`❌ Failed to send appointment notification to ${user.username}`);
    }

    return anySuccess;
  } catch (error) {
    console.error('Error sending appointment notification:', error);
    return false;
  }
};


// Get store owner's user ID from store ID
const getStoreOwnerId = async (storeId) => {
  try {
    const store = await Store.findById(storeId).select('owner');
    return store?.owner;
  } catch (error) {
    console.error('Error getting store owner:', error);
    return null;
  }
};

// Notification for new appointment request
const notifyAppointmentRequest = async (appointmentData) => {
  try {
    const storeOwnerId = await getStoreOwnerId(appointmentData.store);
    
    if (!storeOwnerId) {
      console.log('Store owner not found for appointment request notification');
      return false;
    }

    // Get customer name
    const customer = await User.findById(appointmentData.user).select('username');
    const customerName = customer?.username || 'A customer';

    const title = '🔔 New Appointment Request';
    const body = `${customerName} has requested an appointment for ${appointmentData.productName || 'your service'}`;

    return await sendAppointmentNotification(
      storeOwnerId,
      title,
      body,
      { ...appointmentData, action: 'request' }
    );
  } catch (error) {
    console.error('Error sending appointment request notification:', error);
    return false;
  }
};

// Notification for appointment acceptance
const notifyAppointmentAccepted = async (appointmentData) => {
  try {
    // Get store name
    const store = await Store.findById(appointmentData.store).select('name');
    const storeName = store?.name || 'Store';

    const title = '✅ Appointment Confirmed';
    const body = `Your appointment with ${storeName} has been confirmed!`;

    return await sendAppointmentNotification(
      appointmentData.user,
      title,
      body,
      { ...appointmentData, action: 'confirmed' }
    );
  } catch (error) {
    console.error('Error sending appointment acceptance notification:', error);
    return false;
  }
};

// Notification for appointment cancellation
const notifyAppointmentCancelled = async (appointmentData, cancelledBy = 'customer') => {
  try {
    let notifications = [];

    if (cancelledBy === 'customer') {
      // Notify store owner
      const storeOwnerId = await getStoreOwnerId(appointmentData.store);
      if (storeOwnerId) {
        const customer = await User.findById(appointmentData.user).select('username');
        const customerName = customer?.username || 'Customer';
        
        const title = '❌ Appointment Cancelled';
        const body = `${customerName} has cancelled their appointment`;
        
        notifications.push(
          sendAppointmentNotification(
            storeOwnerId,
            title,
            body,
            { ...appointmentData, action: 'cancelled' }
          )
        );
      }
    } else if (cancelledBy === 'store') {
      // Notify customer
      const store = await Store.findById(appointmentData.store).select('name');
      const storeName = store?.name || 'Store';
      
      const title = '❌ Appointment Cancelled';
      const body = `Your appointment with ${storeName} has been cancelled`;
      
      notifications.push(
        sendAppointmentNotification(
          appointmentData.user,
          title,
          body,
          { ...appointmentData, action: 'cancelled' }
        )
      );
    }

    // Send all notifications
    const results = await Promise.allSettled(notifications);
    return results.some(result => result.status === 'fulfilled' && result.value);
  } catch (error) {
    console.error('Error sending appointment cancellation notification:', error);
    return false;
  }
};

// Notification for appointment decline
const notifyAppointmentDeclined = async (appointmentData) => {
  try {
    // Get store name
    const store = await Store.findById(appointmentData.store).select('name');
    const storeName = store?.name || 'Store';

    const title = '❌ Appointment Declined';
    const body = `Your appointment request with ${storeName} has been declined`;

    return await sendAppointmentNotification(
      appointmentData.user,
      title,
      body,
      { ...appointmentData, action: 'declined' }
    );
  } catch (error) {
    console.error('Error sending appointment decline notification:', error);
    return false;
  }
};

// Notification for payment received
const notifyPaymentReceived = async (appointmentData, paymentAmount, paymentType) => {
  try {
    const storeOwnerId = await getStoreOwnerId(appointmentData.store);
    
    if (!storeOwnerId) {
      console.log('Store owner not found for payment notification');
      return false;
    }

    // Get customer name
    const customer = await User.findById(appointmentData.user).select('username');
    const customerName = customer?.username || 'Customer';

    const title = '💰 Payment Received';
    const body = `${customerName} has made a ${paymentType} payment of ₹${paymentAmount}`;

    return await sendAppointmentNotification(
      storeOwnerId,
      title,
      body,
      { ...appointmentData, action: 'payment' }
    );
  } catch (error) {
    console.error('Error sending payment notification:', error);
    return false;
  }
};

module.exports = {
  notifyAppointmentRequest,
  notifyAppointmentAccepted,
  notifyAppointmentCancelled,
  notifyAppointmentDeclined,
  notifyPaymentReceived
};