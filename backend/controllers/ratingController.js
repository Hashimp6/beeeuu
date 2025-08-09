const Rating = require('../models/ratingModel');
const Store = require('../models/storeModel');
const Order = require('../models/orderModel');
const Appointment = require('../models/AppointmentModel');

const addRating = async (req, res) => {
  try {
    const { userId, store, appointment, order, type, rating, feedback } = req.body;

    // Validate required fields
    if (!userId || !store || !type || !rating) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({
      userId,
      store,
      type,
      ...(type === 'order' ? { order } : { appointment })
    });

    if (existingRating) {
      return res.status(400).json({ message: 'You have already submitted a rating for this.' });
    }

    // Check if order/appointment is valid and completed
    if (type === 'order') {
      if (!order) return res.status(400).json({ message: 'Order ID is required for order rating.' });

      const orderData = await Order.findById(order);
      if (!orderData || orderData.buyerId.toString() !== userId || orderData.status !== 'completed') {
        return res.status(403).json({ message: 'You are not allowed to rate this order.' });
      }
    } else if (type === 'appointment') {
      if (!appointment) return res.status(400).json({ message: 'Appointment ID is required for appointment rating.' });

      const appointmentData = await Appointment.findById(appointment);
    
      
      if (!appointmentData || appointmentData.user.toString() !== userId || appointmentData.status !== 'completed') {
        return res.status(403).json({ message: 'You are not allowed to rate this appointment.' });
      }
    }

    // Create and save the new rating
    const newRating = new Rating({
      userId,
      store,
      appointment: type === 'appointment' ? appointment : undefined,
      order: type === 'order' ? order : undefined,
      type,
      rating,
      feedback
    });

    await newRating.save();

    // Recalculate average rating and count
    const storeRatings = await Rating.find({ store });
    const totalRatings = storeRatings.length;
    const avgRating = storeRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    // Update store's rating and count
    await Store.findByIdAndUpdate(store, {
      averageRating: avgRating.toFixed(2),
      numberOfRatings: totalRatings
    });

    return res.status(201).json({
      message: 'Rating submitted successfully',
      rating: newRating,
      storeStats: {
        averageRating: avgRating.toFixed(2),
        numberOfRatings: totalRatings
      }
    });

  } catch (err) {
    console.error('Error in addRating controller:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addRating
};
