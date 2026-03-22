import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createBooking } from '../services/api';
import { useBooking } from '../context/BookingContext';
import './BookingConfirmation.css';

const emptyPassenger = () => ({ name: '', age: '', gender: '' });

export default function BookingConfirmation() {
  const { busId } = useParams();
  const navigate = useNavigate();
  const { selectedBus, selectedSeats, clearBooking } = useBooking();

  const [passengers, setPassengers] = useState(
    (selectedSeats || []).map(() => emptyPassenger())
  );
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  if (!selectedSeats || selectedSeats.length === 0) {
    navigate(`/buses/${busId}/seats`);
    return null;
  }

  const totalPrice = selectedSeats.length * (selectedBus?.price || 0);

  const updatePassenger = (idx, field, value) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
    // Clear specific error
    setErrors(prev => {
      const updated = [...prev];
      if (updated[idx]) updated[idx] = { ...updated[idx], [field]: '' };
      return updated;
    });
  };

  const validate = () => {
    const errs = passengers.map(p => {
      const e = {};
      if (!p.name.trim()) e.name = 'Name is required';
      else if (p.name.trim().length < 2) e.name = 'Name too short';
      if (!p.age) e.age = 'Age is required';
      else if (parseInt(p.age) < 1 || parseInt(p.age) > 120) e.age = 'Invalid age';
      if (!p.gender) e.gender = 'Gender is required';
      return e;
    });
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    const hasErrors = errs.some(e => Object.keys(e).length > 0);
    if (hasErrors) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setApiError('');
    try {
      const res = await createBooking({
        busId,
        seats: selectedSeats,
        passengerDetails: passengers.map(p => ({
          name: p.name.trim(),
          age: parseInt(p.age),
          gender: p.gender,
        })),
      });
      clearBooking();
      navigate('/booking-success', { state: { booking: res.data } });
    } catch (err) {
      setApiError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const bus = selectedBus;
  const departureStop = bus?.stops?.[0];
  const arrivalStop = bus?.stops?.[bus?.stops?.length - 1];

  return (
    <div className="confirm-page page-enter">
      <div className="container">
        <div className="confirm-header">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <h1>Payment & Booking Confirmation</h1>
        </div>

        <div className="confirm-layout">
          {/* Passenger Form */}
          <div className="passengers-section">
            <h2 className="section-title">Passenger Details</h2>

            {selectedSeats.sort((a, b) => a - b).map((seatNum, idx) => (
              <div key={idx} className="passenger-card card">
                <div className="passenger-header">
                  <span className="passenger-num">Passenger {idx + 1}</span>
                  <span className="passenger-seat">Seat #{seatNum}</span>
                </div>

                <div className="passenger-fields">
                  <div className={`pf-group ${errors[idx]?.name ? 'pf-error' : ''}`}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={passengers[idx]?.name || ''}
                      onChange={e => updatePassenger(idx, 'name', e.target.value)}
                      placeholder="Enter full name"
                    />
                    {errors[idx]?.name && <span className="pf-err">{errors[idx].name}</span>}
                  </div>

                  <div className={`pf-group pf-small ${errors[idx]?.age ? 'pf-error' : ''}`}>
                    <label>Age</label>
                    <input
                      type="number"
                      value={passengers[idx]?.age || ''}
                      onChange={e => updatePassenger(idx, 'age', e.target.value)}
                      placeholder="Age"
                      min="1"
                      max="120"
                    />
                    {errors[idx]?.age && <span className="pf-err">{errors[idx].age}</span>}
                  </div>

                  <div className={`pf-group ${errors[idx]?.gender ? 'pf-error' : ''}`}>
                    <label>Gender</label>
                    <div className="gender-options">
                      {['male', 'female', 'other'].map(g => (
                        <label key={g} className={`gender-option ${passengers[idx]?.gender === g ? 'gender-selected' : ''}`}>
                          <input
                            type="radio"
                            name={`gender-${idx}`}
                            value={g}
                            checked={passengers[idx]?.gender === g}
                            onChange={e => updatePassenger(idx, 'gender', e.target.value)}
                          />
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </label>
                      ))}
                    </div>
                    {errors[idx]?.gender && <span className="pf-err">{errors[idx].gender}</span>}
                  </div>
                </div>
              </div>
            ))}

            {apiError && (
              <div className="api-error-banner">
                ⚠️ {apiError}
              </div>
            )}

            <button
              className="btn-primary confirm-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Confirming…' : '✓ Confirm Booking'}
            </button>
          </div>

          {/* Right: Bus Details + Summary */}
          <div className="confirm-sidebar">
            <div className="confirm-bus-card card">
              <h3>Bus Details</h3>
              <div className="cb-name">{bus?.name}</div>
              <div className="cb-tags">
                <span className={`badge ${bus?.isAC ? 'badge-ac' : 'badge-nonac'}`}>
                  {bus?.isAC ? '❄️ AC' : 'NON-AC'}
                </span>
                <span className="badge badge-normal">{bus?.seatType}</span>
              </div>
              <div className="cb-route">
                <div className="cb-stop">
                  <span className="cb-time">{departureStop?.departureTime}</span>
                  <span className="cb-city">{departureStop?.stopName}</span>
                </div>
                <div className="cb-arrow">→</div>
                <div className="cb-stop right">
                  <span className="cb-time">{arrivalStop?.arrivalTime}</span>
                  <span className="cb-city">{arrivalStop?.stopName}</span>
                </div>
              </div>
            </div>

            <div className="confirm-summary card">
              <h3>Booking Summary</h3>
              <div className="cs-row">
                <span>Selected Seats</span>
                <span>{selectedSeats.sort((a, b) => a - b).join(', ')}</span>
              </div>
              <div className="cs-row">
                <span>Passengers</span>
                <span>{selectedSeats.length}</span>
              </div>
              <div className="cs-row">
                <span>Price/seat</span>
                <span>₹{bus?.price?.toLocaleString()}</span>
              </div>
              <div className="cs-divider" />
              <div className="cs-total">
                <span>Total Price</span>
                <span className="cs-amount">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
