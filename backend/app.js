const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/chatRoutes');
const storeRoutes = require('./routes/storeRoute');
const productsRoutes = require('./routes/productRoutes');
const galleryRoutes = require('./routes/galleryRoute');
const appointmentsRoutes = require('./routes/appointmentRoutes');
const upiRoute = require('./routes/upiRoute');
const searchRoute = require('./routes/searchRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/users', userRoutes);
app.use('/messages', messageRoutes);
app.use('/stores', storeRoutes);
app.use('/products', productsRoutes);
app.use('/gallery', galleryRoutes);
app.use('/appointments', appointmentsRoutes);
app.use('/upi', upiRoute);
app.use('/search', searchRoute);
app.use('/notifications', notificationRoutes);
app.use('/orders', orderRoutes);
module.exports = app;
