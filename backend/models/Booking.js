const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const PassengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  busId: { type: String, ref: 'Bus', required: true },
  seats: [{ type: Number }],
  passengerDetails: [PassengerSchema],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
}, {
  timestamps: true,
  versionKey: false,
});

module.exports = mongoose.model('Booking', BookingSchema);
