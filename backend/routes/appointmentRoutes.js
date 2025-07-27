const express = require('express');
const router = express.Router();
const {
  getUserAppointments,
  updateAppointmentStatus,
  getAppointmentById,
  createAppointment,
  getAppointmentStats,
  manualUpdatePastAppointments,
  getAppointmentsByStatus,
  updateAdvancePayment,
  updateAdvanceStatus,
  getAdvancePaymentAppointments,
  updateAppointmentActiveStatus
} = require('../controllers/appointmentController');

// Create new appointment
router.post('/', createAppointment);

// Get appointments with flexible filtering
// Usage examples:
// /user/123 - Get all appointments for user
// /user/123?status=confirmed - Filter by status
// /user/123?date=2024-01-15 - Get appointments for specific date
// /user/123?startDate=2024-01-15&endDate=2024-01-20 - Date range
// /user/123?status=confirmed&date=2024-01-15 - Multiple filters
// /user/123?limit=10&page=2 - Pagination
router.put('/:appointmentId',updateAppointmentStatus)
router.get('/user/:id', getUserAppointments);
router.put('/advance-payment/:appointmentId', updateAdvancePayment);
router.put('/mark-advance/:appointmentId', updateAdvanceStatus);
// Get appointment statistics/dashboard data
router.get('/store/:id/status', getAppointmentsByStatus);

// Get single appointment by ID
router.get('/:appointmentId', getAppointmentById);
// PATCH route to update appointment status
router.patch('/appointments/:id/status', updateAppointmentActiveStatus);
// Update appointment status (universal - handles all status changes)
// Usage: PUT /appointments/123 with body: { "status": "confirmed", "notes": "Optional notes" }
router.patch('/:appointmentId', updateAppointmentStatus);
router.get('/store/:storeId/advance-payments', getAdvancePaymentAppointments);
// Manual trigger to update past appointments (useful for testing or manual runs)
router.post('/update-past', manualUpdatePastAppointments);

module.exports = router;