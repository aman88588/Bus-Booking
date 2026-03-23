import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Bus APIs
export const searchBuses = (params) => api.get('/buses', { params });
export const getBusDetails = (busId) => api.get(`/buses/${busId}`);
export const lockSeats = (busId, seats, sessionId) =>
  api.post(`/buses/${busId}/lock-seats`, { seats, sessionId });

// Booking APIs
export const createBooking = (bookingData) => api.post('/bookings', bookingData);

export default api;
//M 