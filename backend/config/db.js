const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-booking');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

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

/*
  ╔══════════════════════════════════════════════════════╗
  ║           CITIES COVERED IN SEED DATA                ║
  ╠══════════════════════════════════════════════════════╣
  ║  Agra          Ahmedabad     Bangalore   Bhopal      ║
  ║  Bhubaneswar   Chennai       Chandigarh  Delhi       ║
  ║  Goa           Hyderabad     Indore      Jaipur      ║
  ║  Kochi         Kolkata       Lucknow     Mumbai      ║
  ║  Nagpur        Pune          Surat       Varanasi    ║
  ╚══════════════════════════════════════════════════════╝
*/

/* ─────────────────────────── SEAT GENERATOR ─────────────────────────── */
const generateSeats = (total, seatType) => {
  const seats = [];
  if (seatType === 'sleeper') {
    let seatNum = 1, row = 1;
    while (seatNum <= total) {
      for (let col = 1; col <= 4 && seatNum <= total; col++) {
        seats.push({ seatNumber: seatNum++, isAvailable: true, row, column: col, seatType, sleeperLevel: col <= 2 ? 'lower' : 'upper' });
      }
      row++;
    }
  } else {
    let seatNum = 1, row = 1;
    while (seatNum <= total) {
      for (let col = 1; col <= 4 && seatNum <= total; col++) {
        seats.push({ seatNumber: seatNum++, isAvailable: true, row, column: col, seatType, sleeperLevel: null });
      }
      row++;
    }
  }
  return seats;
};

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

    /* ══════════════════════════════════════
       Bangalore ↔ Chennai
    ══════════════════════════════════════ */
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

    /* ══════════════════════════════════════
       Chennai → Bangalore
    ══════════════════════════════════════ */
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

    /* ══════════════════════════════════════
       Bangalore ↔ Delhi
    ══════════════════════════════════════ */
    {
      name: 'Karnataka Express',
      departureCity: 'Bangalore', arrivalCity: 'Delhi',
      stops: [
        { stopName: 'Bangalore', departureTime: '06:00 PM' },
        { stopName: 'Hyderabad', arrivalTime: '11:30 PM', departureTime: '11:45 PM' },
        { stopName: 'Nagpur', arrivalTime: '06:00 AM', departureTime: '06:15 AM' },
        { stopName: 'Delhi', arrivalTime: '08:00 PM' },
      ],
      price: 2500, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },
    {
      name: 'Capital Cruiser',
      departureCity: 'Bangalore', arrivalCity: 'Delhi',
      stops: [
        { stopName: 'Bangalore', departureTime: '08:00 AM' },
        { stopName: 'Pune', arrivalTime: '03:00 PM', departureTime: '03:15 PM' },
        { stopName: 'Nagpur', arrivalTime: '10:00 PM', departureTime: '10:15 PM' },
        { stopName: 'Delhi', arrivalTime: '10:00 AM' },
      ],
      price: 1999, seatType: 'semi-sleeper', isAC: true, totalSeats: 36,
    },
    {
      name: 'Delhi ↔ Bangalore Nonstop',
      departureCity: 'Delhi', arrivalCity: 'Bangalore',
      stops: [
        { stopName: 'Delhi', departureTime: '05:00 PM' },
        { stopName: 'Nagpur', arrivalTime: '05:00 AM', departureTime: '05:15 AM' },
        { stopName: 'Bangalore', arrivalTime: '05:00 PM' },
      ],
      price: 2800, seatType: 'sleeper', isAC: true, totalSeats: 30,
    },

    /* ══════════════════════════════════════
       Mumbai ↔ Pune
    ══════════════════════════════════════ */
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

    /* ══════════════════════════════════════
       Delhi ↔ Agra
    ══════════════════════════════════════ */
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

    /* ══════════════════════════════════════
       Hyderabad ↔ Bangalore
    ══════════════════════════════════════ */
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
    {
      name: 'Deccan Queen',
      departureCity: 'Bangalore', arrivalCity: 'Hyderabad',
      stops: [
        { stopName: 'Bangalore', departureTime: '09:00 PM' },
        { stopName: 'Kurnool', arrivalTime: '02:30 AM', departureTime: '02:45 AM' },
        { stopName: 'Hyderabad', arrivalTime: '06:00 AM' },
      ],
      price: 1100, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },

    /* ══════════════════════════════════════
       Jaipur ↔ Delhi
    ══════════════════════════════════════ */
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
    {
      name: 'Delhi to Jaipur Fast',
      departureCity: 'Delhi', arrivalCity: 'Jaipur',
      stops: [
        { stopName: 'Delhi', departureTime: '06:00 AM' },
        { stopName: 'Jaipur', arrivalTime: '11:00 AM' },
      ],
      price: 700, seatType: 'normal', isAC: true, totalSeats: 44,
    },

    /* ══════════════════════════════════════
       Mumbai ↔ Goa
    ══════════════════════════════════════ */
    {
      name: 'Goa Express Sleeper',
      departureCity: 'Mumbai', arrivalCity: 'Goa',
      stops: [
        { stopName: 'Mumbai', departureTime: '05:00 PM' },
        { stopName: 'Ratnagiri', arrivalTime: '10:00 PM', departureTime: '10:15 PM' },
        { stopName: 'Goa', arrivalTime: '06:00 AM' },
      ],
      price: 1600, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },
    {
      name: 'Konkan Traveller',
      departureCity: 'Mumbai', arrivalCity: 'Goa',
      stops: [
        { stopName: 'Mumbai', departureTime: '08:00 PM' },
        { stopName: 'Goa', arrivalTime: '07:00 AM' },
      ],
      price: 1200, seatType: 'semi-sleeper', isAC: false, totalSeats: 40,
    },
    {
      name: 'Goa to Mumbai Beach Rider',
      departureCity: 'Goa', arrivalCity: 'Mumbai',
      stops: [
        { stopName: 'Goa', departureTime: '06:00 PM' },
        { stopName: 'Ratnagiri', arrivalTime: '11:00 PM', departureTime: '11:15 PM' },
        { stopName: 'Mumbai', arrivalTime: '06:00 AM' },
      ],
      price: 1600, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },

    /* ══════════════════════════════════════
       Kolkata ↔ Bhubaneswar
    ══════════════════════════════════════ */
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
    {
      name: 'Bay of Bengal Cruiser',
      departureCity: 'Bhubaneswar', arrivalCity: 'Kolkata',
      stops: [
        { stopName: 'Bhubaneswar', departureTime: '08:00 PM' },
        { stopName: 'Kharagpur', arrivalTime: '01:30 AM', departureTime: '01:45 AM' },
        { stopName: 'Kolkata', arrivalTime: '04:00 AM' },
      ],
      price: 800, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },

    /* ══════════════════════════════════════
       Ahmedabad ↔ Mumbai
    ══════════════════════════════════════ */
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
    {
      name: 'Saurashtra Express',
      departureCity: 'Ahmedabad', arrivalCity: 'Mumbai',
      stops: [
        { stopName: 'Ahmedabad', departureTime: '07:00 AM' },
        { stopName: 'Surat', arrivalTime: '10:30 AM', departureTime: '10:45 AM' },
        { stopName: 'Mumbai', arrivalTime: '02:00 PM' },
      ],
      price: 900, seatType: 'normal', isAC: true, totalSeats: 44,
    },
    {
      name: 'Mumbai to Ahmedabad Fast',
      departureCity: 'Mumbai', arrivalCity: 'Ahmedabad',
      stops: [
        { stopName: 'Mumbai', departureTime: '10:00 PM' },
        { stopName: 'Surat', arrivalTime: '02:00 AM', departureTime: '02:15 AM' },
        { stopName: 'Ahmedabad', arrivalTime: '06:00 AM' },
      ],
      price: 1200, seatType: 'sleeper', isAC: true, totalSeats: 36,
    },

    /* ══════════════════════════════════════
       Delhi ↔ Lucknow
    ══════════════════════════════════════ */
    {
      name: 'UP Roadways Deluxe',
      departureCity: 'Delhi', arrivalCity: 'Lucknow',
      stops: [
        { stopName: 'Delhi', departureTime: '06:00 AM' },
        { stopName: 'Agra', arrivalTime: '08:30 AM', departureTime: '08:45 AM' },
        { stopName: 'Lucknow', arrivalTime: '01:00 PM' },
      ],
      price: 600, seatType: 'normal', isAC: true, totalSeats: 44,
    },
    {
      name: 'Nawab Express Sleeper',
      departureCity: 'Delhi', arrivalCity: 'Lucknow',
      stops: [
        { stopName: 'Delhi', departureTime: '10:00 PM' },
        { stopName: 'Lucknow', arrivalTime: '05:00 AM' },
      ],
      price: 1100, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },
    {
      name: 'Lucknow to Delhi AC',
      departureCity: 'Lucknow', arrivalCity: 'Delhi',
      stops: [
        { stopName: 'Lucknow', departureTime: '07:00 AM' },
        { stopName: 'Agra', arrivalTime: '11:30 AM', departureTime: '11:45 AM' },
        { stopName: 'Delhi', arrivalTime: '02:00 PM' },
      ],
      price: 650, seatType: 'normal', isAC: true, totalSeats: 40,
    },

    /* ══════════════════════════════════════
       Delhi ↔ Chandigarh
    ══════════════════════════════════════ */
    {
      name: 'Chandigarh Express',
      departureCity: 'Delhi', arrivalCity: 'Chandigarh',
      stops: [
        { stopName: 'Delhi', departureTime: '08:00 AM' },
        { stopName: 'Chandigarh', arrivalTime: '12:00 PM' },
      ],
      price: 500, seatType: 'normal', isAC: true, totalSeats: 44,
    },
    {
      name: 'Punjab Volvo Night',
      departureCity: 'Delhi', arrivalCity: 'Chandigarh',
      stops: [
        { stopName: 'Delhi', departureTime: '11:00 PM' },
        { stopName: 'Chandigarh', arrivalTime: '03:30 AM' },
      ],
      price: 900, seatType: 'semi-sleeper', isAC: true, totalSeats: 36,
    },
    {
      name: 'Chandigarh to Delhi Commuter',
      departureCity: 'Chandigarh', arrivalCity: 'Delhi',
      stops: [
        { stopName: 'Chandigarh', departureTime: '06:00 AM' },
        { stopName: 'Delhi', arrivalTime: '10:30 AM' },
      ],
      price: 520, seatType: 'normal', isAC: true, totalSeats: 44,
    },

    /* ══════════════════════════════════════
       Mumbai ↔ Nagpur
    ══════════════════════════════════════ */
    {
      name: 'Vidarbha Express',
      departureCity: 'Mumbai', arrivalCity: 'Nagpur',
      stops: [
        { stopName: 'Mumbai', departureTime: '07:00 PM' },
        { stopName: 'Nashik', arrivalTime: '10:00 PM', departureTime: '10:15 PM' },
        { stopName: 'Nagpur', arrivalTime: '06:00 AM' },
      ],
      price: 1300, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },
    {
      name: 'Nagpur to Mumbai Budget',
      departureCity: 'Nagpur', arrivalCity: 'Mumbai',
      stops: [
        { stopName: 'Nagpur', departureTime: '06:00 PM' },
        { stopName: 'Nashik', arrivalTime: '02:00 AM', departureTime: '02:15 AM' },
        { stopName: 'Mumbai', arrivalTime: '06:00 AM' },
      ],
      price: 1000, seatType: 'semi-sleeper', isAC: false, totalSeats: 40,
    },

    /* ══════════════════════════════════════
       Hyderabad ↔ Chennai
    ══════════════════════════════════════ */
    {
      name: 'Nizam Express',
      departureCity: 'Hyderabad', arrivalCity: 'Chennai',
      stops: [
        { stopName: 'Hyderabad', departureTime: '09:00 PM' },
        { stopName: 'Nellore', arrivalTime: '01:30 AM', departureTime: '01:45 AM' },
        { stopName: 'Chennai', arrivalTime: '06:00 AM' },
      ],
      price: 1100, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },
    {
      name: 'Chennai to Hyderabad Day Bus',
      departureCity: 'Chennai', arrivalCity: 'Hyderabad',
      stops: [
        { stopName: 'Chennai', departureTime: '06:00 AM' },
        { stopName: 'Nellore', arrivalTime: '10:30 AM', departureTime: '10:45 AM' },
        { stopName: 'Hyderabad', arrivalTime: '03:00 PM' },
      ],
      price: 900, seatType: 'normal', isAC: true, totalSeats: 44,
    },

    /* ══════════════════════════════════════
       Bangalore ↔ Kochi
    ══════════════════════════════════════ */
    {
      name: 'Kerala Express Sleeper',
      departureCity: 'Bangalore', arrivalCity: 'Kochi',
      stops: [
        { stopName: 'Bangalore', departureTime: '08:00 PM' },
        { stopName: 'Mysore', arrivalTime: '10:30 PM', departureTime: '10:45 PM' },
        { stopName: 'Kochi', arrivalTime: '06:00 AM' },
      ],
      price: 1500, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },
    {
      name: 'Kochi to Bangalore AC',
      departureCity: 'Kochi', arrivalCity: 'Bangalore',
      stops: [
        { stopName: 'Kochi', departureTime: '07:00 PM' },
        { stopName: 'Mysore', arrivalTime: '03:00 AM', departureTime: '03:15 AM' },
        { stopName: 'Bangalore', arrivalTime: '06:00 AM' },
      ],
      price: 1400, seatType: 'semi-sleeper', isAC: true, totalSeats: 36,
    },

    /* ══════════════════════════════════════
       Delhi ↔ Varanasi
    ══════════════════════════════════════ */
    {
      name: 'Kashi Yatra Sleeper',
      departureCity: 'Delhi', arrivalCity: 'Varanasi',
      stops: [
        { stopName: 'Delhi', departureTime: '06:00 PM' },
        { stopName: 'Lucknow', arrivalTime: '11:00 PM', departureTime: '11:15 PM' },
        { stopName: 'Varanasi', arrivalTime: '05:00 AM' },
      ],
      price: 1200, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },
    {
      name: 'Varanasi to Delhi Express',
      departureCity: 'Varanasi', arrivalCity: 'Delhi',
      stops: [
        { stopName: 'Varanasi', departureTime: '07:00 PM' },
        { stopName: 'Lucknow', arrivalTime: '12:00 AM', departureTime: '12:15 AM' },
        { stopName: 'Delhi', arrivalTime: '07:00 AM' },
      ],
      price: 1100, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },

    /* ══════════════════════════════════════
       Mumbai ↔ Indore
    ══════════════════════════════════════ */
    {
      name: 'Malwa Express',
      departureCity: 'Mumbai', arrivalCity: 'Indore',
      stops: [
        { stopName: 'Mumbai', departureTime: '08:00 PM' },
        { stopName: 'Nashik', arrivalTime: '11:00 PM', departureTime: '11:15 PM' },
        { stopName: 'Indore', arrivalTime: '07:00 AM' },
      ],
      price: 1100, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },
    {
      name: 'Indore to Mumbai Night Bus',
      departureCity: 'Indore', arrivalCity: 'Mumbai',
      stops: [
        { stopName: 'Indore', departureTime: '07:00 PM' },
        { stopName: 'Nashik', arrivalTime: '03:00 AM', departureTime: '03:15 AM' },
        { stopName: 'Mumbai', arrivalTime: '07:00 AM' },
      ],
      price: 1050, seatType: 'semi-sleeper', isAC: false, totalSeats: 40,
    },

    /* ══════════════════════════════════════
       Delhi ↔ Bhopal
    ══════════════════════════════════════ */
    {
      name: 'MP Tourism Deluxe',
      departureCity: 'Delhi', arrivalCity: 'Bhopal',
      stops: [
        { stopName: 'Delhi', departureTime: '08:00 PM' },
        { stopName: 'Agra', arrivalTime: '11:00 PM', departureTime: '11:15 PM' },
        { stopName: 'Bhopal', arrivalTime: '07:00 AM' },
      ],
      price: 900, seatType: 'sleeper', isAC: true, totalSeats: 36,
    },
    {
      name: 'Bhopal to Delhi Fast',
      departureCity: 'Bhopal', arrivalCity: 'Delhi',
      stops: [
        { stopName: 'Bhopal', departureTime: '07:00 PM' },
        { stopName: 'Agra', arrivalTime: '02:30 AM', departureTime: '02:45 AM' },
        { stopName: 'Delhi', arrivalTime: '06:00 AM' },
      ],
      price: 950, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },

    /* ══════════════════════════════════════
       Kolkata ↔ Delhi
    ══════════════════════════════════════ */

    {
      name: 'Bengal to Capital Sleeper',
      departureCity: 'Kolkata', arrivalCity: 'Delhi',
      stops: [
        { stopName: 'Kolkata', departureTime: '04:00 PM' },
        { stopName: 'Varanasi', arrivalTime: '02:00 AM', departureTime: '02:15 AM' },
        { stopName: 'Delhi', arrivalTime: '02:00 PM' },
      ],
      price: 2200, seatType: 'sleeper', isAC: true, totalSeats: 30,
    },
    {
      name: 'Delhi to Kolkata Express',
      departureCity: 'Delhi', arrivalCity: 'Kolkata',
      stops: [
        { stopName: 'Delhi', departureTime: '05:00 PM' },
        { stopName: 'Varanasi', arrivalTime: '03:00 AM', departureTime: '03:15 AM' },
        { stopName: 'Kolkata', arrivalTime: '03:00 PM' },
      ],
      price: 2000, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },

    /* ══════════════════════════════════════
       Delhi ↔ Mumbai
    ══════════════════════════════════════ */
    {
      name: 'Rajdhani Roadliner',
      departureCity: 'Delhi', arrivalCity: 'Mumbai',
      stops: [
        { stopName: 'Delhi', departureTime: '06:00 PM' },
        { stopName: 'Jaipur', arrivalTime: '10:30 PM', departureTime: '10:45 PM' },
        { stopName: 'Udaipur', arrivalTime: '04:30 AM', departureTime: '04:45 AM' },
        { stopName: 'Mumbai', arrivalTime: '04:00 PM' },
      ],
      price: 2400, seatType: 'sleeper', isAC: true, totalSeats: 32,
    },
    {
      name: 'Capital Express Semi-Sleeper',
      departureCity: 'Delhi', arrivalCity: 'Mumbai',
      stops: [
        { stopName: 'Delhi', departureTime: '08:00 AM' },
        { stopName: 'Kota', arrivalTime: '02:00 PM', departureTime: '02:15 PM' },
        { stopName: 'Vadodara', arrivalTime: '10:00 PM', departureTime: '10:15 PM' },
        { stopName: 'Mumbai', arrivalTime: '08:00 AM' },
      ],
      price: 1800, seatType: 'semi-sleeper', isAC: true, totalSeats: 36,
    },
    {
      name: 'Metro Connector Night Bus',
      departureCity: 'Delhi', arrivalCity: 'Mumbai',
      stops: [
        { stopName: 'Delhi', departureTime: '05:00 PM' },
        { stopName: 'Ajmer', arrivalTime: '10:00 PM', departureTime: '10:15 PM' },
        { stopName: 'Ahmedabad', arrivalTime: '05:00 AM', departureTime: '05:15 AM' },
        { stopName: 'Mumbai', arrivalTime: '02:00 PM' },
      ],
      price: 1600, seatType: 'normal', isAC: false, totalSeats: 44,
    },

    {
      name: 'Mumbai Delhi Super Sleeper',
      departureCity: 'Mumbai', arrivalCity: 'Delhi',
      stops: [
        { stopName: 'Mumbai', departureTime: '05:00 PM' },
        { stopName: 'Vadodara', arrivalTime: '11:00 PM', departureTime: '11:15 PM' },
        { stopName: 'Kota', arrivalTime: '06:00 AM', departureTime: '06:15 AM' },
        { stopName: 'Delhi', arrivalTime: '04:00 PM' },
      ],
      price: 2500, seatType: 'sleeper', isAC: true, totalSeats: 30,
    },
    {
      name: 'Western Express Deluxe',
      departureCity: 'Mumbai', arrivalCity: 'Delhi',
      stops: [
        { stopName: 'Mumbai', departureTime: '07:00 AM' },
        { stopName: 'Surat', arrivalTime: '10:30 AM', departureTime: '10:45 AM' },
        { stopName: 'Jaipur', arrivalTime: '02:00 AM', departureTime: '02:15 AM' },
        { stopName: 'Delhi', arrivalTime: '10:00 AM' },
      ],
      price: 1700, seatType: 'semi-sleeper', isAC: true, totalSeats: 40,
    },
    {
      name: 'Gateway Budget Express',
      departureCity: 'Mumbai', arrivalCity: 'Delhi',
      stops: [
        { stopName: 'Mumbai', departureTime: '06:00 PM' },
        { stopName: 'Ahmedabad', arrivalTime: '11:30 PM', departureTime: '11:45 PM' },
        { stopName: 'Jaipur', arrivalTime: '07:00 AM', departureTime: '07:15 AM' },
        { stopName: 'Delhi', arrivalTime: '12:00 PM' },
      ],
      price: 1400, seatType: 'normal', isAC: false, totalSeats: 48,
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