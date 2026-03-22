const express = require('express');
const router = express.Router();
const { createBooking } = require('../controllers/bookingController');

// POST /api/bookings - Create booking
router.post('/', createBooking);

module.exports = router;
