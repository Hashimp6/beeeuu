
const mongoose = require('mongoose');
const AppointmentModel = require('../models/AppointmentModel');
const orderModel = require('../models/orderModel');
const getStoreAnalytics = async (req, res) => {
  try {
    const storeId = req.params.storeId; // from URL
    const currentYear = new Date().getFullYear();

    const appointments = await AppointmentModel.aggregate([
      {
        $match: {
          store: new mongoose.Types.ObjectId(storeId),
          date: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) }
        }
      },
      {
        $group: {
          _id: { $month: "$date" },
          totalAppointments: { $sum: 1 },
          completedAppointments: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          cancelledAppointments: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
          revenueFromAppointments: { $sum: "$amountPaid" }
        }
      }
    ]);

    const orders = await orderModel.aggregate([
      {
        $match: {
          sellerId: new mongoose.Types.ObjectId(storeId),
          orderDate: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) }
        }
      },
      {
        $group: {
          _id: { $month: "$orderDate" },
          totalOrders: { $sum: 1 },
          confirmedOrders: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
          deliveredOrders: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
          revenueFromOrders: { $sum: "$totalAmount" }
        }
      }
    ]);

    // Prepare month-wise data (1 to 12)
    const result = [];

    for (let i = 1; i <= 12; i++) {
      const monthData = {
        month: i,
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        revenueFromAppointments: 0,
        totalOrders: 0,
        confirmedOrders: 0,
        cancelledOrders: 0,
        deliveredOrders: 0,
        revenueFromOrders: 0
      };

      const appData = appointments.find(item => item._id === i);
      const orderData = orders.find(item => item._id === i);

      if (appData) {
        monthData.totalAppointments = appData.totalAppointments;
        monthData.completedAppointments = appData.completedAppointments;
        monthData.cancelledAppointments = appData.cancelledAppointments;
        monthData.revenueFromAppointments = appData.revenueFromAppointments;
      }

      if (orderData) {
        monthData.totalOrders = orderData.totalOrders;
        monthData.confirmedOrders = orderData.confirmedOrders;
        monthData.cancelledOrders = orderData.cancelledOrders;
        monthData.deliveredOrders = orderData.deliveredOrders;
        monthData.revenueFromOrders = orderData.revenueFromOrders;
      }

      result.push({
        ...monthData,
        totalRevenue: monthData.revenueFromOrders + monthData.revenueFromAppointments
      });
    }

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {getStoreAnalytics}