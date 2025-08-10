const Reservation = require("../models/TableReservationModel");

// Add Reservation
const addReservation = async (req, res) => {
  try {
    const { storeId, userId, name, phone, numberOfPeople, reservationDate,timeSlot, note } = req.body;

    if (!storeId || !userId || !name || !phone || !numberOfPeople || !reservationDate) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const newReservation = new Reservation({
      storeId,
      userId,
      name,
      phone,
      numberOfPeople,
      reservationDate,
      timeSlot,
      note
    });

    const savedReservation = await newReservation.save();
    res.status(201).json(savedReservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Reservations by User ID
const getReservationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const reservations = await Reservation.find({
      userId,
      reservationDate: { $gte: startOfDay, $lte: endOfDay },
    }).populate("storeId", "name address");

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get Reservations by Store ID
const getReservationsByStore = async (req, res) => {
  try {
    const { storeId } = req.params;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const reservations = await Reservation.find({
      storeId,
      reservationDate: { $gte: startOfDay, $lte: endOfDay },
    }).populate("userId", "name phone");

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete Reservation
const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReservation = await Reservation.findByIdAndDelete(id);

    if (!deletedReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res.status(200).json({ message: "Reservation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const changeReservationStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      if (!["pending", "confirmed","completed","not-came", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
  
      const updatedReservation = await Reservation.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
  
      if (!updatedReservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }
  
      res.status(200).json(updatedReservation);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
module.exports = {
  addReservation,
  getReservationsByUser,
  getReservationsByStore,
  deleteReservation,
  changeReservationStatus
};
