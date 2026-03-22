const Bus = require('../models/Bus');

/**
 * GET /api/buses
 * Search buses with filters and pagination
 */
const getBuses = async (req, res) => {
  try {
    const {
      departureCity,
      arrivalCity,
      date,
      seatType,
      isAC,
      departureSlot,
      page = 1,
      pageSize = 10,
    } = req.query;

    // Validate required fields
    if (!departureCity || !arrivalCity || !date) {
      return res.status(400).json({
        error: 'Missing required parameters: departureCity, arrivalCity, date',
      });
    }

    // Build query
    const query = {
      departureCity: { $regex: new RegExp(departureCity, 'i') },
      arrivalCity: { $regex: new RegExp(arrivalCity, 'i') },
    };

    if (seatType) {
      query.seatType = seatType.toLowerCase();
    }

    if (isAC !== undefined && isAC !== '') {
      query.isAC = isAC === 'true';
    }

    // Departure slot filter based on first stop's departureTime
    let slotFilter = null;
    if (departureSlot) {
      const slot = departureSlot.toLowerCase();
      if (slot === 'morning') slotFilter = { start: 6, end: 12 };
      else if (slot === 'afternoon') slotFilter = { start: 12, end: 16 };
      else if (slot === 'evening') slotFilter = { start: 16, end: 20 };
      else if (slot === 'night') slotFilter = { start: 20, end: 30 }; // 30 = 6 AM next day
    }

    const pageNum = Math.max(1, parseInt(page));
    const pageSizeNum = Math.max(1, Math.min(50, parseInt(pageSize)));
    const skip = (pageNum - 1) * pageSizeNum;

    let buses = await Bus.find(query).select('-seats');

    // Filter by departure slot in memory (since time is stored as string)
    if (slotFilter) {
      buses = buses.filter(bus => {
        const firstStop = bus.stops[0];
        if (!firstStop?.departureTime) return false;
        const hour = parseTimeToHour(firstStop.departureTime);
        if (slotFilter.start === 20) {
          return hour >= 20 || hour < 6;
        }
        return hour >= slotFilter.start && hour < slotFilter.end;
      });
    }

    const totalBuses = buses.length;
    const totalPages = Math.ceil(totalBuses / pageSizeNum);
    const paginatedBuses = buses.slice(skip, skip + pageSizeNum);

    const formattedBuses = paginatedBuses.map(bus => ({
      id: bus._id,
      name: bus.name,
      stops: bus.stops,
      availableSeats: bus.availableSeats,
      price: bus.price,
      seatType: bus.seatType,
      isAC: bus.isAC,
    }));

    res.json({
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages,
      totalBuses,
      buses: formattedBuses,
    });
  } catch (error) {
    console.error('getBuses error:', error);
    res.status(500).json({ error: 'Failed to fetch buses', message: error.message });
  }
};

/**
 * GET /api/buses/:busId
 * Get bus details and seat layout
 */
const getBusById = async (req, res) => {
  try {
    const { busId } = req.params;
    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    // Release expired seat locks
    const now = new Date();
    let needsSave = false;
    bus.seats.forEach(seat => {
      if (seat.lockedUntil && seat.lockedUntil < now && !seat.isAvailable) {
        // Only release if it was a lock (not a real booking)
        if (seat.lockedBy) {
          seat.isAvailable = true;
          seat.lockedUntil = null;
          seat.lockedBy = null;
          needsSave = true;
        }
      }
    });

    if (needsSave) {
      bus.availableSeats = bus.seats.filter(s => s.isAvailable).length;
      await bus.save();
    }

    res.json({
      id: bus._id,
      name: bus.name,
      availableSeats: bus.availableSeats,
      price: bus.price,
      seatType: bus.seatType,
      isAC: bus.isAC,
      stops: bus.stops,
      seats: bus.seats.map(s => ({
        seatNumber: s.seatNumber,
        isAvailable: s.isAvailable,
        row: s.row,
        column: s.column,
        seatType: s.seatType,
        ...(s.sleeperLevel ? { sleeperLevel: s.sleeperLevel } : {}),
      })),
    });
  } catch (error) {
    console.error('getBusById error:', error);
    res.status(500).json({ error: 'Failed to fetch bus details', message: error.message });
  }
};

/**
 * POST /api/buses/:busId/lock-seats
 * Lock seats temporarily (2-minute reservation timer)
 */
const lockSeats = async (req, res) => {
  try {
    const { busId } = req.params;
    const { seats, sessionId } = req.body;

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: 'seats array is required' });
    }

    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    const now = new Date();
    const lockExpiry = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes

    // Check all seats are available
    for (const seatNum of seats) {
      const seat = bus.seats.find(s => s.seatNumber === seatNum);
      if (!seat) return res.status(400).json({ error: `Seat ${seatNum} not found` });
      if (!seat.isAvailable) {
        // If locked by same session, allow re-lock
        if (seat.lockedBy !== sessionId) {
          return res.status(409).json({ error: `Seat ${seatNum} is not available` });
        }
      }
    }

    // Lock the seats
    bus.seats.forEach(seat => {
      if (seats.includes(seat.seatNumber)) {
        seat.isAvailable = false;
        seat.lockedUntil = lockExpiry;
        seat.lockedBy = sessionId;
      }
    });

    bus.availableSeats = bus.seats.filter(s => s.isAvailable).length;
    await bus.save();

    res.json({ message: 'Seats locked successfully', lockedUntil: lockExpiry });
  } catch (error) {
    console.error('lockSeats error:', error);
    res.status(500).json({ error: 'Failed to lock seats', message: error.message });
  }
};

// Helper to parse time string like "09:00 AM" to hour number
const parseTimeToHour = (timeStr) => {
  if (!timeStr) return 0;
  const [time, period] = timeStr.split(' ');
  let [hours] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours;
};

module.exports = { getBuses, getBusById, lockSeats };
