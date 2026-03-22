const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const StopSchema = new mongoose.Schema({
  stopName: { type: String, required: true },
  arrivalTime: { type: String },
  departureTime: { type: String },
}, { _id: false });

const SeatSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  row: { type: Number, required: true },
  column: { type: Number, required: true },
  seatType: { type: String, enum: ['normal', 'semi-sleeper', 'sleeper'], required: true },
  sleeperLevel: { type: String, enum: ['upper', 'lower'], default: null },
  lockedUntil: { type: Date, default: null },
  lockedBy: { type: String, default: null },
}, { _id: false });

const BusSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  name: { type: String, required: true },
  departureCity: { type: String, required: true },
  arrivalCity: { type: String, required: true },
  stops: [StopSchema],
  availableSeats: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  price: { type: Number, required: true },
  seatType: { type: String, enum: ['normal', 'semi-sleeper', 'sleeper'], required: true },
  isAC: { type: Boolean, default: false },
  seats: [SeatSchema],
}, {
  timestamps: true,
  versionKey: false,
});

// Index for search performance
BusSchema.index({ departureCity: 1, arrivalCity: 1 });

module.exports = mongoose.model('Bus', BusSchema);
