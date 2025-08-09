const Order = require("../models/orderModel");
const Store = require("../models/storeModel");
const mongoose = require("mongoose");

const { notifyNewOrder, notifyOrderConfirmed,
  notifyOrderShipped,
  notifyOrderDelivered,
  notifyOrderCancelled,
  notifyPaymentReceived,
  notifyPaymentFailed, 
  notifyOrderReady} = require("../utils/orderNotification");




const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    // Validate required fields
    const requiredFields = ['products', 'sellerId', 'buyerId', 'customerName', 'deliveryAddress', 'phoneNumber'];
    for (let field of requiredFields) {
      if (!orderData[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }
    
    // Validate products array
    if (!Array.isArray(orderData.products) || orderData.products.length === 0) {
      return res.status(400).json({ message: 'Products must be a non-empty array' });
    }
    
    // Validate each product in the array
    for (let i = 0; i < orderData.products.length; i++) {
      const product = orderData.products[i];
      const requiredProductFields = ['productId', 'productName', 'quantity', 'unitPrice'];
      
      for (let field of requiredProductFields) {
        if (!product[field]) {
          return res.status(400).json({ 
            message: `${field} is required for product at index ${i}` 
          });
        }
      }
      
      // Validate quantity and unitPrice
      if (product.quantity <= 0) {
        return res.status(400).json({ 
          message: `Quantity must be greater than 0 for product at index ${i}` 
        });
      }
      
      if (product.unitPrice < 0) {
        return res.status(400).json({ 
          message: `Unit price cannot be negative for product at index ${i}` 
        });
      }
    }
    
    // Validate transactionId for non-COD payments
    if (orderData.paymentMethod && orderData.paymentMethod !== 'cod') {
      if (!orderData.transactionId) {
        return res.status(400).json({
          message: 'Transaction ID is required for non-COD payments'
        });
      }
    }
    
    // Set default values
    if (!orderData.status) {
      orderData.status = 'pending';
    }
    if (!orderData.paymentStatus) {
      orderData.paymentStatus = orderData.paymentMethod === 'cod' ? 'pending' : 'pending';
    }
    
    // Get seller name from store if not provided
    if (!orderData.sellerName && orderData.sellerId) {
      try {
        const store = await Store.findById(orderData.sellerId);
        if (store) {
          orderData.sellerName = store.name || store.storeName;
        }
      } catch (error) {
        console.log('Could not fetch seller name:', error);
      }
    }

    // Add OTP to the order
    const generateOTP = () => {
      return Math.floor(1000 + Math.random() * 9000).toString();
    };
    orderData.otp = generateOTP();

    // Process products and calculate totals
    orderData.products = orderData.products.map((product) => ({
      ...product,
      totalPrice: product.quantity * product.unitPrice,
    }));
    
    orderData.orderId = `ORD-${Date.now()}`;
    const order = new Order(orderData);
    await order.save();

    // ✅ FIXED: Correct population (userId is the owner field in Store schema)
    const populatedOrder = await Order.findById(order._id)
      .populate('buyerId', 'name email username')
      .populate('sellerId', 'storeName userId') // ✅ userId is the store owner
      .populate('products.productId', 'name price image');

    // 📊 Debug order data for notifications
    console.log('📊 Order data for notification:', {
      orderId: populatedOrder._id,
      sellerId: populatedOrder.sellerId._id,
      buyerId: populatedOrder.buyerId._id,
      customerName: populatedOrder.customerName,
      storeOwner: populatedOrder.sellerId?.userId,
      products: populatedOrder.products.map(p => ({
        name: p.productName,
        quantity: p.quantity
      }))
    });
    
    // 🔔 SEND NOTIFICATION TO SELLER ABOUT NEW ORDER
    try {
   
      // ✅ FIXED: Pass the correctly populated order
      const notificationResult = await notifyNewOrder(populatedOrder);
   
      if (notificationResult) {
        console.log('✅ New order notification sent successfully');
      } else {
        console.log('❌ New order notification failed');
      }
    } catch (notificationError) {
      console.error('❌ CRITICAL: New order notification error:', notificationError);
      console.error('📊 Error details:', {
        message: notificationError.message,
        stack: notificationError.stack
      });
    }
    
    // 💰 SEND PAYMENT NOTIFICATION IF PAYMENT IS COMPLETED
    if (orderData.paymentStatus === 'completed' || orderData.paymentStatus === 'paid') {
      try {
        console.log('💳 Sending payment notification...');
        const paymentNotificationResult = await notifyPaymentReceived(populatedOrder);
        console.log('💰 Payment notification result:', paymentNotificationResult);
      } catch (paymentError) {
        console.error('❌ Payment notification error:', paymentError);
      }
    }
    
    res.status(201).json({
      message: "Order created successfully",
      data: populatedOrder,
      orderId: order.orderId
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({
      message: "Error creating order",
      error: error.message
    });
  }
};
// Get all orders for a user (buyer or seller) with filtering
const getUserOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role, startDate, endDate, limit = 50, page = 1 } = req.query;

    if (!id) {
      return res.status(400).json({ message: "ID parameter is required" });
    }

    // Build query based on role
    let query = {};
    
      // If role not specified, search both
      query = {
        $or: [
          { buyerId: id },
          { sellerId: id }
        ]
      };
   
    // Add status filter
    if (status) {
      query.status = status.toLowerCase();
    }

    // Add date filters
    if (startDate || endDate) {
      query.orderDate = {};
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.orderDate.$gte = start;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.orderDate.$lte = end;
      }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get orders with pagination
    const orders = await Order.find(query)
      .populate("buyerId", "name email")
      .populate("sellerId", "name address")
      .populate("products.productId", "name price image")
      .sort({ orderDate: -1 }) // Most recent first
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const totalCount = await Order.countDocuments(query);


    res.status(200).json({
      message: "Orders fetched successfully",
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, estimatedDeliveryDate, notes } = req.body;


    // Validate status
    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ 
        message: "Invalid status. Valid statuses are: " + validStatuses.join(", ") 
      });
    }

    const order = await Order.findById(orderId)
      .populate('buyerId', 'name')
      .populate('sellerId', 'name');
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const oldStatus = order.status;
    const newStatus = status.toLowerCase();

    // Update order fields
    order.status = newStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDeliveryDate) order.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
    if (notes) order.notes = notes;

    await order.save();

    // Send notifications based on status change
   // Send notifications based on new status
