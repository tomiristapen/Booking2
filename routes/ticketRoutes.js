const express = require('express');
const { createTicket, getTicketHistory } = require('../controllers/ticketController');
const verifyToken = require('../middleware/auth');
const router = express.Router();

// Route for creating a ticket
router.post('/', createTicket);

// Route for fetching ticket history
router.get('/history', verifyToken, getTicketHistory);

module.exports = router;