const express = require("express");
const { createOnlineTicketing, createWalkingTicketing, updateTicketStatus, getTicketsByStoreDateCategory } = require("../controllers/bookingController");
const router = express.Router();

// Create online ticket
router.post("/online", createOnlineTicketing);

// Create walk-in ticket
router.post("/walk-in", createWalkingTicketing);

// Update ticket status
router.put("/:ticketId/status", updateTicketStatus);

// New GET route for store/date/category
router.get("/:storeId", getTicketsByStoreDateCategory);


module.exports = router;
