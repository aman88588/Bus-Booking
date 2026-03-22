/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBusDetails, lockSeats } from '../services/api';
import { useBooking } from '../context/BookingContext';
import './SeatSelection.css';

export default function SeatSelection() {
  const { busId } = useParams();
  const navigate = useNavigate();
  const { selectedBus, setSelectedBus, selectedSeats, setSelectedSeats, sessionId } = useBooking();

  const [busDetails, setBusDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lockError, setLockError] = useState('');

  // Timer: 2 minutes per the bonus requirement
  const [timerSeconds, setTimerSeconds] = useState(null);
  const timerRef = useRef(null);
  const lockExpiryRef = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getBusDetails(busId);
      setBusDetails(res.data);
      if (!selectedBus) setSelectedBus(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load bus details');
    } finally {
      setLoading(false);
    }
  }, [busId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDetails();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Start 2-minute timer when seats are locked
  const startTimer = (expiryDate) => {
    lockExpiryRef.current = expiryDate;
    if (timerRef.current) clearInterval(timerRef.current);
    const updateTimer = () => {
      const remaining = Math.floor((new Date(expiryDate) - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setTimerSeconds(0);
        setSelectedSeats([]);
        fetchDetails();
      } else {
        setTimerSeconds(remaining);
      }
    };
    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
  };

  const handleSeatClick = async (seat) => {
    if (!seat.isAvailable) return;

    const seatNum = seat.seatNumber;
    const isSelected = selectedSeats.includes(seatNum);

    let newSeats;
    if (isSelected) {
      newSeats = selectedSeats.filter(s => s !== seatNum);
    } else {
      newSeats = [...selectedSeats, seatNum];
    }
    setSelectedSeats(newSeats);
    setLockError('');

    // Lock seats on server for 2 minutes
    if (newSeats.length > 0) {
      try {
        const res = await lockSeats(busId, newSeats, sessionId);
        startTimer(res.data.lockedUntil);
      } catch (err) {
        setLockError(err.response?.data?.error || 'Could not lock seat. It may have been taken.');
        setSelectedSeats(selectedSeats);
        fetchDetails();
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimerSeconds(null);
    }
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    navigate(`/buses/${busId}/booking`);
  };

  const getSeatStatus = (seat) => {
    if (selectedSeats.includes(seat.seatNumber)) return 'selected';
    if (!seat.isAvailable) return 'booked';
    return 'available';
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Organize seats into rows
  const organizeSeats = () => {
    if (!busDetails?.seats) return [];
    const rows = {};
    busDetails.seats.forEach(seat => {
      if (!rows[seat.row]) rows[seat.row] = [];
      rows[seat.row].push(seat);
    });
    return Object.entries(rows).map(([row, seats]) => ({
      row: parseInt(row),
      seats: seats.sort((a, b) => a.column - b.column),
    }));
  };

  if (loading) return (
    <div className="seat-loading">
      <div className="spinner" />
      <p>Loading seat layout…</p>
    </div>
  );

  if (error) return (
    <div className="seat-error card">
      <p>{error}</p>
      <button className="btn-outline" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  const rows = organizeSeats();
  const bus = busDetails || selectedBus;
  const departureStop = bus?.stops?.[0];
  const arrivalStop = bus?.stops?.[bus?.stops?.length - 1];
  const totalPrice = selectedSeats.length * (bus?.price || 0);

  return (
    <div className="seat-page page-enter">
      <div className="container">
        {/* Bus Details Banner */}
        <div className="bus-details-banner card">
          <div className="banner-left">
            <h2 className="banner-bus-name">{bus?.name}</h2>
            <div className="banner-badges">
              <span className={`badge ${bus?.isAC ? 'badge-ac' : 'badge-nonac'}`}>
                {bus?.isAC ? '❄️ AC' : 'NON-AC'}
              </span>
              <span className="badge badge-normal">{bus?.seatType}</span>
            </div>
          </div>
          <div className="banner-route">
            <div className="banner-stop">
              <span className="stop-time">{departureStop?.departureTime}</span>
              <span className="stop-city">{departureStop?.stopName}</span>
            </div>
            <div className="banner-arrow">→</div>
            <div className="banner-stop right">
              <span className="stop-time">{arrivalStop?.arrivalTime}</span>
              <span className="stop-city">{arrivalStop?.stopName}</span>
            </div>
          </div>
          <div className="banner-price">
            <span className="banner-price-label">Price/seat</span>
            <span className="banner-price-value">₹{bus?.price?.toLocaleString()}</span>
          </div>
        </div>

        <div className="seat-layout-area">
          {/* Seat Map */}
          <div className="seat-map-card card">
            <div className="seat-map-header">
              <h3>Select Your Seats</h3>
              {timerSeconds !== null && timerSeconds > 0 && (
                <div className={`timer-badge ${timerSeconds < 30 ? 'timer-urgent' : ''}`}>
                  ⏱ {formatTime(timerSeconds)}
                  <span className="timer-label">reservation expires</span>
                </div>
              )}
              {timerSeconds === 0 && (
                <div className="timer-expired">⚠️ Reservation expired. Please reselect.</div>
              )}
            </div>

            {lockError && (
              <div className="lock-error">⚠️ {lockError}</div>
            )}

            {/* Bus front indicator */}
            <div className="bus-front">
              <div className="driver-seat">🚌 Driver</div>
            </div>

            {/* Seat Grid */}
            <div className="seat-grid">
              {rows.map(({ row, seats }) => {
                const leftSeats = seats.filter(s => s.column <= 2);
                const rightSeats = seats.filter(s => s.column > 2);
                return (
                  <div key={row} className="seat-row">
                    <div className="seat-group">
                      {leftSeats.map(seat => (
                        <SeatCell key={seat.seatNumber} seat={seat} status={getSeatStatus(seat)} onClick={handleSeatClick} />
                      ))}
                    </div>
                    <div className="aisle" />
                    <div className="seat-group">
                      {rightSeats.map(seat => (
                        <SeatCell key={seat.seatNumber} seat={seat} status={getSeatStatus(seat)} onClick={handleSeatClick} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="seat-legend">
              <span className="legend-item">
                <span className="legend-box available" />
                Available
              </span>
              <span className="legend-item">
                <span className="legend-box selected" />
                Selected
              </span>
              <span className="legend-item">
                <span className="legend-box booked" />
                Booked
              </span>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="booking-summary card">
            <h3>Booking Summary</h3>

            {selectedSeats.length === 0 ? (
              <div className="no-seats-msg">
                <span>👆</span>
                <p>Select seats from the layout</p>
              </div>
            ) : (
              <>
                <div className="summary-row">
                  <span className="summary-label">Selected Seats</span>
                  <span className="summary-seats">
                    {selectedSeats.sort((a, b) => a - b).join(', ')}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Passengers</span>
                  <span>{selectedSeats.length}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Price/seat</span>
                  <span>₹{bus?.price?.toLocaleString()}</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-total">
                  <span>Total</span>
                  <span className="total-amount">₹{totalPrice.toLocaleString()}</span>
                </div>

                {timerSeconds !== null && timerSeconds > 0 && (
                  <div className="timer-note">
                    🔒 Seats reserved for {formatTime(timerSeconds)}
                  </div>
                )}

                <button
                  className="btn-primary proceed-btn"
                  onClick={handleProceed}
                  disabled={selectedSeats.length === 0 || timerSeconds === 0}
                >
                  Proceed to Booking →
                </button>
              </>
            )}

            <div className="summary-stats">
              <div className="stat">
                <span className="stat-val">{busDetails?.availableSeats}</span>
                <span className="stat-label">Available</span>
              </div>
              <div className="stat">
                <span className="stat-val">{selectedSeats.length}</span>
                <span className="stat-label">Selected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeatCell({ seat, status, onClick }) {
  return (
    <button
      className={`seat-cell seat-${status}`}
      onClick={() => onClick(seat)}
      disabled={status === 'booked'}
      title={`Seat ${seat.seatNumber}${seat.sleeperLevel ? ` (${seat.sleeperLevel})` : ''}`}
    >
      <span className="seat-num">{seat.seatNumber}</span>
      {seat.sleeperLevel && <span className="sleeper-level">{seat.sleeperLevel[0].toUpperCase()}</span>}
    </button>
  );
}