const Store = require("../models/storeModel");
const Ticket = require("../models/ReservationModel");
const ReservationSlot = require('../models/TimeSlotModel');

function getISTDateString(date = new Date()) {
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const istDate = new Date(date.getTime() + istOffset);
  return istDate.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

// Convert YYYY-MM-DD string to IST day start/end in UTC (for createdAt queries)
function getISTDayRangeUTC(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Create IST midnight and end of day
  const istStart = new Date(year, month - 1, day, 0, 0, 0, 0);
  const istEnd = new Date(year, month - 1, day, 23, 59, 59, 999);
  
  // Convert to UTC for createdAt queries
  const istOffset = 5.5 * 60 * 60 * 1000;
  const startUTC = new Date(istStart.getTime() - istOffset);
  const endUTC = new Date(istEnd.getTime() - istOffset);
  
  return { startUTC, endUTC };
}

const createOnlineTicketing = async (req, res) => {
  try {
    const { storeId, userId, name, phone, numberOfPeople } = req.body;

    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    if (!store.onlineTicketing.active) {
      return res.status(400).json({ message: "Online ticketing is not active for this store" });
    }

    // Get today's date string in IST (this ensures India date consistency)
    const todayDateString = getISTDateString();
    console.log("Today's IST date:", todayDateString);

    // Get the last ticket for today using dateString
    let lastTicket = await Ticket.findOne({
      storeId,
      dateString: todayDateString
    }).sort({ ticketNumber: -1 }).lean();

    console.log("Last ticket for today:", lastTicket);

    let nextTicketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 101;

    // Ensure no duplicate ticket number for today
    let exists = await Ticket.exists({ 
      storeId, 
      dateString: todayDateString, 
      ticketNumber: nextTicketNumber 
    });
    
    while (exists) {
      nextTicketNumber++;
      exists = await Ticket.exists({ 
        storeId, 
        dateString: todayDateString, 
        ticketNumber: nextTicketNumber 
      });
    }

    const isPaid = store.onlineTicketing.type === "paid";
    const paymentAmount = isPaid ? store.onlineTicketing.price : 0;

    const newTicket = await Ticket.create({
      storeId,
      userId,
      type: "online",
      name,
      phone,
      numberOfPeople,
      isPaid,
      paymentAmount,
      ticketNumber: nextTicketNumber,
      dateString: todayDateString
    });

    res.status(201).json({
      message: "Online ticket created successfully",
      ticket: newTicket
    });

  } catch (error) {
    console.error("Error creating online ticket:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ====== Create Walk-in Ticket (FIXED VERSION) ======
const createWalkInTicketing = async (req, res) => {
  try {
    const { storeId, name, phone, numberOfPeople } = req.body;

    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: "Store not found" });

    if (!store.walkingTicketing.active) {
      return res.status(400).json({ message: "Walking ticketing is not active for this store" });
    }

    // Get today's date string in IST (FIXED: using dateString approach)
    const todayDateString = getISTDateString();
    console.log("Today's IST date for walk-in:", todayDateString);

    // Get the last ticket for today using dateString (FIXED: consistent with online)
    let lastTicket = await Ticket.findOne({
      storeId,
      dateString: todayDateString
    }).sort({ ticketNumber: -1 }).lean();

    console.log("Last ticket for today (walk-in):", lastTicket);

    // FIXED: Use same starting number as online (101) for consistency
    let nextTicketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 101;

    // Ensure no duplicate ticket number for today
    let exists = await Ticket.exists({ 
      storeId, 
      dateString: todayDateString, 
      ticketNumber: nextTicketNumber 
    });
    
    while (exists) {
      nextTicketNumber++;
      exists = await Ticket.exists({ 
        storeId, 
        dateString: todayDateString, 
        ticketNumber: nextTicketNumber 
      });
    }

    const isPaid = store.walkingTicketing.type === "paid";
    const paymentAmount = isPaid ? store.walkingTicketing.price : 0;

    const newTicket = await Ticket.create({
      storeId,
      type: "walk-in",
      name,
      phone,
      numberOfPeople,
      isPaid,
      paymentAmount,
      ticketNumber: nextTicketNumber,
      dateString: todayDateString // FIXED: using dateString instead of date
    });

    res.status(201).json({
      message: "Walk-in ticket created successfully",
      ticket: newTicket
    });

  } catch (error) {
    console.error("Error creating walk-in ticket:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ====== Update Ticket Status ======
const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!["confirmed", "pending", "completed", "ready", "available"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({
      message: "Ticket status updated successfully",
      ticket: updatedTicket
    });

  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ====== Get Tickets by Store, Date, and Category ======
// Replace your getTicketsByStoreDateCategory function with this debug version:

const getTicketsByStoreDateCategory = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { date, category } = req.query;

    console.log("=== DEBUG TICKET FETCH ===");
    console.log("Store ID:", storeId);
    console.log("Requested date:", date);
    console.log("Category:", category);

    // Validate category
    if (!["online", "walk-in"].includes(category)) {
      return res.status(400).json({ message: "Invalid category. Use 'online' or 'walk-in'." });
    }

    // Get date string - if date provided, parse it; otherwise use today's IST date
    let selectedDateString;
    if (date) {
      // If date is already in YYYY-MM-DD format, use it directly
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        selectedDateString = date;
      } else {
        // Convert provided date to IST date string
        const providedDate = new Date(date);
        selectedDateString = getISTDateString(providedDate);
      }
    } else {
      // Use today's IST date
      selectedDateString = getISTDateString();
    }

    console.log("Final date string for query:", selectedDateString);
    console.log("Today's IST date:", getISTDateString());

    // Find tickets using dateString
    const tickets = await Ticket.find({
      storeId,
      type: category,
      dateString: selectedDateString
    }).sort({ ticketNumber: 1 });

    console.log(`Found ${tickets.length} tickets for ${category} on ${selectedDateString}`);
    console.log("Ticket details:", tickets.map(t => ({
      id: t._id,
      ticketNumber: t.ticketNumber,
      name: t.name,
      dateString: t.dateString,
      type: t.type
    })));

    // Also check all tickets for this store today (for debugging)
    const allTicketsToday = await Ticket.find({
      storeId,
      dateString: selectedDateString
    });
    
    console.log(`Total tickets for store on ${selectedDateString}:`, allTicketsToday.length);

    res.status(200).json({
      message: "Tickets fetched successfully",
      date: selectedDateString,
      total: tickets.length,
      tickets,
      debug: {
        requestedDate: date,
        finalDateString: selectedDateString,
        todayIST: getISTDateString(),
        totalTicketsForDate: allTicketsToday.length
      }
    });

  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =============================================================================
// CONFIRMED TICKET FUNCTIONS
// =============================================================================

const getConfirmedTicketNumber = async (req, res) => {
  try {
    const { userId, storeId } = req.params;
    const todayDateString = getISTDateString();

    // Find the ticket with confirmed status for this user and store for today (IST)
    const ticket = await Ticket.findOne({
      userId: userId,
      storeId: storeId,
      status: "confirmed",
      dateString: todayDateString
    });

    if (!ticket) {
      return res.status(404).json({ 
        message: "No confirmed ticket found for this user in this store for today" 
      });
    }

    res.status(200).json({
      ticket: ticket
    });
  } catch (error) {
    console.error("Error fetching confirmed ticket number:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getConfirmedTicketWithUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const todayDateString = getISTDateString();

    // Find the ticket with confirmed status for this user for today (IST)
    const ticket = await Ticket.findOne({
      userId: userId,
      status: "confirmed",
      dateString: todayDateString
    });

    if (!ticket) {
      return res.status(404).json({ 
        message: "No confirmed ticket found for this user for today" 
      });
    }

    res.status(200).json({
      ticket: ticket
    });
  } catch (error) {
    console.error("Error fetching confirmed ticket number:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getCurrentTicketsByType = async (req, res) => {
  const { storeId } = req.params;
  
  try {
    const todayDateString = getISTDateString();
    const { startUTC, endUTC } = getISTDayRangeUTC(todayDateString);
    
    console.log('IST Today:', todayDateString);
    console.log('Querying tickets created between (UTC):', startUTC, 'to', endUTC);

    // Debug: Check what tickets exist for this store today
    const allTicketsToday = await Ticket.find({
      storeId,
      dateString: todayDateString
    }).lean();

    console.log(`Found ${allTicketsToday.length} tickets for store ${storeId} on IST date ${todayDateString}`);

    // Current called tickets (using dateString for accuracy, createdAt for ordering)
    const walkInTicket = await Ticket.findOne({
      storeId,
      dateString: todayDateString,
      type: 'walk-in',
      status: { $in: ['confirmed', 'ready'] }
    })
    .sort({ createdAt: 1 })
    .lean();

    const onlineTicket = await Ticket.findOne({
      storeId,
      dateString: todayDateString,
      type: 'online',
      status: { $in: ['confirmed', 'ready'] }
    })
    .sort({ createdAt: 1 })
    .lean();

    // Last and next ticket numbers (from today's IST date)
    const getLastAndNextTicketNumber = async (type) => {
      const lastTicket = await Ticket.findOne({
        storeId,
        type,
        dateString: todayDateString,
      })
      .sort({ ticketNumber: -1 })
      .lean();

      const lastTicketNumber = lastTicket ? lastTicket.ticketNumber : 100; // Start from 100, next will be 101
      return {
        lastTicketNumber,
        nextTicketNumber: lastTicketNumber + 1,
      };
    };

    const walkInNumbers = await getLastAndNextTicketNumber('walk-in');
    const onlineNumbers = await getLastAndNextTicketNumber('online');

    res.json({
      date: todayDateString,
      walkIn: {
        currentTicket: walkInTicket,
        ...walkInNumbers,
      },
      online: {
        currentTicket: onlineTicket,
        ...onlineNumbers,
      }
    });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// =============================================================================
// RESERVATION SLOTS
// =============================================================================

const updateSlots = async (req, res) => {
  try {
    const { storeId, monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;

    const updatedSlots = await ReservationSlot.findOneAndUpdate(
      { storeId },
      { monday, tuesday, wednesday, thursday, friday, saturday, sunday },
      { new: true, upsert: true } // creates if not exists
    );

    res.status(200).json({ success: true, data: updatedSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getSlotsByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const slots = await ReservationSlot.findOne({ storeId });

    if (!slots) {
      return res.status(404).json({ success: false, message: 'Slots not found for this store' });
    }

    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createOnlineTicketing,
  createWalkInTicketing, // FIXED: Exported the correct function name
  updateTicketStatus,
  getTicketsByStoreDateCategory,
  getConfirmedTicketNumber,
  getConfirmedTicketWithUser,
  getCurrentTicketsByType,
  updateSlots,
  getSlotsByStore
};