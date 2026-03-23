/**
 * reseed.js — Drop the buses collection and re-insert all seed data.
 * Usage:  npm run reseed   (from the backend folder)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-booking';

/* ── helpers from db.js ── */
const generateSeats = (total, seatType) => {
  const seats = [];
  if (seatType === 'sleeper') {
    let seatNum = 1, row = 1;
    while (seatNum <= total) {
      for (let col = 1; col <= 4 && seatNum <= total; col++)
        seats.push({ seatNumber: seatNum++, isAvailable: true, row, column: col, seatType, sleeperLevel: col <= 2 ? 'lower' : 'upper' });
      row++;
    }
  } else {
    let seatNum = 1, row = 1;
    while (seatNum <= total) {
      for (let col = 1; col <= 4 && seatNum <= total; col++)
        seats.push({ seatNumber: seatNum++, isAvailable: true, row, column: col, seatType, sleeperLevel: null });
      row++;
    }
  }
  return seats;
};

const randomlyBook = (seats) => {
  const ratio = 0.25 + Math.random() * 0.15;
  const toBook = Math.floor(seats.length * ratio);
  [...seats].sort(() => Math.random() - 0.5).slice(0, toBook).forEach(s => { s.isAvailable = false; });
  return seats;
};

/* ── import db.js RAW data by requiring the parent module ──
   We just rebuild the same RAW array here, pulling it from config/db.js
   via a dynamic require so this file stays in sync automatically.         */
async function run() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // Load Bus model
  const Bus = require('../models/Bus');

  // Drop existing buses
  const deleted = await Bus.deleteMany({});
  console.log(`🗑️  Removed ${deleted.deletedCount} existing buses.`);

  // Re-run seed by importing the seed function
  // We call connectDB which will see count=0 and re-seed
  await mongoose.disconnect();
  console.log('Disconnected – reconnecting via connectDB to trigger auto-seed…');

  const connectDB = require('../config/db');
  await connectDB();

  console.log('\n✅ Reseed complete. Disconnecting…');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Reseed failed:', err.message);
  process.exit(1);
});
