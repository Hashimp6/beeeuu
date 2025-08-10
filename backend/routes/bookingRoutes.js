const express = require("express");
const { createOnlineTicketing, createWalkingTicketing, updateTicketStatus, getTicketsByStoreDateCategory, getConfirmedTicketNumber, getCurrentTicketsByType, updateSlots, getSlotsByStore } = require("../controllers/bookingController");
const { addReservation, getReservationsByUser, getReservationsByStore, deleteReservation, changeReservationStatus } = require("../controllers/tableReservation");
const router = express.Router();

// Create online ticket
router.post("/online", createOnlineTicketing);

// Create walk-in ticket
router.post("/walk-in", createWalkingTicketing);

// Update ticket status
router.put("/:ticketId/status", updateTicketStatus);

// New GET route for store/date/category
router.get("/:storeId", getTicketsByStoreDateCategory);


router.get("/current/:storeId", getCurrentTicketsByType);


router.get("/tickets/:userId/:storeId", getConfirmedTicketNumber);

router.put('/slots', updateSlots);

router.get('/slots/:storeId', getSlotsByStore);

router.post("/table/add", addReservation);

// Get reservations by userId
router.get("/table/:userId", getReservationsByUser);

// Get reservations by storeId
router.get("/table/store/:storeId", getReservationsByStore);

// Delete reservation
router.delete("/table/:id", deleteReservation);

// Change reservation status
router.patch("/table/:id/status", changeReservationStatus);

module.exports = router;
