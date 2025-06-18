const Appointment = require("../models/AppointmentModel");
const Store = require("../models/storeModel");
const mongoose = require("mongoose");

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

    console.log(`Updated ${result.modifiedCount} past appointments to completed status`);
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
      .populate("store", "name location")
      .populate("product", "name")
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

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status} = req.body;

    console.log("Updating appointment:", appointmentId, "to status:", status);

    // Validate status
    const validStatuses = ["pending", "confirmed", "cancelled", "completed", "not-attended"];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ 
        message: "Invalid status. Valid statuses are: " + validStatuses.join(", ") 
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update status and notes if provided
    appointment.status = status.toLowerCase();
    await appointment.save();

    res.status(200).json({
      message: `Appointment ${status.toLowerCase()} successfully`,
      
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error updating appointment status", 
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

// Create new appointment
const createAppointment = async (req, res) => {
  try {
    const appointmentData = req.body;
    console.log('appointmentData', appointmentData);
    
    // Validate required fields
    const requiredFields = ['user', 'store', 'product', 'date'];
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
      .populate('user', 'name email contactNo')
      .populate('store', 'name address')
      .populate('product', 'name price');

    res.status(201).json({
      message: "Appointment created successfully",
      data: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating appointment", error: error.message });
  }
};

// Get appointment statistics/dashboard data
const getAppointmentsByStatus = async (req, res) => {
  try {
    const { id } = req.params; // store ID
    const { status } = req.query;
    console.log("ddss",id,status);
    

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
      return res.status(404).json({ message: "No appointments found", appointments: [] });
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

module.exports = {
  getUserAppointments,
  updateAppointmentStatus,
  getAppointmentById,
  createAppointment,
  getAppointmentsByStatus,
  updatePastAppointments,
  manualUpdatePastAppointments
};