const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-booking');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed on first run
    const Bus = require('../models/Bus');
    const count = await Bus.countDocuments();
    if (count === 0) {
      console.log('Empty database detected — running seed…');
      await seedData();
    } else {
      console.log(`Database ready: ${count} buses found.`);
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

/* ─────────────────────────── SEAT GENERATOR ─────────────────────────── */

/**
 * Generates a seat array for a bus.
 * Normal / Semi-sleeper: 4 seats per row (2 left | aisle | 2 right)
 * Sleeper: 2 columns (lower/upper berths), 2 per row side
 */
const generateSeats = (total, seatType) => {
  const seats = [];

  if (seatType === 'sleeper') {
    // Sleeper: columns 1-2 = lower, 3-4 = upper (visual berth stacking)
    let seatNum = 1;
    let row = 1;
    while (seatNum <= total) {
      for (let col = 1; col <= 4 && seatNum <= total; col++) {
        seats.push({
          seatNumber: seatNum++,
          isAvailable: true,
          row,
          column: col,
          seatType,
          sleeperLevel: col <= 2 ? 'lower' : 'upper',
        });
      }
      row++;
    }
  } else {
    // Normal / semi-sleeper: 4 cols per row
    let seatNum = 1;
    let row = 1;
    while (seatNum <= total) {
      for (let col = 1; col <= 4 && seatNum <= total; col++) {
        seats.push({
          seatNumber: seatNum++,
          isAvailable: true,
          row,
          column: col,
          seatType,
          sleeperLevel: null,
        });
      }
      row++;
    }
  }
  return seats;
};

/** Randomly mark ~25–40% of seats as booked for realism */
const randomlyBook = (seats) => {
  const ratio = 0.25 + Math.random() * 0.15;
  const toBook = Math.floor(seats.length * ratio);
  const shuffled = [...seats].sort(() => Math.random() - 0.5);
  shuffled.slice(0, toBook).forEach(s => { s.isAvailable = false; });
  return seats;
};

/* ─────────────────────────── SEED DATA ─────────────────────────── */

const seedData = async () => {
  const Bus = require('../models/Bus');

  const RAW = [
    /* ── Bangalore ↔ Chennai ── */
    {
      name: 'KSRTC Airavat Club Class',
      departureCity: 'Bangalore', arrivalCity: 'Chennai',
      stops: [
        { stopName: 'Bangalore', departureTime: '06:00 AM' },
        { stopName: 'Hosur', arrivalTime: '07:00 AM', departureTime: '07:10 AM' },
        { stopName: 'Vellore', arrivalTime: '10:00 AM', departureTime: '10:15 AM' },
        { stopName: 'Chennai', arrivalTime: '01:00 PM' },
      ],
      price: 950, seatType: 'normal', isAC: true, totalSeats: 40,
    },
    {
      name: 'SRS Travels Express',
      departureCity: 'Bangalore', arrivalCity: 'Chennai',
      stops: [
        { stopName: 'Bangalore', departureTime: '12:00 PM' },
        { stopName: 'Krishnagiri', arrivalTime: '01:30 PM', departureTime: '01:45 PM' },
        { stopName: 'Chennai', arrivalTime: '06:00 PM' },
      ],
      price: 600, seatType: 'normal', isAC: false, totalSeats: 40,
    },
    {
      name: 'IntrCity SmartBus',
      departureCity: 'Bangalore', arrivalCity: 'Chennai',
      stops: [
        { stopName: 'Bangalore', departureTime: '10:00 PM' },
        { stopName: 'Chennai', arrivalTime: '05:00 AM' },
      ],
      price: 1800, seatType: 'sleeper', isAC: true, totalSeats: 28,
    },
    {
      name: 'VRL Sleeper Plus',
      departureCity: 'Bangalore', arrivalCity: 'Chennai',
      stops: [
        { stopName: 'Bangalore', departureTime: '09:30 PM' },
        { stopName: 'Vellore', arrivalTime: '01:00 AM', departureTime: '01:15 AM' },
        { stopName: 'Chennai', arrivalTime: '04:30 AM' },
      ],
      price: 2100, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },
    {
      name: 'RedBus Primo Semi-Sleeper',
      departureCity: 'Bangalore', arrivalCity: 'Chennai',
      stops: [
        { stopName: 'Bangalore', departureTime: '04:30 PM' },
        { stopName: 'Hosur', arrivalTime: '05:30 PM', departureTime: '05:40 PM' },
        { stopName: 'Vellore', arrivalTime: '08:30 PM', departureTime: '08:45 PM' },
        { stopName: 'Chennai', arrivalTime: '11:30 PM' },
      ],
      price: 1350, seatType: 'semi-sleeper', isAC: true, totalSeats: 36,
    },

    /* ── Chennai → Bangalore ── */
    {
      name: 'Night Rider Deluxe',
      departureCity: 'Chennai', arrivalCity: 'Bangalore',
      stops: [
        { stopName: 'Chennai', departureTime: '10:30 PM' },
        { stopName: 'Vellore', arrivalTime: '01:00 AM', departureTime: '01:15 AM' },
        { stopName: 'Bangalore', arrivalTime: '06:00 AM' },
      ],
      price: 1650, seatType: 'semi-sleeper', isAC: true, totalSeats: 36,
    },
    {
      name: 'TN Travels Budget',
      departureCity: 'Chennai', arrivalCity: 'Bangalore',
      stops: [
        { stopName: 'Chennai', departureTime: '07:30 AM' },
        { stopName: 'Bangalore', arrivalTime: '02:30 PM' },
      ],
      price: 550, seatType: 'normal', isAC: false, totalSeats: 48,
    },

    /* ── Mumbai ↔ Pune ── */
    {
      name: 'Orange City Express',
      departureCity: 'Mumbai', arrivalCity: 'Pune',
      stops: [
        { stopName: 'Mumbai', departureTime: '07:00 AM' },
        { stopName: 'Khopoli', arrivalTime: '08:30 AM', departureTime: '08:40 AM' },
        { stopName: 'Pune', arrivalTime: '10:30 AM' },
      ],
      price: 400, seatType: 'normal', isAC: false, totalSeats: 44,
    },
    {
      name: 'Volvo AC Premium',
      departureCity: 'Mumbai', arrivalCity: 'Pune',
      stops: [
        { stopName: 'Mumbai', departureTime: '08:30 AM' },
        { stopName: 'Pune', arrivalTime: '11:45 AM' },
      ],
      price: 850, seatType: 'semi-sleeper', isAC: true, totalSeats: 36,
    },
    {
      name: 'Shivneri Luxury',
      departureCity: 'Mumbai', arrivalCity: 'Pune',
      stops: [
        { stopName: 'Mumbai', departureTime: '02:00 PM' },
        { stopName: 'Pune', arrivalTime: '05:30 PM' },
      ],
      price: 1100, seatType: 'semi-sleeper', isAC: true, totalSeats: 36,
    },
    {
      name: 'Pune Night Cruiser',
      departureCity: 'Mumbai', arrivalCity: 'Pune',
      stops: [
        { stopName: 'Mumbai', departureTime: '11:30 PM' },
        { stopName: 'Pune', arrivalTime: '03:00 AM' },
      ],
      price: 1500, seatType: 'sleeper', isAC: true, totalSeats: 28,
    },

    /* ── Delhi ↔ Agra ── */
    {
      name: 'Delhi Express',
      departureCity: 'Delhi', arrivalCity: 'Agra',
      stops: [
        { stopName: 'Delhi', departureTime: '06:00 AM' },
        { stopName: 'Mathura', arrivalTime: '08:00 AM', departureTime: '08:10 AM' },
        { stopName: 'Agra', arrivalTime: '09:30 AM' },
      ],
      price: 350, seatType: 'normal', isAC: false, totalSeats: 48,
    },
    {
      name: 'Agra Darshan Sleeper',
      departureCity: 'Delhi', arrivalCity: 'Agra',
      stops: [
        { stopName: 'Delhi', departureTime: '09:00 PM' },
        { stopName: 'Agra', arrivalTime: '11:30 PM' },
      ],
      price: 950, seatType: 'sleeper', isAC: true, totalSeats: 28,
    },
    {
      name: 'Yamuna Rider',
      departureCity: 'Delhi', arrivalCity: 'Agra',
      stops: [
        { stopName: 'Delhi', departureTime: '01:00 PM' },
        { stopName: 'Mathura', arrivalTime: '02:45 PM', departureTime: '02:55 PM' },
        { stopName: 'Agra', arrivalTime: '04:00 PM' },
      ],
      price: 500, seatType: 'normal', isAC: true, totalSeats: 40,
    },

    /* ── Hyderabad ↔ Bangalore ── */
    {
      name: 'Greenline Sleeper',
      departureCity: 'Hyderabad', arrivalCity: 'Bangalore',
      stops: [
        { stopName: 'Hyderabad', departureTime: '08:00 PM' },
        { stopName: 'Kurnool', arrivalTime: '11:30 PM', departureTime: '11:45 PM' },
        { stopName: 'Bangalore', arrivalTime: '05:30 AM' },
      ],
      price: 1200, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },
    {
      name: 'Patel Travels Semi-Sleeper',
      departureCity: 'Hyderabad', arrivalCity: 'Bangalore',
      stops: [
        { stopName: 'Hyderabad', departureTime: '04:00 PM' },
        { stopName: 'Kurnool', arrivalTime: '07:15 PM', departureTime: '07:30 PM' },
        { stopName: 'Bangalore', arrivalTime: '01:30 AM' },
      ],
      price: 800, seatType: 'semi-sleeper', isAC: false, totalSeats: 40,
    },
    {
      name: 'TSRTC Garuda Plus',
      departureCity: 'Hyderabad', arrivalCity: 'Bangalore',
      stops: [
        { stopName: 'Hyderabad', departureTime: '06:30 AM' },
        { stopName: 'Kurnool', arrivalTime: '10:00 AM', departureTime: '10:15 AM' },
        { stopName: 'Bangalore', arrivalTime: '05:00 PM' },
      ],
      price: 900, seatType: 'normal', isAC: true, totalSeats: 44,
    },

    /* ── Jaipur → Delhi ── */
    {
      name: 'Pink City Flyer',
      departureCity: 'Jaipur', arrivalCity: 'Delhi',
      stops: [
        { stopName: 'Jaipur', departureTime: '07:00 AM' },
        { stopName: 'Gurugram', arrivalTime: '11:30 AM', departureTime: '11:45 AM' },
        { stopName: 'Delhi', arrivalTime: '01:00 PM' },
      ],
      price: 650, seatType: 'normal', isAC: true, totalSeats: 40,
    },
    {
      name: 'Rajputana Sleeper',
      departureCity: 'Jaipur', arrivalCity: 'Delhi',
      stops: [
        { stopName: 'Jaipur', departureTime: '11:00 PM' },
        { stopName: 'Delhi', arrivalTime: '04:30 AM' },
      ],
      price: 1400, seatType: 'sleeper', isAC: true, totalSeats: 30,
    },

    /* ── Kolkata → Bhubaneswar ── */
    {
      name: 'Eastern Star Express',
      departureCity: 'Kolkata', arrivalCity: 'Bhubaneswar',
      stops: [
        { stopName: 'Kolkata', departureTime: '05:30 PM' },
        { stopName: 'Kharagpur', arrivalTime: '07:30 PM', departureTime: '07:45 PM' },
        { stopName: 'Bhubaneswar', arrivalTime: '01:00 AM' },
      ],
      price: 750, seatType: 'semi-sleeper', isAC: true, totalSeats: 36,
    },

    /* ── Ahmedabad → Mumbai ── */
    {
      name: 'Gujarat Mail Sleeper',
      departureCity: 'Ahmedabad', arrivalCity: 'Mumbai',
      stops: [
        { stopName: 'Ahmedabad', departureTime: '09:00 PM' },
        { stopName: 'Surat', arrivalTime: '12:30 AM', departureTime: '12:45 AM' },
        { stopName: 'Mumbai', arrivalTime: '06:30 AM' },
      ],
      price: 1350, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },
  ];

  const busDocuments = RAW.map(raw => {
    const seats = randomlyBook(generateSeats(raw.totalSeats, raw.seatType));
    return {
      ...raw,
      seats,
      availableSeats: seats.filter(s => s.isAvailable).length,
    };
  });

  await Bus.insertMany(busDocuments);
  console.log(`✅ Seed complete: ${busDocuments.length} buses inserted.`);
};

module.exports = connectDB;
