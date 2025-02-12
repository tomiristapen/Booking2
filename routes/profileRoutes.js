const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profileController');
const verifyToken = require('../middleware/auth');
const router = express.Router();

router.get('/', verifyToken, getProfile);
router.post('/', verifyToken, updateProfile);

module.exports = router;