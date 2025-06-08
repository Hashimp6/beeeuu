const Appointment = require("../models/AppointmentModel");
const Store = require("../models/storeModel");
const mongoose = require("mongoose");

// Get all appointments for a user (both as customer and store owner)

const getUserAppointments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID parameter is required" });
    }

    // Search appointments where either the user or the store matches the given id
    const appointments = await Appointment.find({
      $or: [
        { user: id },
        { store: id }
      ]
    })

    if (appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found for this ID" });
    }

    res.status(200).json({
      message: "Appointments fetched successfully",
      appointments
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching appointments",
      error: error.message
    });
  }
};



const getAppointmentsByStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    if (!id || !status) {
      return res.status(400).json({ message: "Both ID and status are required" });
    }

    // Search for appointments matching either user or store with the given status
    const appointments = await Appointment.find({
      status: status.toLowerCase(), // ensures case insensitivity
      $or: [
        { user: id },
        { store: id }
      ]
    })
      .populate("user", "name email")
      .populate("store", "name location")
      .populate("product", "name");

    if (appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found for the given ID and status" });
    }

    res.status(200).json({
      message: "Appointments fetched successfully",
      appointments
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching appointments",
      error: error.message
    });
  }
};



// Approve appointment (only store owner can approve)
const approveAppointment = async (req, res) => {
  try {
    console.log("reached",req.params);
    
    const { appointmentId } = req.params;
    console.log("reached",appointmentId,req.user);
    
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

        appointment.status = 'confirmed';
        await appointment.save();
  

    const updatedAppointment = await Appointment.findById(appointmentId)
   
    res.status(200).json({
      message: "Appointment approved successfully",
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({ message: "Error approving appointment", error: error.message });
  }
};

// Cancel appointment (both user and store owner can cancel)
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const appointment = await Appointment.findById(appointmentId)
        
        if (!appointment) {
          return res.status(404).json({ message: "Appointment not found" });
        }
    
        // Check if user is the store owner
        // if (req.user.role==="store") {
            appointment.status = 'cancelled';
            await appointment.save();
      
    
        const updatedAppointment = await Appointment.findById(appointmentId)
       
        res.status(200).json({
          message: "Appointment approved successfully",
          data: updatedAppointment
        });
      } catch (error) {
        res.status(500).json({ message: "Error approving appointment", error: error.message });
      }
};

// Get single appointment details
const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId)
     
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
    console.log('appdta',appointmentData);
    
    
    // Validate required fields
    const requiredFields = ['user', 'store', 'product'];
    for (let field of requiredFields) {
      if (!appointmentData[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
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

module.exports = {
  getUserAppointments,
  getAppointmentsByStatus,
  approveAppointment,
  cancelAppointment,
  getAppointmentById,
  createAppointment
};