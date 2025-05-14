const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/chatRoutes');
const storeRoutes = require('./routes/storeRoute');

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

module.exports = app;
