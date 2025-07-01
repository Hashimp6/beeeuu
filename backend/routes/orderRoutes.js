const express = require('express');
const router = express.Router();
const {
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
  confirmOrderPayment
} = require('../controllers/orderController');

// You might have auth middleware
// const { authenticateUser } = require('../middleware/auth');

// Create new order
router.post('/create', createOrder);

// Get all orders for a user (buyer or seller)
// Query params: ?status=pending&role=buyer&startDate=2024-01-01&endDate=2024-12-31&limit=20&page=1
router.get('/store/:id', getUserOrders);

router.put('/confirm-payment/:orderId', confirmOrderPayment);

router.get('/pending-non-cod/:storeId', getPendingNonCodOrders);
// Get single order by MongoDB _id
router.get('/details/:orderId', getOrderById);

// Get single order by orderId (ORD-2024-001234)
router.get('/order/:orderId', getOrderByOrderId);

// Update order status
router.patch('/status/:orderId', updateOrderStatus);

// Update payment status
router.patch('/payment/:orderId', updatePaymentStatus);

// Edit order (only for pending orders)
router.put('/edit/:orderId', editOrder);

// Delete order (only for pending orders)
router.delete('/delete/:orderId', deleteOrder);

// Get orders by status for a seller
// Query params: ?status=pending
router.get('/store/:storeId/status', getOrdersByStatus);

// Get order statistics for a seller
router.get('/seller/:sellerId/stats', getOrderStats);

module.exports = router;