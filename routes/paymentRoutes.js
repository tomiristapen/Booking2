const express = require('express');
const { createPayment } = require('../controllers/paymentController');
const router = express.Router();

// Route for creating a payment
router.post('/', createPayment);

module.exports = router;