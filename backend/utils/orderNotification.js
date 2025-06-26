// utils/orderNotifications.js
const User = require('../models/userModel');
const Store = require('../models/storeModel');
const { sendPushNotification } = require('../services/notificationService');

// Send order notification to a user
const sendOrderNotification = async (userId, title, body, orderData) => {
  try {
    // Get user's push token
    const user = await User.findById(userId).select('pushToken username');
    
    if (!user || !user.pushToken) {
      console.log(`No push token found for user: ${userId}`);
      return false;
    }

    // Send push notification
    const success = await sendPushNotification(
      user.pushToken,
      title,
      body,
      {
        type: 'order',
        orderId: orderData._id || orderData.orderId,
        action: orderData.action || 'view'
      }
    );

    if (success) {
      console.log(`✅ Order notification sent to ${user.username}`);
    } else {
      console.log(`❌ Failed to send order notification to ${user.username}`);
    }

    return success;
  } catch (error) {
    console.error('Error sending order notification:', error);
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

// Notification for new order (to seller)
const notifyNewOrder = async (orderData) => {
  try {
    const storeOwnerId = await getStoreOwnerId(orderData.sellerId);
    
    if (!storeOwnerId) {
      console.log('Store owner not found for new order notification');
      return false;
    }

    // Get customer name from order data or fetch from user
    let customerName = orderData.customerName;
    if (!customerName && orderData.buyerId) {
      const customer = await User.findById(orderData.buyerId).select('username name');
      customerName = customer?.username || customer?.name || 'A customer';
    }

    const title = '🛒 New Order Received!';
    const body = `${customerName} ordered ${orderData.quantity || 1}x ${orderData.productName} - ₹${orderData.totalAmount}`;

    return await sendOrderNotification(
      storeOwnerId,
      title,
      body,
      { ...orderData, action: 'new_order' }
    );
  } catch (error) {
    console.error('Error sending new order notification:', error);
    return false;
  }
};

// Notification for order confirmation (to buyer)
const notifyOrderConfirmed = async (orderData) => {
  try {
    if (!orderData.buyerId) {
      console.log('Buyer ID not found for order confirmation notification');
      return false;
    }

    // Get store name
    const store = await Store.findById(orderData.sellerId).select('name storeName');
    const storeName = store?.name || store?.storeName || 'Store';

    const title = '✅ Order Confirmed';
    const body = `Your order for ${orderData.productName} has been confirmed by ${storeName}`;

    return await sendOrderNotification(
      orderData.buyerId,
      title,
      body,
      { ...orderData, action: 'confirmed' }
    );
  } catch (error) {
    console.error('Error sending order confirmation notification:', error);
    return false;
  }
};

// Notification for order shipped (to buyer)
const notifyOrderShipped = async (orderData, trackingNumber = null) => {
  try {
    if (!orderData.buyerId) {
      console.log('Buyer ID not found for order shipped notification');
      return false;
    }

    const title = '🚚 Order Shipped';
    let body = `Your order for ${orderData.productName} has been shipped!`;
    
    if (trackingNumber) {
      body += ` Tracking: ${trackingNumber}`;
    }

    return await sendOrderNotification(
      orderData.buyerId,
      title,
      body,
      { ...orderData, action: 'shipped', trackingNumber }
    );
  } catch (error) {
    console.error('Error sending order shipped notification:', error);
    return false;
  }
};

// Notification for order delivered (to both buyer and seller)
const notifyOrderDelivered = async (orderData) => {
  try {
    let notifications = [];

    // Notify buyer
    if (orderData.buyerId) {
      const title = '📦 Order Delivered';
      const body = `Your order for ${orderData.productName} has been delivered successfully!`;
      
      notifications.push(
        sendOrderNotification(
          orderData.buyerId,
          title,
          body,
          { ...orderData, action: 'delivered' }
        )
      );
    }

    // Notify seller
    const storeOwnerId = await getStoreOwnerId(orderData.sellerId);
    if (storeOwnerId) {
      let customerName = orderData.customerName;
      if (!customerName && orderData.buyerId) {
        const customer = await User.findById(orderData.buyerId).select('username name');
        customerName = customer?.username || customer?.name || 'Customer';
      }

      const title = '✅ Order Delivered';
      const body = `Order for ${customerName} (${orderData.productName}) has been delivered`;
      
      notifications.push(
        sendOrderNotification(
          storeOwnerId,
          title,
          body,
          { ...orderData, action: 'delivered' }
        )
      );
    }

    // Send all notifications
    const results = await Promise.allSettled(notifications);
    return results.some(result => result.status === 'fulfilled' && result.value);
  } catch (error) {
    console.error('Error sending order delivered notifications:', error);
    return false;
  }
};

// Notification for order cancellation
const notifyOrderCancelled = async (orderData, cancelledBy = 'buyer') => {
  try {
    let notifications = [];

    if (cancelledBy === 'buyer') {
      // Notify seller
      const storeOwnerId = await getStoreOwnerId(orderData.sellerId);
      if (storeOwnerId) {
        let customerName = orderData.customerName;
        if (!customerName && orderData.buyerId) {
          const customer = await User.findById(orderData.buyerId).select('username name');
          customerName = customer?.username || customer?.name || 'Customer';
        }
        
        const title = '❌ Order Cancelled';
        const body = `${customerName} has cancelled their order for ${orderData.productName}`;
        
        notifications.push(
          sendOrderNotification(
            storeOwnerId,
            title,
            body,
            { ...orderData, action: 'cancelled' }
          )
        );
      }
    } else if (cancelledBy === 'seller') {
      // Notify buyer
      if (orderData.buyerId) {
        const store = await Store.findById(orderData.sellerId).select('name storeName');
        const storeName = store?.name || store?.storeName || 'Store';
        
        const title = '❌ Order Cancelled';
        const body = `Your order for ${orderData.productName} has been cancelled by ${storeName}`;
        
        notifications.push(
          sendOrderNotification(
            orderData.buyerId,
            title,
            body,
            { ...orderData, action: 'cancelled' }
          )
        );
      }
    }

    // Send all notifications
    const results = await Promise.allSettled(notifications);
    return results.some(result => result.status === 'fulfilled' && result.value);
  } catch (error) {
    console.error('Error sending order cancellation notifications:', error);
    return false;
  }
};

// Notification for payment received (to seller)
const notifyPaymentReceived = async (orderData) => {
  try {
    const storeOwnerId = await getStoreOwnerId(orderData.sellerId);
    
    if (!storeOwnerId) {
      console.log('Store owner not found for payment notification');
      return false;
    }

    let customerName = orderData.customerName;
    if (!customerName && orderData.buyerId) {
      const customer = await User.findById(orderData.buyerId).select('username name');
      customerName = customer?.username || customer?.name || 'Customer';
    }

    const title = '💰 Payment Received';
    const body = `Payment of ₹${orderData.totalAmount} received from ${customerName} for ${orderData.productName}`;

    return await sendOrderNotification(
      storeOwnerId,
      title,
      body,
      { ...orderData, action: 'payment_received' }
    );
  } catch (error) {
    console.error('Error sending payment notification:', error);
    return false;
  }
};

// Notification for payment failed (to buyer)
const notifyPaymentFailed = async (orderData) => {
  try {
    if (!orderData.buyerId) {
      console.log('Buyer ID not found for payment failed notification');
      return false;
    }

    const title = '❌ Payment Failed';
    const body = `Payment for your order (${orderData.productName}) failed. Please try again.`;

    return await sendOrderNotification(
      orderData.buyerId,
      title,
      body,
      { ...orderData, action: 'payment_failed' }
    );
  } catch (error) {
    console.error('Error sending payment failed notification:', error);
    return false;
  }
};

module.exports = {
  notifyNewOrder,
  notifyOrderConfirmed,
  notifyOrderShipped,
  notifyOrderDelivered,  
  notifyOrderCancelled,
  notifyPaymentReceived,
  notifyPaymentFailed
};