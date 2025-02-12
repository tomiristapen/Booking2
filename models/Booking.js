const client = require('../config/db');
const createBooking = async (userId, flightDetails) => {
    const query = 'INSERT INTO bookings (user_id, flight_details) VALUES ($1, $2) RETURNING *';
    return (await client.query(query, [userId, flightDetails])).rows[0];
};
const getBookingsByUser = async (userId) => {
    return (await client.query('SELECT * FROM bookings WHERE user_id = $1', [userId])).rows;
};
module.exports = { createBooking, getBookingsByUser };