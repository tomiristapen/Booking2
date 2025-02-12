const { createBooking, getBookingsByUser } = require('../models/Booking');

const bookFlight = async (req, res) => {
    const { userId, flightDetails } = req.body;
    try {
        const booking = await createBooking(userId, flightDetails);
        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ message: "Error booking flight", error: err.message });
    }
};

const getUserBookings = async (req, res) => {
    const { userId } = req.params;
    try {
        const bookings = await getBookingsByUser(userId);
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving bookings", error: err.message });
    }
};

module.exports = { bookFlight, getUserBookings };