try {
  switch (newStatus) {
    case 'confirmed':
      await notifyOrderConfirmed(order);
      break;

    case 'shipped':
      await notifyOrderShipped(order, trackingNumber);
      break;

    case 'delivered':
      await notifyOrderDelivered(order);
      break;

    case 'cancelled':
      // Optional: pass who cancelled (buyer/seller)
      await notifyOrderCancelled(order, 'seller'); // or 'buyer'
      break;

    case 'returned':
      // You can create a new function like notifyOrderReturned if needed
      break;

    default:
      console.log('No notification handler for status:', newStatus);
  }
} catch (notificationError) {
  console.error('Notification failed:', notificationError);
}


    res.status(200).json({
      message: `Order ${newStatus} successfully`,
      order: {
        _id: order._id,
        orderId: order.orderId,
        status: order.status,
        trackingNumber: order.trackingNumber,
        estimatedDeliveryDate: order.estimatedDeliveryDate
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      message: "Error updating order status", 
      error: error.message 
    });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!paymentStatus || !validPaymentStatuses.includes(paymentStatus.toLowerCase())) {
      return res.status(400).json({ 
        message: "Invalid payment status. Valid statuses are: " + validPaymentStatuses.join(", ") 
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = paymentStatus.toLowerCase();
    await order.save();

    res.status(200).json({
      message: "Payment status updated successfully",
      order: {
        _id: order._id,
        orderId: order.orderId,
        paymentStatus: order.paymentStatus
      }
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ 
      message: "Error updating payment status", 
      error: error.message 
    });
  }
};

// Get single order details
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate("buyerId", "name email")
      .populate("sellerId", "name address")
      .populate("products.productId", "name price image")
     
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order details fetched successfully",
      data: order
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching order", 
      error: error.message 
    });
  }
};

