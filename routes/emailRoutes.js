const express = require('express');
const { sendVerificationCode, verifyCode } = require('../controllers/emailController');
const router = express.Router();

// Route for sending verification code
router.post('/send-verification-code', sendVerificationCode);

// Route for verifying code
router.post('/verify-code', verifyCode);

module.exports = router;