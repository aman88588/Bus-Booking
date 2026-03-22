const Booking = require('../models/Booking');
const Bus = require('../models/Bus');

/**
 * POST /api/bookings
 * Create a new booking
 */
const createBooking = async (req, res) => {
  try {
    const { busId, seats, passengerDetails } = req.body;

    // Validate required fields
    if (!busId || !seats || !passengerDetails) {
      return res.status(400).json({
        error: 'Missing required fields: busId, seats, passengerDetails',
      });
    }

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: 'seats must be a non-empty array' });
    }

    if (!Array.isArray(passengerDetails) || passengerDetails.length === 0) {
      return res.status(400).json({ error: 'passengerDetails must be a non-empty array' });
    }

    if (seats.length !== passengerDetails.length) {
      return res.status(400).json({
        error: 'Number of seats must match number of passenger details',
      });
    }

    // Validate passenger details
    for (const p of passengerDetails) {
      if (!p.name || !p.age || !p.gender) {
        return res.status(400).json({
          error: 'Each passenger must have name, age, and gender',
        });
      }
      if (!['male', 'female', 'other'].includes(p.gender.toLowerCase())) {
        return res.status(400).json({ error: 'Gender must be male, female, or other' });
      }
    }

    // Find the bus
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    // Check seat availability
    const unavailableSeats = [];
    for (const seatNum of seats) {
      const seat = bus.seats.find(s => s.seatNumber === seatNum);
      if (!seat) {
        return res.status(400).json({ error: `Seat ${seatNum} does not exist` });
      }
      if (!seat.isAvailable) {
        // Allow if locked by any session (confirm booking)
        unavailableSeats.push(seatNum);
      }
    }

    // If seats are unavailable and not just locked, reject
    for (const seatNum of unavailableSeats) {
      const seat = bus.seats.find(s => s.seatNumber === seatNum);
      if (!seat.lockedBy || (seat.lockedUntil && seat.lockedUntil < new Date())) {
        return res.status(409).json({
          error: `Seat ${seatNum} is already booked and unavailable`,
        });
      }
    }

    const totalPrice = seats.length * bus.price;

    // Mark seats as permanently booked
    bus.seats.forEach(seat => {
      if (seats.includes(seat.seatNumber)) {
        seat.isAvailable = false;
        seat.lockedUntil = null;
        seat.lockedBy = null;
      }
    });

    bus.availableSeats = bus.seats.filter(s => s.isAvailable).length;
    await bus.save();

    // Create booking
    const booking = await Booking.create({
      busId,
      seats,
      passengerDetails: passengerDetails.map(p => ({
        ...p,
        gender: p.gender.toLowerCase(),
      })),
      totalPrice,
    });

    res.status(201).json({
      message: 'Booking successful',
      id: booking._id,
      seatsBooked: seats,
      totalPrice,
    });
  } catch (error) {
    console.error('createBooking error:', error);
    res.status(500).json({ error: 'Failed to create booking', message: error.message });
  }
};

module.exports = { createBooking };
