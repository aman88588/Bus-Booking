const express = require('express');
const router = express.Router();
const { getBuses, getBusById, lockSeats } = require('../controllers/busController');

// GET /api/buses - List buses with filters
router.get('/', getBuses);

// GET /api/buses/:busId - Get bus details + seat layout
router.get('/:busId', getBusById);

// POST /api/buses/:busId/lock-seats - Lock seats temporarily
router.post('/:busId/lock-seats', lockSeats);

module.exports = router;