// Get order by orderId (string)
const getOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId })
      .populate("buyerId", "name email")
      .populate("sellerId", "name address")
      .populate("products.productId", "name price image")
     
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order details fetched successfully",
      data: order
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching order", 
      error: error.message 
    });
  }
};

// Edit order (only allowed for pending orders)
const editOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updateData = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow editing if order is still pending
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        message: "Order can only be edited when status is pending" 
      });
    }

    // Fields that can be updated
    const allowedUpdates = ['customerName', 'deliveryAddress', 'phoneNumber', 'quantity', 'notes'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    // Recalculate total if quantity changed
    if (Array.isArray(updateData.products)) {
      updates.products = updateData.products;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updates,
      { new: true, runValidators: true }
    ).populate("buyerId", "name email")
     .populate("sellerId", "name address")
     .populate("products.productId", "name price image")

    res.status(200).json({
      message: "Order updated successfully",
      data: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ 
      message: "Error updating order", 
      error: error.message 
    });
  }
};

// Delete order (only allowed for pending orders)
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow deletion if order is pending
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        message: "Only pending orders can be deleted" 
      });
    }

    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
      message: "Order deleted successfully",
      deletedOrderId: orderId
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ 
      message: "Error deleting order", 
      error: error.message 
    });
  }
};

// Get orders by status for a seller
const getOrdersByStatus = async (req, res) => {
  try {
    const { storeId } = req.params; // store ID
    const { status } = req.query;
    if (!storeId) {
      return res.status(400).json({ message: "Seller ID is required" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const orders = await Order.find({
      sellerId: storeId,
      status: status.toLowerCase()
    })
    .populate("buyerId", "name email")
    .populate("products.productId", "name price image")
    .sort({ orderDate: -1 });

    res.status(200).json({
      message: "Orders fetched successfully",
      orders
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching orders",
      error: error.message
    });
  }
};

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({ message: "Seller ID is required" });
    }

    const stats = await Order.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    // Get total orders count
    const totalOrders = await Order.countDocuments({ sellerId });

    res.status(200).json({
      message: "Order statistics fetched successfully",
      stats,
      totalOrders
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching order statistics",
      error: error.message
    });
  }
};
const getPendingNonCodOrders = async (req, res) => {
  const { storeId } = req.params; // Expecting storeId from URL

  if (!storeId) {
    return res.status(400).json({
      success: false,
      message: 'Store ID is required'
    });
  }

  try {
    const pendingOrders = await Order.find({
      sellerId: storeId,
      paymentStatus: 'pending',
      paymentMethod: { $ne: 'cod' }
    });

    res.status(200).json({
      success: true,
      count: pendingOrders.length,
      data: pendingOrders
    });
  } catch (error) {
    console.error('Error fetching orders for store:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
const confirmOrderPayment = async (req, res) => {

  
  const { orderId } = req.params; // order ID passed in URL

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: 'Order ID is required'
    });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Optional: Check if already completed
    if (order.paymentStatus === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Payment is already marked as completed'
      });
    }

    order.paymentStatus = 'confirmed';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment status updated to completed',
      data: order
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const notifyReady = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate('buyerId', 'username name pushTokens')
      .populate('sellerId', 'storeName userId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const success = await notifyOrderReady(order); // ✅ JUST send notification

    if (success) {
      return res.status(200).json({ message: 'Customer notified that the product is ready' });
    } else {
      return res.status(500).json({ message: 'Notification failed' });
    }
  } catch (error) {
    console.error('❌ Error sending ready notification:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = {
  createOrder,
  getUserOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderById,
  getOrderByOrderId,
  editOrder,
  deleteOrder,
  getOrdersByStatus,
  getOrderStats,
  getPendingNonCodOrders,
  confirmOrderPayment,
  notifyReady 
};