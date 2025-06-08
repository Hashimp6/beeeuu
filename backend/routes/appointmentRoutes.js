const express = require('express');
const router = express.Router();
const {
  getUserAppointments,
  getAppointmentsByStatus,
  approveAppointment,
  cancelAppointment,
  getAppointmentById,
  createAppointment
} = require('../controllers/appointmentController');

// Create new appointment
router.post('/', createAppointment);

// Get all appointments for a user (as customer and store owner)
router.get('/check/:id', getUserAppointments);

// Get appointments by status for a user
router.get('/user/:userId/status', getAppointmentsByStatus);

// Get single appointment by ID
router.get('/:appointmentId', getAppointmentById);

// Approve appointment (store owner only)
router.patch('/:appointmentId/approve', approveAppointment);

// Cancel appointment (user or store owner)
router.patch('/:appointmentId/cancel', cancelAppointment);


module.exports = router;