const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        match: /^[0-9]{10,15}$/  // Simple phone validation
    },
    numberOfPeople: {
        type: Number,
        required: true,
        min: 1
    },
    reservationDate: {
        type: Date,
        required: true
    },
    note: {
        type: String,
        trim: true
    },
    timeSlot: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ["pending","completed","not-came", "confirmed", "cancelled"],
        default: "pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("tableReservation", reservationSchema);
