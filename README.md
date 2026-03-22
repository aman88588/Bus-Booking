# 🚌 BusGo — Bus Booking System

A full-stack Bus Booking System built with **React** (frontend) and **Node.js + Express** (backend, MVC architecture), backed by **MongoDB**.

---

## 📁 Project Structure

```
bus-booking/
├── backend/              # Node.js + Express MVC
│   ├── config/
│   │   └── db.js         # MongoDB connection + seed data
│   ├── controllers/
│   │   ├── busController.js
│   │   └── bookingController.js
│   ├── models/
│   │   ├── Bus.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── busRoutes.js
│   │   └── bookingRoutes.js
│   ├── server.js
│   └── .env.example
│
└── frontend/             # React SPA
    ├── src/
    │   ├── context/      # BookingContext (global state)
    │   ├── services/     # API layer (axios)
    │   ├── components/   # Navbar
    │   └── pages/
    │       ├── Home.jsx         # Search form
    │       ├── BusList.jsx      # Results + filters
    │       ├── SeatSelection.jsx # Seat map + 2-min timer
    │       ├── BookingConfirmation.jsx # Passenger form
    │       └── BookingSuccess.jsx
    └── .env.example
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

Server runs on **http://localhost:5000**

The DB auto-seeds with 10 sample buses across popular routes on first run.

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# If backend is not on localhost:5000, update REACT_APP_API_URL
npm start
```

App runs on **http://localhost:3000**

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/buses` | Search buses with filters + pagination |
| GET | `/api/buses/:busId` | Bus details + seat layout |
| POST | `/api/buses/:busId/lock-seats` | Lock seats for 2 minutes |
| POST | `/api/bookings` | Confirm booking |

### GET /api/buses — Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `departureCity` | string | ✅ | |
| `arrivalCity` | string | ✅ | |
| `date` | string | ✅ | Format: YYYY-MM-DD |
| `seatType` | string | ❌ | normal, semi-sleeper, sleeper |
| `isAC` | boolean | ❌ | true / false |
| `departureSlot` | string | ❌ | morning, afternoon, evening, night |
| `page` | number | ❌ | Default: 1 |
| `pageSize` | number | ❌ | Default: 10, max: 50 |

---

## 🎯 Features

### Core Requirements
- ✅ Home page with departure/arrival/date search form
- ✅ Bus list with filters (seat type, AC, departure slot) + pagination
- ✅ Seat selection page with visual seat map
- ✅ Passenger details form (name, age, gender per seat)
- ✅ Booking confirmation + success page
- ✅ Full REST API with MVC backend

### Bonus Features
- ✅ **2-minute seat reservation timer** — seats are locked on server for 2 minutes; timer shown in UI with urgency styling < 30s; expired seats auto-release
- ✅ **Responsive design** — works on mobile, tablet, desktop
- ✅ **Error handling** — invalid inputs, sold-out buses, seat unavailability, API errors

---

## 🏗️ Deployment

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL=https://your-backend.onrender.com/api`
2. Run `npm run build`
3. Deploy the `build/` folder

### Backend (Render / Koyeb)
1. Set env vars: `MONGODB_URI`, `PORT`
2. Deploy — the server auto-seeds on first start

### Database (MongoDB Atlas)
1. Create a free M0 cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Whitelist `0.0.0.0/0` for access from any IP
3. Copy the connection string to `MONGODB_URI`

---

## 🛠️ Tech Stack

**Frontend:** React 18, React Router v6, Axios, CSS (custom design system, no UI library)

**Backend:** Node.js, Express.js, Mongoose, MongoDB

**Architecture:** MVC (Model-View-Controller) on backend, Context API for global state on frontend
