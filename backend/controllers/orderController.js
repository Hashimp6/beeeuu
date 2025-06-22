const Order = require("../models/orderModel");
const Store = require("../models/storeModel");
const mongoose = require("mongoose");

// You can add notification functions here if needed
// const { notifyOrderCreated, notifyOrderStatusChanged } = require("../utils/orderNotifications");

// Create new order
const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    console.log('Creating order:', orderData);
    // Validate required fields
    const requiredFields = ['productId', 'productName', 'sellerId', 'buyerId', 'customerName', 'deliveryAddress', 'phoneNumber', 'quantity', 'unitPrice', 'totalAmount'];
    for (let field of requiredFields) {
      if (!orderData[field]) {
        return res.status(400).json({ message: `${field} is required` });
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

    const order = new Order(orderData);
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name address')
      .populate('productId', 'name price image');

    // Send notification if needed
    // try {
    //   await notifyOrderCreated(populatedOrder);
    // } catch (notificationError) {
    //   console.error('Notification failed:', notificationError);
    // }

    res.status(201).json({
      message: "Order created successfully",
      data: populatedOrder,
      orderId: order.orderId
    });
  } catch (error) {
    console.error('Error creating order:', error);
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
    if (role === 'seller') {
      query.sellerId = id;
    } else if (role === 'buyer') {
      query.buyerId = id;
    } else {
      // If role not specified, search both
      query = {
        $or: [
          { buyerId: id },
          { sellerId: id }
        ]
      };
    }

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
      .populate("productId", "name price image")
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

    console.log("Updating order:", orderId, "to status:", status);

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
    // try {
    //   await notifyOrderStatusChanged(order, oldStatus, newStatus);
    // } catch (notificationError) {
    //   console.error('Notification failed:', notificationError);
    // }

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
      .populate("productId", "name price image");
     
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
      .populate("productId", "name price image");
     
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
    if (updateData.quantity) {
      updates.totalAmount = order.unitPrice * updateData.quantity;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updates,
      { new: true, runValidators: true }
    ).populate("buyerId", "name email")
     .populate("sellerId", "name address")
     .populate("productId", "name price image");

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
    console.log("ORDERis",storeId,status);
    
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
    .populate("productId", "name price image")
    .sort({ orderDate: -1 });
console.log(orders);

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
  getOrderStats
};