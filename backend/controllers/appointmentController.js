const Appointment = require("../models/AppointmentModel");
const Store = require("../models/storeModel");
const mongoose = require("mongoose");


const { notifyAppointmentRequest, notifyAppointmentAccepted,
  notifyAppointmentCancelled,
  notifyAppointmentDeclined,
  notifyPaymentReceived } = require("../utils/appointmentNotification");

// Automatic status update function - runs daily to mark past appointments as completed
const updatePastAppointments = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    // Update all confirmed appointments from yesterday and before to completed
    const result = await Appointment.updateMany(
      {
        date: { $lte: yesterday },
        status: { $in: ['confirmed', 'pending'] }
      },
      {
        $set: { status: 'completed' }
      }
    );
  return result;
  } catch (error) {
    console.log('Error updating past appointments:', error);
  }
};

// Get all appointments for a user with flexible filtering
const getUserAppointments = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, date, startDate, endDate, limit = 50, page = 1 } = req.query;

    if (!id) {
      return res.status(400).json({ message: "ID parameter is required" });
    }

    // Run automatic status update before fetching
    await updatePastAppointments();

    // Build query
    let query = {
      $or: [
        { user: id },
        { store: id }
      ]
    };

    // Add status filter
    if (status) {
      query.status = status.toLowerCase();
    }

    // Add date filters
    if (date) {
      // Single date filter
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      
      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    } else if (startDate || endDate) {
      // Date range filter
      query.date = {};
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get appointments with pagination
    const appointments = await Appointment.find(query)
      .populate("user", "name email")
      .populate("store", "storeName location")
      .populate("product")
      .sort({ date: -1 }) // Most recent first
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const totalCount = await Appointment.countDocuments(query);

    res.status(200).json({
      message: "Appointments fetched successfully",
      appointments,
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
      message: "Error fetching appointments",
      error: error.message
    });
  }
};

// Update appointment status WITH NOTIFICATIONS
const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    console.log("Updating appointment:", appointmentId, "to status:", status);

    // Validate status
    const validStatuses = ["pending", "confirmed", "cancelled", "completed", "not-attended"];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ 
        message: "Invalid status. Valid statuses are: " + validStatuses.join(", ") 
      });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('user', 'username')
      .populate('store', 'name');
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const oldStatus = appointment.status;
    const newStatus = status.toLowerCase();

    // Update status
    appointment.status = newStatus;
    await appointment.save();

    // 🔔 SEND NOTIFICATIONS BASED ON STATUS CHANGE
    try {
      if (oldStatus === 'pending' && newStatus === 'confirmed') {
        await notifyAppointmentAccepted(appointment);
      } 
      else if (oldStatus === 'pending' && newStatus === 'cancelled') {
      await notifyAppointmentDeclined(appointment);
      }
      else if (newStatus === 'cancelled' && oldStatus !== 'pending') {
       // Determine who cancelled (you might need to pass this info in request)
        const cancelledBy = req.body.cancelledBy || 'customer'; // Default to customer
        await notifyAppointmentCancelled(appointment, cancelledBy);
      }
    } catch (notificationError) {
      console.error('⚠️ Notification failed but appointment updated:', notificationError);
      // Don't fail the entire request if notification fails
    }

    res.status(200).json({
      message: `Appointment ${newStatus} successfully`,
      appointment: {
        _id: appointment._id,
        status: appointment.status,
        user: appointment.user,
        store: appointment.store
      }
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ 
      message: "Error updating appointment status", 
      error: error.message 
    });
  }
};

