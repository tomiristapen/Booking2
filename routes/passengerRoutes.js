const express = require('express');
const { createPassenger } = require('../controllers/passengerController');
const router = express.Router();

// Route for creating a passenger
router.post('/', createPassenger);

module.exports = router;