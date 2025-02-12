const express = require('express');
const { getFlights, createFlight } = require('../controllers/flightController');
const router = express.Router();

// Route for fetching flights
router.get('/', getFlights);

// Route for creating a flight
router.post('/', createFlight);

module.exports = router;