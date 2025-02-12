const express = require('express');
const { bookFlight, getUserBookings } = require('../controllers/bookingController');
const router = express.Router();
router.post('/book', bookFlight);
router.get('/user/:userId', getUserBookings);
module.exports = router;