// Create new appointment WITH NOTIFICATION
const createAppointment = async (req, res) => {
  try {
    const appointmentData = req.body;
 
    // Validate required fields
    const requiredFields = ['user', 'store', 'product', 'date','time'];
    for (let field of requiredFields) {
      if (!appointmentData[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Set default status as pending
    if (!appointmentData.status) {
      appointmentData.status = 'pending';
    }

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('user', 'name email contactNo username')
      .populate('store', 'name address')
      .populate('product', 'name price');

    // 🔔 SEND NOTIFICATION TO STORE OWNER
    try {
     await notifyAppointmentRequest(populatedAppointment);
    } catch (notificationError) {
      console.error('⚠️ Notification failed but appointment created:', notificationError);
      // Don't fail the entire request if notification fails
    }

    res.status(201).json({
      message: "Appointment created successfully",
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: "Error creating appointment", error: error.message });
  }
};

// Handle payment notification (add this new function)
const handlePaymentUpdate = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { paymentType, amount, paymentMethod = 'UPI' } = req.body;
 const appointment = await Appointment.findById(appointmentId)
      .populate('user', 'username')
      .populate('store', 'name');
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update payment information
    const currentPaid = appointment.amountPaid || 0;
    appointment.amountPaid = currentPaid + parseFloat(amount);
    
    // Update payment status based on amount
    const totalCost = appointment.cost || appointment.price || 0;
    if (appointment.amountPaid >= totalCost) {
      appointment.payment = 'full';
    } else if (appointment.amountPaid > 0) {
      appointment.payment = 'advance';
    }

    await appointment.save();

    // 🔔 SEND PAYMENT NOTIFICATION TO STORE OWNER
    try {
      await notifyPaymentReceived(appointment, amount, paymentType);
    } catch (notificationError) {
      console.error('⚠️ Payment notification failed:', notificationError);
    }

    res.status(200).json({
      message: "Payment updated successfully",
      appointment: {
        _id: appointment._id,
        amountPaid: appointment.amountPaid,
        payment: appointment.payment
      }
    });

  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ 
      message: "Error updating payment", 
      error: error.message 
    });
  }
};

// Get single appointment details
const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId)
      .populate("user", "name email")
      .populate("store", "name location")
      .populate("product", "name");
     
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({
      message: "Appointment details fetched successfully",
      data: appointment
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointment", error: error.message });
  }
};

// Get appointment statistics/dashboard data
const getAppointmentsByStatus = async (req, res) => {
  try {
    const { id } = req.params; // store ID
    const { status } = req.query;
    if (!id) {
      return res.status(400).json({ message: "Store ID is required" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const appointments = await Appointment.find({
      store: id,
      status
    }).sort({ date: 1 });

    if (!appointments.length) {
      return res.status(200).json({ message: "No appointments found", appointments: [] });
    }

    res.status(200).json({
      message: "Appointments fetched successfully",
      appointments
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching appointments",
      error: error.message
    });
  }
};

// Manual function to update past appointments (can be called via cron job)
const manualUpdatePastAppointments = async (req, res) => {
  try {
    const result = await updatePastAppointments();
    res.status(200).json({
      message: "Past appointments updated successfully",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating past appointments",
      error: error.message
    });
  }
};

const updateAdvancePayment = async (req, res) => {
  const { appointmentId } = req.params;
  const { transactionId, amountPaid } = req.body;
 
  if (!transactionId || !amountPaid) {
    return res.status(400).json({
      success: false,
      message: "Transaction ID and amountPaid are required"
    });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    appointment.payment = "advance";
    appointment.transactionId = transactionId;
    appointment.amountPaid = amountPaid;
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Advance payment recorded",
      data: appointment
    });
  } catch (error) {
    console.error("Error updating advance payment:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};
const updateAdvanceStatus = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    appointment.status = 'advance-recieved';
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: 'Appointment status updated to advance-recieved',
      data: appointment,
    });
  } catch (error) {
    console.error('Error updating status:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};


const getAdvancePaymentAppointments = async (req, res) => {
  const { storeId } = req.params;

  try {
    const appointments = await Appointment.find({
      store: storeId,
      payment: 'advance'
    })
    .populate('user', 'name email') // optional: populate user info
    .populate('product', 'name') // optional
    .populate('store', 'name upi'); // optional

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No appointments with advance payment found for this store."
      });
    }

    res.status(200).json({
      success: true,
      data: appointments
    });

  } catch (error) {
    console.error('Error fetching advance appointments:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


const updateAppointmentActiveStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment status', error: error.message });
  }
};

module.exports = {
  getUserAppointments,
  updateAppointmentStatus,
  getAppointmentById,
  createAppointment,
  getAppointmentsByStatus,
  updatePastAppointments,
  updateAdvancePayment ,
  updateAdvanceStatus ,
  manualUpdatePastAppointments,
  getAdvancePaymentAppointments,
  handlePaymentUpdate ,
  updateAppointmentActiveStatus
};