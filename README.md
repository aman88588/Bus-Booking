# 🚌 BusGo — Smart Bus Booking System

A full-stack Bus Booking System built with **React 18** (frontend) and **Node.js + Express** (backend, MVC architecture), backed by **MongoDB**. Book bus tickets across India instantly — search routes, filter buses, pick your seat with a live 2-minute reservation timer, fill passenger details, and download or print your e-ticket.

---

## 🚀 Table of Contents

<details open>
<summary><b>📚 Navigate the Project</b></summary>

### 🧱 Core Overview
1. 🏗️ [Project Structure](#-project-structure)  
2. ⚙️ [Tech Stack](#-tech-stack)  
3. 🚀 [Quick Start](#-quick-start)  
4. 🔐 [Environment Variables](#-environment-variables)  

### 🔄 Application Flow
5. 🔁 [Application Workflow](#-application-workflow)  

### ✨ Features Deep Dive
6. 🧩 [Feature Deep-Dives](#-feature-deep-dives)  
   - ⏳ [Seat Locking & TTL](#-seat-locking--ttl-time-to-live)  
   - 🧾 [Print Ticket](#-print-ticket)  
   - 🌱 [Auto-Seed Database](#-auto-seed-database)  
   - 🔍 [Filters & Pagination](#-filters--pagination)  
   - 🌐 [Global State (Context API)](#-global-state-context-api)  
   - 🆔 [Session ID & Idempotency](#-session-id--idempotency)  

### 🧠 Backend & Data
7. 🔗 [API Reference](#-api-reference)  
8. 🗄️ [Data Models](#-data-models)  

### 🎨 Frontend
9. 🖥️ [Frontend Pages & Routes](#-frontend-pages--routes)  

### ⚠️ Stability & Deployment
10. 🚨 [Error Handling](#-error-handling)  
11. 🚢 [Deployment](#-deployment)  

</details>
---

## 📁 Project Structure

```
├── 📁 backend
│   ├── 📁 config
│   │   └── 📄 db.js
│   ├── 📁 controllers
│   │   ├── 📄 bookingController.js
│   │   └── 📄 busController.js
│   ├── 📁 models
│   │   ├── 📄 Booking.js
│   │   └── 📄 Bus.js
│   ├── 📁 routes
│   │   ├── 📄 bookingRoutes.js
│   │   └── 📄 busRoutes.js
│   ├── 📁 scripts
│   │   └── 📄 reseed.js
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   └── 📄 server.js
├── 📁 frontend
│   ├── 📁 public
│   │   └── 🌐 index.html
│   ├── 📁 src
│   │   ├── 📁 components
│   │   │   ├── 🎨 Navbar.css
│   │   │   └── 📄 Navbar.jsx
│   │   ├── 📁 context
│   │   │   └── 📄 BookingContext.jsx
│   │   ├── 📁 pages
│   │   │   ├── 🎨 BookingConfirmation.css
│   │   │   ├── 📄 BookingConfirmation.jsx
│   │   │   ├── 🎨 BookingSuccess.css
│   │   │   ├── 📄 BookingSuccess.jsx
│   │   │   ├── 🎨 BusList.css
│   │   │   ├── 📄 BusList.jsx
│   │   │   ├── 🎨 Home.css
│   │   │   ├── 📄 Home.jsx
│   │   │   ├── 🎨 Routes.css
│   │   │   ├── 📄 Routes.jsx
│   │   │   ├── 🎨 SeatSelection.css
│   │   │   └── 📄 SeatSelection.jsx
│   │   ├── 📁 services
│   │   │   └── 📄 api.js
│   │   ├── 📄 App.js
│   │   ├── 🎨 index.css
│   │   └── 📄 index.js
│   ├── ⚙️ package-lock.json
│   └── ⚙️ package.json
├── ⚙️ .gitignore
└── 📝 README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, React Router v6, Axios, Vanilla CSS |
| **State Management** | React Context API (`BookingContext`) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (via Mongoose v8) |
| **Architecture** | MVC (Model-View-Controller) on backend |
| **IDs** | UUID v4 for Bus IDs, Booking IDs, Session IDs |
| **Dev Tools** | Nodemon (backend), Create React App (frontend) |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **MongoDB** (local `mongodb://localhost:27017` or Atlas URI)

### 1. Backend

```bash
cd backend
npm install
# Create .env (see Environment Variables section below)
npm run dev        # nodemon server.js → http://localhost:5000
```

> ✅ On first run with an empty database, the server **automatically seeds 58 buses** across 20+ routes.

> 🔄 **To re-seed the database** (e.g. after adding new buses to `db.js`):
> ```bash
> cd backend && npm run reseed
> ```
> This drops all existing buses and re-inserts everything from `db.js`.



### 2. Frontend

```bash
cd frontend
npm install
# Create .env (see Environment Variables section below)
npm start          # CRA dev server → http://localhost:3000
```

---

## 🔐 Environment Variables

### Backend — `backend/.env`

```env
MONGODB_URI=mongodb://localhost:27017/bus-booking
PORT=5000
```

### Frontend — `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
```

> If `REACT_APP_API_URL` is not set, the frontend falls back to `/api` (relative URL, useful when serving both from same origin).

---

## 🗺️ Application Workflow

The full booking journey follows a strict linear flow:

```
┌──────────────────────────────────────────────────────────┐
│  Step 1 — Home (/)                                       │
│  User enters: Departure City, Arrival City, Date         │
│  → Validates input → Submits → Redirects to Bus List     │
└─────────────────────────┬────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────┐
│  Step 2 — Bus List (/buses?departureCity=...&...)         │
│  - Fetches buses from API with query params              │
│  - Shows filters: Seat Type, AC/Non-AC, Departure Slot   │
│  - Pagination (10 per page by default)                   │
│  → User clicks "Select Seats" on a bus                   │
└─────────────────────────┬────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────┐
│  Step 3 — Seat Selection (/buses/:busId/seats)           │
│  - Visual seat map (4-column layout with aisle)          │
│  - Green = Available, Orange = Selected, Red = Booked    │
│  - Click seat → API call to lock it for 2 minutes        │
│  - Live countdown timer (MM:SS), turns red under 30s     │
│  - Timer expires → seats auto-released, user must retry  │
│  → User clicks "Proceed to Booking"                      │
└─────────────────────────┬────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────┐
│  Step 4 — Booking Confirmation (/buses/:busId/booking)   │
│  - Fill passenger details per seat (Name, Age, Gender)   │
│  - Right sidebar shows bus details + price summary       │
│  - Validates all fields before submitting                │
│  → Clicks "Confirm Booking" → API POST /api/bookings     │
└─────────────────────────┬────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────┐
│  Step 5 — Booking Success (/booking-success)             │
│  - Booking ID (first 8 chars of UUID, uppercased)        │
│  - Seats booked + total price                            │
│  - "Book Another Trip" button → back to Home             │
│  - "🖨️ Print Ticket" button → browser print dialog       │
└──────────────────────────────────────────────────────────┘
```

---

## 🔧 Feature Deep-Dives

### 🔒 Seat Locking & TTL (Time To Live)

This is the most critical feature ensuring no two users can book the same seat simultaneously.

#### How it works — Step by Step

**1. User clicks a seat on the Seat Map**

```
Frontend: handleSeatClick(seat)
  → Updates selectedSeats state
  → Calls: POST /api/buses/:busId/lock-seats
     Body: { seats: [seatNumber, ...], sessionId: "uuid-v4" }
```

**2. Backend validates and locks the seat**

```javascript
// busController.js — lockSeats()

const lockExpiry = new Date(now.getTime() + 2 * 60 * 1000); // now + 2 minutes

// Check each seat:
//  - If seat not found → 400
//  - If seat.isAvailable === false AND seat.lockedBy !== sessionId → 409 Conflict
//  - If seat.lockedBy === sessionId → allow re-lock (idempotent)

// Mark seats in MongoDB:
seat.isAvailable = false;
seat.lockedUntil = lockExpiry;      // Date: now + 2 min
seat.lockedBy = sessionId;          // UUID of the browser session

bus.availableSeats = bus.seats.filter(s => s.isAvailable).length;
await bus.save();

// Response:
{ message: "Seats locked successfully", lockedUntil: <ISO Date> }
```

**3. Frontend starts the countdown timer**

```javascript
// SeatSelection.jsx — startTimer(expiryDate)

setInterval(() => {
  const remaining = Math.floor((new Date(expiryDate) - Date.now()) / 1000);
  if (remaining <= 0) {
    clearInterval(timer);
    setTimerSeconds(0);
    setSelectedSeats([]);   // Deselect all
    fetchDetails();          // Refresh seat map (seats show as released)
  } else {
    setTimerSeconds(remaining);
  }
}, 1000);
```

**4. Visual timer states**

| Remaining | Timer style | Shown in |
|-----------|-------------|----------|
| > 30 sec | Normal badge (green/neutral) | Seat map header + booking summary |
| ≤ 30 sec | `timer-urgent` class (red, pulsing) | Same locations |
| = 0 | "⚠️ Reservation expired. Please reselect." | Seat map header |
| seats cleared | Proceed button disabled | Booking summary |

**5. Lock expiry on server (lazy release)**

The server does **not** run a background cron to release locks automatically.  
Instead, locks are released **lazily** when `GET /api/buses/:busId` is called:

```javascript
// busController.js — getBusById()

bus.seats.forEach(seat => {
  if (seat.lockedUntil && seat.lockedUntil < now && !seat.isAvailable) {
    if (seat.lockedBy) {          // Was a soft lock, not a real booking
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
```

> This means: as soon as ANY user opens the seat selection page for that bus after a lock expires, the expired locks are swept clean automatically.

**6. Booking confirms the lock permanently**

When `POST /api/bookings` is called:

```javascript
// bookingController.js — createBooking()

// Seats that are still locked (isAvailable=false, lockedBy set) ARE allowed
// Seats booked by someone else (lockedUntil expired OR no lockedBy) → 409

// On success:
seat.isAvailable = false;
seat.lockedUntil = null;   // Clear the TTL — permanently booked
seat.lockedBy = null;       // Clear session reference
```

#### Summary of seat states in MongoDB

| `isAvailable` | `lockedBy` | `lockedUntil` | Meaning |
|---|---|---|---|
| `true` | `null` | `null` | Free to book |
| `false` | `"session-uuid"` | future date | Soft-locked (TTL active) |
| `false` | `null` | `null` | Permanently booked |
| `false` | `"session-uuid"` | past date | Expired lock → released on next GET |

---

### 🖨️ Print Ticket

On the **Booking Success** page, a **"🖨️ Print Ticket"** button triggers the browser's native print dialog:

```jsx
// BookingSuccess.jsx
<button className="btn-outline" onClick={() => window.print()}>
  🖨️ Print Ticket
</button>
```

The page displays:
- **Booking ID** — first 8 characters of the UUID, uppercased (e.g. `A3F2B1C9`)
- **Seats Booked** — sorted seat numbers (e.g. `5, 12, 13`)
- **Total Paid** — in Indian Rupees with locale formatting (e.g. `₹2,700`)
- **Success message** from the API response

> **Tip for print styling**: Add `@media print` rules in `BookingSuccess.css` to hide the navbar and buttons when printing for a clean ticket.

---

### 🌱 Auto-Seed Database

When the server starts and detects an **empty MongoDB collection**, it automatically inserts **20 pre-defined buses** across 8 popular Indian routes.

```javascript
// config/db.js
const count = await Bus.countDocuments();
if (count === 0) {
  await seedData();  // Runs automatically
}
```

**Routes seeded:**

| Route | Buses | Types |
|-------|-------|-------|
| Bangalore → Chennai | 5 | Normal AC, Normal Non-AC, Sleeper AC x2, Semi-Sleeper AC |
| Chennai → Bangalore | 2 | Semi-Sleeper AC, Normal Non-AC |
| Mumbai → Pune | 4 | Normal Non-AC, Semi-Sleeper AC x2, Sleeper AC |
| Delhi → Agra | 3 | Normal Non-AC, Sleeper AC, Normal AC |
| Hyderabad → Bangalore | 3 | Sleeper AC, Semi-Sleeper Non-AC, Normal AC |
| Jaipur → Delhi | 2 | Normal AC, Sleeper AC |
| Kolkata → Bhubaneswar | 1 | Semi-Sleeper AC |
| Ahmedabad → Mumbai | 1 | Sleeper AC |

**Seat generation on seed:**

- **Normal / Semi-Sleeper**: 4 seats per row (col 1–2 left, col 3–4 right, with aisle)
- **Sleeper**: 4 berths per row (col 1–2 = lower berth, col 3–4 = upper berth)
- **Pre-booked realism**: 25–40% of seats randomly marked as booked on seed

```javascript
const randomlyBook = (seats) => {
  const ratio = 0.25 + Math.random() * 0.15;   // 25%–40%
  const toBook = Math.floor(seats.length * ratio);
  // Random shuffle → mark first N as isAvailable: false
};
```

---

### 🔍 Filters & Pagination

**BusList page filters** (applied client-side after API fetch, except `seatType` and `isAC` which are sent to the server):

| Filter | Type | Implementation |
|--------|------|----------------|
| Seat Type | `normal` / `semi-sleeper` / `sleeper` | MongoDB query (`seatType` field) |
| AC / Non-AC | `true` / `false` | MongoDB query (`isAC` field) |
| Departure Slot | morning / afternoon / evening / night | In-memory filter on `stops[0].departureTime` |

**Departure Slot time ranges:**

| Slot | Hours |
|------|-------|
| Morning | 06:00 – 11:59 |
| Afternoon | 12:00 – 15:59 |
| Evening | 16:00 – 19:59 |
| Night | 20:00 – 05:59 (next day) |

**Pagination:**
- Default page size: **10 buses per page**
- Maximum page size: **50 buses per page** (capped server-side)
- Pagination is done **in-memory** after the departure-slot filter (since that filter can't be done in MongoDB without aggregation, as times are stored as strings)

---

### 🧠 Global State (Context API)

`BookingContext` stores all cross-page booking state in a single React context:

```javascript
// context/BookingContext.jsx
{
  selectedBus,       // Bus object from API (name, price, stops, seatType, isAC)
  setSelectedBus,

  selectedSeats,     // Array of seat numbers: [5, 12, 13]
  setSelectedSeats,

  searchParams,      // { departureCity, arrivalCity, date }
  setSearchParams,

  sessionId,         // UUID generated once per app load (crypto.randomUUID())

  clearBooking,      // Resets selectedBus + selectedSeats (called after booking)
}
```

**State flow through pages:**

```
Home         → sets searchParams
BusList      → reads searchParams from URL query
SeatSelection→ sets selectedBus, selectedSeats
Confirmation → reads selectedBus, selectedSeats; calls clearBooking() on success
Success      → reads booking details from React Router location.state
```

---

### 🆔 Session ID & Idempotency

Each browser session generates a permanent `sessionId` via `crypto.randomUUID()` when the app first loads. This ID is:

1. **Sent with every lock-seats request** as `sessionId` in the request body
2. **Stored on each locked seat** in MongoDB as `lockedBy`
3. **Used to allow re-locks**: if the same session selects more seats (or deselects then reselects), the server checks `seat.lockedBy === sessionId` before allowing the lock — preventing false "seat taken" errors for the same user

> This means: if you add/remove seats from your selection while a lock is active, the backend gracefully re-locks all your seats instead of blocking you.

---

## 🌐 API Reference

Base URL: `http://localhost:5000/api`

### `GET /api/health`

Health check.

**Response:**
```json
{ "status": "ok", "message": "Bus Booking API is running" }
```

---

### `GET /api/buses`

Search buses with optional filters and pagination.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `departureCity` | string | ✅ | Case-insensitive regex match |
| `arrivalCity` | string | ✅ | Case-insensitive regex match |
| `date` | string | ✅ | Format: `YYYY-MM-DD` (stored for future use) |
| `seatType` | string | ❌ | `normal`, `semi-sleeper`, `sleeper` |
| `isAC` | boolean | ❌ | `true` or `false` |
| `departureSlot` | string | ❌ | `morning`, `afternoon`, `evening`, `night` |
| `page` | number | ❌ | Default: `1` |
| `pageSize` | number | ❌ | Default: `10`, max: `50` |

**Response `200`:**
```json
{
  "page": 1,
  "pageSize": 10,
  "totalPages": 2,
  "totalBuses": 14,
  "buses": [
    {
      "id": "uuid-string",
      "name": "KSRTC Airavat Club Class",
      "stops": [
        { "stopName": "Bangalore", "departureTime": "06:00 AM" },
        { "stopName": "Hosur", "arrivalTime": "07:00 AM", "departureTime": "07:10 AM" },
        { "stopName": "Chennai", "arrivalTime": "01:00 PM" }
      ],
      "availableSeats": 28,
      "price": 950,
      "seatType": "normal",
      "isAC": true
    }
  ]
}
```

**Note:** Seat layouts are excluded from list response (use `GET /api/buses/:busId` for seat map).

---

### `GET /api/buses/:busId`

Get full bus details including the seat layout. Also **lazily releases expired seat locks**.

**Response `200`:**
```json
{
  "id": "uuid-string",
  "name": "KSRTC Airavat Club Class",
  "availableSeats": 28,
  "price": 950,
  "seatType": "normal",
  "isAC": true,
  "stops": [...],
  "seats": [
    {
      "seatNumber": 1,
      "isAvailable": true,
      "row": 1,
      "column": 1,
      "seatType": "normal"
    },
    {
      "seatNumber": 15,
      "isAvailable": false,
      "row": 4,
      "column": 3,
      "seatType": "sleeper",
      "sleeperLevel": "upper"
    }
  ]
}
```

**Note:** `lockedUntil` and `lockedBy` are **not** returned to the frontend for security.

---

### `POST /api/buses/:busId/lock-seats`

Temporarily lock seats for 2 minutes. Idempotent for the same `sessionId`.

**Request Body:**
```json
{
  "seats": [5, 12, 13],
  "sessionId": "browser-generated-uuid"
}
```

**Response `200`:**
```json
{
  "message": "Seats locked successfully",
  "lockedUntil": "2026-03-22T09:15:00.000Z"
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400` | `seats` array missing or empty |
| `404` | Bus not found |
| `409` | Seat already locked/booked by a different session |

---

### `POST /api/bookings`

Confirm a booking. Converts soft-locked seats into permanently booked seats.

**Request Body:**
```json
{
  "busId": "uuid-string",
  "seats": [5, 12, 13],
  "passengerDetails": [
    { "name": "Aman Prajapati", "age": 25, "gender": "male" },
    { "name": "Priya Sharma",   "age": 22, "gender": "female" },
    { "name": "Raj Kumar",      "age": 30, "gender": "male" }
  ]
}
```

**Validation rules:**
- `seats.length` must equal `passengerDetails.length`
- Each passenger: `name` (non-empty, min 2 chars), `age` (1–120), `gender` (`male`/`female`/`other`)
- Seats must be locked (soft-locked by any session) — expired locks are rejected

**Response `201`:**
```json
{
  "message": "Booking successful",
  "id": "booking-uuid",
  "seatsBooked": [5, 12, 13],
  "totalPrice": 2850
}
```

**Price calculation:** `seats.length × bus.price`

---

## 📦 Data Models

### Bus Schema

```javascript
{
  _id: String,          // UUID v4 (auto-generated)
  name: String,         // e.g. "KSRTC Airavat Club Class"
  departureCity: String,
  arrivalCity: String,
  stops: [{
    stopName: String,
    arrivalTime: String,    // "HH:MM AM/PM" (optional for first stop)
    departureTime: String,  // "HH:MM AM/PM" (optional for last stop)
  }],
  availableSeats: Number,   // Kept in sync on every lock/booking
  totalSeats: Number,
  price: Number,            // Price per seat in INR
  seatType: "normal" | "semi-sleeper" | "sleeper",
  isAC: Boolean,
  seats: [SeatSchema],
  createdAt: Date,          // Auto (timestamps: true)
  updatedAt: Date,
}
```

### Seat Schema (embedded in Bus)

```javascript
{
  seatNumber: Number,       // 1-indexed
  isAvailable: Boolean,     // true = free, false = locked or booked
  row: Number,              // Row position in seat map
  column: Number,           // 1–4 (1–2 = left of aisle, 3–4 = right)
  seatType: "normal" | "semi-sleeper" | "sleeper",
  sleeperLevel: "upper" | "lower" | null,  // Only for sleeper buses
  lockedUntil: Date | null,  // Expiry timestamp of soft lock
  lockedBy: String | null,   // sessionId of the user who locked it
}
```

### Booking Schema

```javascript
{
  _id: String,             // UUID v4
  busId: String,           // Ref → Bus._id
  seats: [Number],         // Array of seat numbers
  passengerDetails: [{
    name: String,
    age: Number,           // 1–120
    gender: "male" | "female" | "other",
  }],
  totalPrice: Number,      // seats.length × bus.price
  status: "confirmed" | "cancelled",   // Default: "confirmed"
  createdAt: Date,
  updatedAt: Date,
}
```

---

## 🖥️ Frontend Pages & Routes

| URL Pattern | Component | Description |
|-------------|-----------|-------------|
| `/` | `Home.jsx` | Search form: Departure, Arrival, Date |
| `/buses` | `BusList.jsx` | Bus results with filters + pagination |
| `/buses/:busId/seats` | `SeatSelection.jsx` | Seat map + 2-min lock timer |
| `/buses/:busId/booking` | `BookingConfirmation.jsx` | Passenger details + price summary |
| `/booking-success` | `BookingSuccess.jsx` | Confirmation + Print Ticket |
| `/routes` | `Routes.jsx` | Popular route info page |
| `*` | Inline 404 | Page not found |

### Navbar

- **BusGo** logo (links to `/`)
- **Home** → `/`
- **Routes** → `/routes`
- **Contact** → `#` (placeholder)
- Active link detection via `useLocation()`

### Home — Search Validation

- Departure and arrival cities are required (non-empty)
- Cities must be different from each other
- Date cannot be in the past (min = today in `YYYY-MM-DD`)
- ⇄ Swap button swaps departure ↔ arrival values
- Popular route chips auto-fill the form: Bangalore → Chennai, Mumbai → Pune, Delhi → Agra, Hyderabad → Bangalore

### BusList — Filter & Display

- **Sort/filter panel** (collapsible on mobile)
- Filters: Seat Type (All/Normal/Semi-Sleeper/Sleeper), AC (All/AC/Non-AC), Departure Slot
- Each bus card shows: Name, stops with times, Available Seats badge, price, AC/seat-type badges
- Sold-out buses are hidden from results
- "Select Seats →" button navigates to `/buses/:busId/seats`

### SeatSelection — Seat Map Layout

- **Bus front indicator** at top with 🚌 Driver label
- Rows rendered top-to-bottom with an **aisle divider** between columns 2 and 3
- **Sleeper buses**: seats show `L` (lower) or `U` (upper) berth label
- **Legend**: Available (green border), Selected (orange fill), Booked (grey, disabled)
- Booking summary sidebar updates live as seats are selected
- "Proceed to Booking →" button disabled if no seats selected or timer expired

### BookingConfirmation — Passenger Form

- One passenger card per seat (seat number shown on card header)
- Fields per passenger: Full Name (text), Age (number 1–120), Gender (radio: Male/Female/Other)
- Real-time per-field validation
- Right sidebar shows: Bus name, badges, route with times, seat list, price breakdown, total
- On submit: `POST /api/bookings`, then clears context state, navigates to success page

### BookingSuccess — Ticket View

- Animated success circle with expanding rings animation
- Booking ID: first 8 chars of UUID, uppercased (e.g. `A3F2B1C9`)
- Seats booked sorted ascending
- Total paid in ₹ with locale number formatting
- **"Book Another Trip"** → navigates to `/`
- **"🖨️ Print Ticket"** → `window.print()` (uses browser print dialog)
- If accessed directly without booking state → redirects to `/`

---

## ⚠️ Error Handling

### Backend
- `400 Bad Request` — Missing or invalid required fields
- `404 Not Found` — Bus or booking not found
- `409 Conflict` — Seat already taken by another user
- `500 Internal Server Error` — Unexpected server errors (logged to console)
- Global 404 handler for unknown routes

### Frontend
- **Form validation** — Inline field-level errors before any API calls
- **API errors** — Displayed as error banners below forms
- **Lock failure** — "⚠️ Could not lock seat. It may have been taken." + automatic seat map refresh
- **Loading states** — Spinner shown during API calls on Seat Selection page
- **Empty states** — "No buses found" message on BusList when no results match filters
- **Guard redirects** — BookingConfirmation redirects back to seat selection if no seats in context; BookingSuccess redirects to home if no booking in router state
- **Axios timeout** — 10 second request timeout configured globally

---

## 🚢 Deployment

### Frontend — Cloudflare Pages

[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)

```bash
cd frontend
npm run build      # Outputs static files to /build
```

**Steps to deploy on Cloudflare Pages:**

1. Push your repo to GitHub / GitLab
2. Go to [pages.cloudflare.com](https://pages.cloudflare.com) → **Create a project** → Connect your repo
3. Set build settings:
   | Setting | Value |
   |---|---|
   | Framework preset | `Create React App` |
   | Build command | `npm run build` |
   | Build output directory | `build` |
4. Add environment variable:
   ```
   REACT_APP_API_URL = https://your-backend.onrender.com/api
   ```
5. Click **Save and Deploy** — Cloudflare auto-deploys on every push

> **Using Cloudflare Workers?** You can also proxy the API through a Worker to hide your backend URL and add edge-level caching.

---

### Backend — Render

[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

**Steps to deploy on Render:**

1. Go to [render.com](https://render.com) → **New Web Service** → Connect your GitHub repo
2. Set the following:
   | Setting | Value |
   |---|---|
   | Root directory | `backend` |
   | Runtime | `Node` |
   | Build command | `npm install` |
   | Start command | `node server.js` |
3. Under **Environment**, add:
   ```
   MONGODB_URI = mongodb+srv://<user>:<pass>@cluster.mongodb.net/bus-booking
   PORT        = 5050
   ```
4. Click **Create Web Service** — Render auto-deploys from your main branch
5. The server **auto-seeds 58 buses** on first start if the database is empty

### Database (MongoDB Atlas)

1. Create a free M0 cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a database user + whitelist `0.0.0.0/0`
3. Copy connection string to `MONGODB_URI` environment variable

### CORS

The backend uses `cors()` middleware with default settings (allows all origins). For production, restrict to your frontend domain:

```javascript
app.use(cors({ origin: 'https://your-frontend.pages.dev' }));
```

---

## 📊 Database Index

```javascript
// Bus.js
BusSchema.index({ departureCity: 1, arrivalCity: 1 });
```

Compound index on `departureCity` + `arrivalCity` for fast bus search queries.

---
