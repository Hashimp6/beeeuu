const Store = require("../models/storeModel");
const Ticket = require("../models/ReservationModel");

const createOnlineTicketing = async (req, res) => {
    try {
      const { storeId,userId, name, phone, numberOfPeople } = req.body;
  
      const store = await Store.findById(storeId);
      if (!store) return res.status(404).json({ message: "Store not found" });
  
      if (!store.onlineTicketing.active) {
        return res.status(400).json({ message: "Online ticketing is not active for this store" });
      }
  
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const lastTicket = await Ticket.findOne({
        storeId,
        type: "online",
        date: today
      }).sort({ ticketNumber: -1 });
  
      const nextTicketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 101;
  
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
        date: today
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
  
  // ====== Create Walk-in Ticket ======
  const createWalkingTicketing = async (req, res) => {
    try {
      const { storeId, name, phone, numberOfPeople } = req.body;
  
      const store = await Store.findById(storeId);
      if (!store) return res.status(404).json({ message: "Store not found" });
  
      if (!store.walkingTicketing.active) {
        return res.status(400).json({ message: "Walking ticketing is not active for this store" });
      }
  
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const lastTicket = await Ticket.findOne({
        storeId,
        type: "walk-in",
        date: today
      }).sort({ ticketNumber: -1 });
  
      const nextTicketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 1001;
  
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
        date: today
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
const getTicketsByStoreDateCategory = async (req, res) => {
  try {
    const { storeId } = req.params; // storeId from URL
    const { date, category } = req.query; // date & category from query params

    // Validate category
    if (!["online", "walk-in"].includes(category)) {
      return res.status(400).json({ message: "Invalid category. Use 'online' or 'walk-in'." });
    }

    // Format date to remove time
    let selectedDate = new Date(date || new Date());
    selectedDate.setHours(0, 0, 0, 0);

    // Find tickets
    const tickets = await Ticket.find({
      storeId,
      type: category,
      date: selectedDate
    }).sort({ ticketNumber: 1 }); // Sort by ticketNumber

    res.status(200).json({
      message: "Tickets fetched successfully",
      total: tickets.length,
      tickets
    });

  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getConfirmedTicketNumber = async (req, res) => {
  try {
    const { userId, storeId } = req.params;

    // Find the ticket with confirmed status for this user and store
    const ticket = await Ticket.findOne({
      userId: userId,
      storeId: storeId,
      status: "confirmed"
    })

    if (!ticket) {
      return res.status(404).json({ message: "No confirmed ticket found for this user in this store" });
    }

    res.status(200).json({
     ticket:ticket
    });
  } catch (error) {
    console.error("Error fetching confirmed ticket number:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const getISTStartOfDay = () => {
  const now = new Date();
  
  // Get current IST time
  const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
  
  // Set to start of day
  istTime.setHours(0, 0, 0, 0);
  
  return istTime;
};

const getCurrentTicketsByType = async (req, res) => {
  const { storeId } = req.params;
  
  try {
    // Get IST day range (Indian timezone)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
    const istTime = new Date(now.getTime() + istOffset);
    
    // Get IST date components
    const year = istTime.getUTCFullYear();
    const month = istTime.getUTCMonth();
    const date = istTime.getUTCDate();
    
    // Create start and end of IST day (stored as UTC)
    const startOfDay = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month, date, 23, 59, 59, 999));
    
    // Convert back to server timezone for query
    const startOfDayLocal = new Date(startOfDay.getTime() - istOffset);
    const endOfDayLocal = new Date(endOfDay.getTime() - istOffset);
    
    console.log('IST Today:', istTime);
    console.log('Querying tickets created between (server time):', startOfDayLocal, 'and', endOfDayLocal);
    console.log('This represents IST day from 00:00 to 23:59');
    
    // Debug: Check what tickets exist for this store
    const allTicketsToday = await Ticket.find({
      storeId,
      createdAt: { $gte: startOfDayLocal, $lte: endOfDayLocal }
    }).lean();
    
    console.log(`Found ${allTicketsToday.length} tickets for store ${storeId} in IST today`);
    
    // Current called tickets (created in IST today)
    const walkInTicket = await Ticket.findOne({
      storeId,
      createdAt: { $gte: startOfDayLocal, $lte: endOfDayLocal },
      type: 'walk-in',
      status: { $in: ['confirmed', 'ready'] }
    })
    .sort({ createdAt: 1 })
    .lean();
    
    const onlineTicket = await Ticket.findOne({
      storeId,
      createdAt: { $gte: startOfDayLocal, $lte: endOfDayLocal },
      type: 'online',
      status: { $in: ['confirmed', 'ready'] }
    })
    .sort({ createdAt: 1 })
    .lean();
    
    // Last and next ticket numbers (from IST today)
    const getLastAndNextTicketNumber = async (type) => {
      const lastTicket = await Ticket.findOne({
        storeId,
        type,
        createdAt: { $gte: startOfDayLocal, $lte: endOfDayLocal },
      })
      .sort({ ticketNumber: -1 })
      .lean();
      
      const lastTicketNumber = lastTicket ? lastTicket.ticketNumber : 0;
      return {
        lastTicketNumber,
        nextTicketNumber: lastTicketNumber + 1,
      };
    };
    
    const walkInNumbers = await getLastAndNextTicketNumber('walk-in');
    const onlineNumbers = await getLastAndNextTicketNumber('online');
    
    res.json({
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


  
  module.exports = {
    createOnlineTicketing,
    createWalkingTicketing,
    updateTicketStatus,
    getTicketsByStoreDateCategory,
    getConfirmedTicketNumber,
    getCurrentTicketsByType
  };