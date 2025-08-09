const Store = require("../models/storeModel");
const Ticket = require("../models/ReservationModel");

const createOnlineTicketing = async (req, res) => {
    try {
      const { storeId, name, phone, numberOfPeople } = req.body;
  
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
  
      const nextTicketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 1001;
  
      const isPaid = store.onlineTicketing.type === "paid";
      const paymentAmount = isPaid ? store.onlineTicketing.price : 0;
  
      const newTicket = await Ticket.create({
        storeId,
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
  
      const nextTicketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 101;
  
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

  
  module.exports = {
    createOnlineTicketing,
    createWalkingTicketing,
    updateTicketStatus,
    getTicketsByStoreDateCategory 
  };