
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

//revenue calculation 

const getStoreRevenue = async (req, res) => {
  try {
    const { storeId } = req.params;
    if (!storeId) return res.status(400).json({ message: 'Store ID is required' });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Helper to filter valid appointments
    const appointmentFilter = {
      store: storeId,
      status: 'completed'
    };

    // Helper to filter valid orders
    const orderFilter = {
      sellerId: storeId,
      status: 'delivered' // or 'completed' if you also use that
    };

    // -------------------------------
    // Appointments Revenue
    // -------------------------------
    const [monthlyAppointments, yearlyAppointments, totalAppointments] = await Promise.all([
      Appointment.aggregate([
        { $match: { ...appointmentFilter, date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
      ]),
      Appointment.aggregate([
        { $match: { ...appointmentFilter, date: { $gte: startOfYear } } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
      ]),
      Appointment.aggregate([
        { $match: appointmentFilter },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
      ])
    ]);

    // -------------------------------
    // Orders Revenue
    // -------------------------------
    const [monthlyOrders, yearlyOrders, totalOrders] = await Promise.all([
      Order.aggregate([
        { $match: { ...orderFilter, orderDate: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Order.aggregate([
        { $match: { ...orderFilter, orderDate: { $gte: startOfYear } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Order.aggregate([
        { $match: orderFilter },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ])
    ]);

    const format = (val) => val?.[0]?.total || 0;

    return res.status(200).json({
      storeId,
      revenue: {
        month: format(monthlyAppointments) + format(monthlyOrders),
        year: format(yearlyAppointments) + format(yearlyOrders),
        total: format(totalAppointments) + format(totalOrders),
        breakdown: {
          appointments: {
            month: format(monthlyAppointments),
            year: format(yearlyAppointments),
            total: format(totalAppointments),
          },
          orders: {
            month: format(monthlyOrders),
            year: format(yearlyOrders),
            total: format(totalOrders),
          }
        }
      }
    });

  } catch (err) {
    console.error("Error in revenue calc:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};




module.exports = {getStoreAnalytics,getStoreRevenue}