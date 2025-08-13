const mongoose = require('mongoose');
const AppointmentModel = require('../models/AppointmentModel');
const Order = require('../models/orderModel');

const getStoreAnalytics = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const currentYear = new Date().getFullYear();

    // Fixed: Convert storeId to ObjectId properly
    const storeObjectId = new mongoose.Types.ObjectId(storeId);

    const appointments = await AppointmentModel.aggregate([
      {
        $match: {
          store: storeObjectId,
          date: { 
            $gte: new Date(`${currentYear}-01-01`), 
            $lte: new Date(`${currentYear}-12-31`) 
          }
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

    const orders = await Order.aggregate([
      {
        $match: {
          sellerId: storeObjectId,
          orderDate: { 
            $gte: new Date(`${currentYear}-01-01`), 
            $lte: new Date(`${currentYear}-12-31`) 
          },
          // Fixed: Only count delivered/completed orders for revenue
          status: { $nin: ['cancelled', 'returned'] }
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

    const result = [];

    for (let i = 1; i <= 12; i++) {
      const monthData = {
        month: i,
        monthName: new Date(2024, i - 1, 1).toLocaleDateString('en-US', { month: 'long' }),
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
        monthData.revenueFromAppointments = appData.revenueFromAppointments || 0;
      }

      if (orderData) {
        monthData.totalOrders = orderData.totalOrders;
        monthData.confirmedOrders = orderData.confirmedOrders;
        monthData.cancelledOrders = orderData.cancelledOrders;
        monthData.deliveredOrders = orderData.deliveredOrders;
        monthData.revenueFromOrders = orderData.revenueFromOrders || 0;
      }

      result.push({
        ...monthData,
        totalRevenue: (monthData.revenueFromOrders || 0) + (monthData.revenueFromAppointments || 0)
      });
    }

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('Analytics Error:', err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

const getStoreRevenue = async (req, res) => {
  try {
    const { storeId } = req.params;
    if (!storeId) return res.status(400).json({ message: 'Store ID is required' });

    const storeObjectId = new mongoose.Types.ObjectId(storeId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const appointmentFilter = {
      store: storeObjectId,
      status: 'completed'
    };

    // Fixed: Only count delivered orders for revenue
    const orderFilter = {
      sellerId: storeObjectId,
      status: { $in: ['delivered', 'completed'] }
    };

    const [monthlyAppointments, yearlyAppointments, totalAppointments] = await Promise.all([
      AppointmentModel.aggregate([
        { $match: { ...appointmentFilter, date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
      ]),
      AppointmentModel.aggregate([
        { $match: { ...appointmentFilter, date: { $gte: startOfYear } } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
      ]),
      AppointmentModel.aggregate([
        { $match: appointmentFilter },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
      ])
    ]);

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

const dailySales = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { date } = req.query;
    
    // Fixed: Proper date handling
    let targetDate;
    if (date) {
      targetDate = new Date(date);
    } else {
      targetDate = new Date();
    }
    
    // Fixed: Create proper date boundaries
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const storeObjectId = new mongoose.Types.ObjectId(storeId);

    const pipeline = [
      {
        $match: {
          sellerId: storeObjectId,
          orderDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $nin: ['cancelled', 'returned'] }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          totalItems: { $sum: '$totalItems' },
          codSales: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'cod'] }, '$totalAmount', 0] } },
          onlineSales: { $sum: { $cond: [{ $ne: ['$paymentMethod', 'cod'] }, '$totalAmount', 0] } },
          codOrders: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'cod'] }, 1, 0] } },
          onlineOrders: { $sum: { $cond: [{ $ne: ['$paymentMethod', 'cod'] }, 1, 0] } },
          dineInSales: { $sum: { $cond: [{ $eq: ['$orderType', 'dine-in'] }, '$totalAmount', 0] } },
          deliverySales: { $sum: { $cond: [{ $eq: ['$orderType', 'delivery'] }, '$totalAmount', 0] } },
          parcelSales: { $sum: { $cond: [{ $eq: ['$orderType', 'parcel'] }, '$totalAmount', 0] } },
          dineInOrders: { $sum: { $cond: [{ $eq: ['$orderType', 'dine-in'] }, 1, 0] } },
          deliveryOrders: { $sum: { $cond: [{ $eq: ['$orderType', 'delivery'] }, 1, 0] } },
          parcelOrders: { $sum: { $cond: [{ $eq: ['$orderType', 'parcel'] }, 1, 0] } }
        }
      }
    ];

    const result = await Order.aggregate(pipeline);
    const salesData = result[0] || {
      totalSales: 0, totalOrders: 0, totalItems: 0,
      codSales: 0, onlineSales: 0, codOrders: 0, onlineOrders: 0,
      dineInSales: 0, deliverySales: 0, parcelSales: 0,
      dineInOrders: 0, deliveryOrders: 0, parcelOrders: 0
    };

    res.json({
      success: true,
      data: {
        date: startOfDay.toDateString(),
        summary: salesData,
        breakdown: {
          paymentMethods: {
            cash: { amount: salesData.codSales, orders: salesData.codOrders },
            online: { amount: salesData.onlineSales, orders: salesData.onlineOrders }
          },
          orderTypes: {
            dineIn: { amount: salesData.dineInSales, orders: salesData.dineInOrders },
            delivery: { amount: salesData.deliverySales, orders: salesData.deliveryOrders },
            parcel: { amount: salesData.parcelSales, orders: salesData.parcelOrders }
          }
        }
      }
    });
  } catch (error) {
    console.error('Daily sales error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const weeklySales = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { week } = req.query;
    
    const storeObjectId = new mongoose.Types.ObjectId(storeId);
    
    // Fixed: Better week calculation
    let weekStart;
    if (week) {
      weekStart = new Date(week);
    } else {
      weekStart = new Date();
    }
    
    // Set to start of week (Sunday)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const pipeline = [
      {
        $match: {
          sellerId: storeObjectId,
          orderDate: { $gte: weekStart, $lte: weekEnd },
          status: { $nin: ['cancelled', 'returned'] }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$orderDate' },
          dailySales: { $sum: '$totalAmount' },
          dailyOrders: { $sum: 1 },
          codSales: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'cod'] }, '$totalAmount', 0] } },
          onlineSales: { $sum: { $cond: [{ $ne: ['$paymentMethod', 'cod'] }, '$totalAmount', 0] } }
        }
      },
      { $sort: { '_id': 1 } }
    ];

    const dailyResults = await Order.aggregate(pipeline);
    
    const weeklyTotals = await Order.aggregate([
      {
        $match: {
          sellerId: storeObjectId,
          orderDate: { $gte: weekStart, $lte: weekEnd },
          status: { $nin: ['cancelled', 'returned'] }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          codSales: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'cod'] }, '$totalAmount', 0] } },
          onlineSales: { $sum: { $cond: [{ $ne: ['$paymentMethod', 'cod'] }, '$totalAmount', 0] } }
        }
      }
    ]);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formattedDaily = days.map((day, index) => {
      const dayData = dailyResults.find(d => d._id === index + 1) || 
                     { dailySales: 0, dailyOrders: 0, codSales: 0, onlineSales: 0 };
      return { 
        day, 
        dayNumber: index + 1,
        dailySales: dayData.dailySales || 0,
        dailyOrders: dayData.dailyOrders || 0,
        codSales: dayData.codSales || 0,
        onlineSales: dayData.onlineSales || 0
      };
    });

    res.json({
      success: true,
      data: {
        weekPeriod: `${weekStart.toDateString()} - ${weekEnd.toDateString()}`,
        weeklyTotals: weeklyTotals[0] || { totalSales: 0, totalOrders: 0, codSales: 0, onlineSales: 0 },
        dailyBreakdown: formattedDaily
      }
    });
  } catch (error) {
    console.error('Weekly sales error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const monthlySales = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { year, month } = req.query;
    
    const storeObjectId = new mongoose.Types.ObjectId(storeId);
    
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
    
    const monthStart = new Date(targetYear, targetMonth, 1);
    const monthEnd = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const pipeline = [
      {
        $match: {
          sellerId: storeObjectId,
          orderDate: { $gte: monthStart, $lte: monthEnd },
          status: { $nin: ['cancelled', 'returned'] }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$orderDate' },
          dailySales: { $sum: '$totalAmount' },
          dailyOrders: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ];

    const dailyResults = await Order.aggregate(pipeline);
    
    const monthlyTotals = await Order.aggregate([
      {
        $match: {
          sellerId: storeObjectId,
          orderDate: { $gte: monthStart, $lte: monthEnd },
          status: { $nin: ['cancelled', 'returned'] }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          totalItems: { $sum: '$totalItems' },
          codSales: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'cod'] }, '$totalAmount', 0] } },
          onlineSales: { $sum: { $cond: [{ $ne: ['$paymentMethod', 'cod'] }, '$totalAmount', 0] } },
          dineInSales: { $sum: { $cond: [{ $eq: ['$orderType', 'dine-in'] }, '$totalAmount', 0] } },
          deliverySales: { $sum: { $cond: [{ $eq: ['$orderType', 'delivery'] }, '$totalAmount', 0] } },
          parcelSales: { $sum: { $cond: [{ $eq: ['$orderType', 'parcel'] }, '$totalAmount', 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        month: `${monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        monthStart: monthStart.toDateString(),
        monthEnd: monthEnd.toDateString(),
        monthlyTotals: monthlyTotals[0] || { 
          totalSales: 0, totalOrders: 0, totalItems: 0,
          codSales: 0, onlineSales: 0, dineInSales: 0, deliverySales: 0, parcelSales: 0 
        },
        dailyBreakdown: dailyResults
      }
    });
  } catch (error) {
    console.error('Monthly sales error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const costomerByCount = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { limit = 10 } = req.query;

    const storeObjectId = new mongoose.Types.ObjectId(storeId);

    const pipeline = [
      {
        $match: {
          sellerId: storeObjectId,
          status: { $nin: ['cancelled', 'returned'] }
        }
      },
      {
        $group: {
          _id: {
            // Fixed: Handle both registered and guest customers
            customerId: '$buyerId',
            customerName: '$customerName',
            phoneNumber: '$phoneNumber'
          },
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrderDate: { $max: '$orderDate' },
          firstOrderDate: { $min: '$orderDate' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalOrders: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: '$_id.customerId',
          customerName: '$_id.customerName',
          phoneNumber: '$_id.phoneNumber',
          totalOrders: 1,
          totalSpent: 1,
          lastOrderDate: 1,
          firstOrderDate: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 2] }
        }
      }
    ];

    const customers = await Order.aggregate(pipeline);
    
    res.json({
      success: true,
      data: {
        topCustomersByOrders: customers,
        totalCustomers: customers.length
      }
    });
  } catch (error) {
    console.error('Customer by count error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const bestCostomerTotelSpend = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { limit = 10 } = req.query;

    const storeObjectId = new mongoose.Types.ObjectId(storeId);

    const pipeline = [
      {
        $match: {
          sellerId: storeObjectId,
          status: { $nin: ['cancelled', 'returned'] }
        }
      },
      {
        $group: {
          _id: {
            customerId: '$buyerId',
            customerName: '$customerName',
            phoneNumber: '$phoneNumber'
          },
          totalSpent: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          lastOrderDate: { $max: '$orderDate' },
          firstOrderDate: { $min: '$orderDate' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: '$_id.customerId',
          customerName: '$_id.customerName',
          phoneNumber: '$_id.phoneNumber',
          totalSpent: 1,
          totalOrders: 1,
          lastOrderDate: 1,
          firstOrderDate: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 2] }
        }
      }
    ];

    const customers = await Order.aggregate(pipeline);
    
    res.json({
      success: true,
      data: {
        topCustomersByAmount: customers,
        totalCustomers: customers.length
      }
    });
  } catch (error) {
    console.error('Best customer total spend error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const allCustomerDetails = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { 
      type = 'all',
      sortBy = 'totalSpent',
      page = 1,
      limit = 50,
      minOrders = 0,
      minAmount = 0
    } = req.query;

    const storeObjectId = new mongoose.Types.ObjectId(storeId);

    let aggregateLimit;
    switch(type) {
      case 'top10': aggregateLimit = 10; break;
      case 'top20': aggregateLimit = 20; break;
      default: aggregateLimit = parseInt(limit);
    }

    const pipeline = [
      {
        $match: {
          sellerId: storeObjectId,
          status: { $nin: ['cancelled', 'returned'] }
        }
      },
      {
        $group: {
          _id: {
            customerId: '$buyerId',
            customerName: '$customerName',
            phoneNumber: '$phoneNumber'
          },
          deliveryAddress: { $first: '$deliveryAddress' },
          totalSpent: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          totalItems: { $sum: '$totalItems' },
          firstOrderDate: { $min: '$orderDate' },
          lastOrderDate: { $max: '$orderDate' },
          averageOrderValue: { $avg: '$totalAmount' },
          codOrders: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'cod'] }, 1, 0] } },
          onlineOrders: { $sum: { $cond: [{ $ne: ['$paymentMethod', 'cod'] }, 1, 0] } },
          dineInOrders: { $sum: { $cond: [{ $eq: ['$orderType', 'dine-in'] }, 1, 0] } },
          deliveryOrders: { $sum: { $cond: [{ $eq: ['$orderType', 'delivery'] }, 1, 0] } },
          parcelOrders: { $sum: { $cond: [{ $eq: ['$orderType', 'parcel'] }, 1, 0] } }
        }
      },
      {
        $match: {
          totalOrders: { $gte: parseInt(minOrders) },
          totalSpent: { $gte: parseFloat(minAmount) }
        }
      }
    ];

    // Add sorting
    const sortOptions = {};
    switch(sortBy) {
      case 'totalOrders':
        sortOptions.totalOrders = -1;
        break;
      case 'lastOrder':
        sortOptions.lastOrderDate = -1;
        break;
      default:
        sortOptions.totalSpent = -1;
    }
    pipeline.push({ $sort: sortOptions });

    // Add pagination for 'all' type
    if (type === 'all') {
      pipeline.push({ $skip: (parseInt(page) - 1) * parseInt(limit) });
    }
    
    pipeline.push({ $limit: aggregateLimit });

    // Add projection to clean up the output
    pipeline.push({
      $project: {
        _id: '$_id.customerId',
        customerName: '$_id.customerName',
        phoneNumber: '$_id.phoneNumber',
        deliveryAddress: 1,
        totalSpent: 1,
        totalOrders: 1,
        totalItems: 1,
        firstOrderDate: 1,
        lastOrderDate: 1,
        averageOrderValue: { $round: ['$averageOrderValue', 2] },
        codOrders: 1,
        onlineOrders: 1,
        dineInOrders: 1,
        deliveryOrders: 1,
        parcelOrders: 1
      }
    });

    const customers = await Order.aggregate(pipeline);

    // Get total count for pagination
    const totalCustomers = await Order.aggregate([
      {
        $match: {
          sellerId: storeObjectId,
          status: { $nin: ['cancelled', 'returned'] }
        }
      },
      {
        $group: {
          _id: {
            customerId: '$buyerId',
            customerName: '$customerName',
            phoneNumber: '$phoneNumber'
          },
          totalSpent: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $match: {
          totalOrders: { $gte: parseInt(minOrders) },
          totalSpent: { $gte: parseFloat(minAmount) }
        }
      },
      { $count: "total" }
    ]);

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil((totalCustomers[0]?.total || 0) / parseInt(limit)),
          totalCustomers: totalCustomers[0]?.total || 0,
          limit: parseInt(limit)
        },
        filters: { type, sortBy, minOrders, minAmount }
      }
    });
  } catch (error) {
    console.error('All customer details error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const bestsellingProduct = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { limit = 20, period = 'all' } = req.query;

    const storeObjectId = new mongoose.Types.ObjectId(storeId);

    let dateFilter = {};
    const now = new Date();
    
    switch(period) {
      case 'today':
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        dateFilter = { $gte: todayStart, $lte: todayEnd };
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        dateFilter = { $gte: weekStart };
        break;
      case 'month':
        dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
        break;
    }

    const matchStage = {
      sellerId: storeObjectId,
      status: { $nin: ['cancelled', 'returned'] }
    };
    
    if (Object.keys(dateFilter).length > 0) {
      matchStage.orderDate = dateFilter;
    }

    const pipeline = [
      { $match: matchStage },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          productName: { $first: '$products.productName' },
          totalQuantitySold: { $sum: '$products.quantity' },
          totalRevenue: { $sum: '$products.totalPrice' },
          orderCount: { $sum: 1 },
          averageUnitPrice: { $avg: '$products.unitPrice' }
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 1,
          productName: 1,
          totalQuantitySold: 1,
          totalRevenue: 1,
          orderCount: 1,
          averageUnitPrice: { $round: ['$averageUnitPrice', 2] }
        }
      }
    ];

    const products = await Order.aggregate(pipeline);
    
    res.json({
      success: true,
      data: {
        period,
        bestSellingProducts: products,
        totalProducts: products.length
      }
    });
  } catch (error) {
    console.error('Best selling product error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getStoreAnalytics,
  getStoreRevenue,
  bestsellingProduct,
  allCustomerDetails,
  bestCostomerTotelSpend,
  costomerByCount,
  monthlySales,
  weeklySales,
  dailySales
};