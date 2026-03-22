import { useLocation, useNavigate } from 'react-router-dom';
import './BookingSuccess.css';

export default function BookingSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const booking = state?.booking;

  if (!booking) {
    navigate('/');
    return null;
  }

  return (
    <div className="success-page page-enter">
      <div className="container">
        <div className="success-card card">
          <div className="success-icon-wrap">
            <div className="success-circle">
              <span>✓</span>
            </div>
            <div className="success-rings">
              <div className="ring ring-1" />
              <div className="ring ring-2" />
              <div className="ring ring-3" />
            </div>
          </div>

          <h1 className="success-title">Booking Confirmed!</h1>
          <p className="success-subtitle">Your tickets have been booked successfully.</p>

          <div className="booking-id-box">
            <span className="bid-label">Booking ID</span>
            <span className="bid-value">{booking.id?.slice(0, 8).toUpperCase()}</span>
          </div>

          <div className="success-details">
            <div className="sd-row">
              <span className="sd-label">Seats Booked</span>
              <span className="sd-value">{booking.seatsBooked?.sort((a, b) => a - b).join(', ')}</span>
            </div>
            <div className="sd-row">
              <span className="sd-label">Total Paid</span>
              <span className="sd-value accent">₹{booking.totalPrice?.toLocaleString()}</span>
            </div>
          </div>

          <div className="success-message">
            🎉 {booking.message || 'Have a wonderful journey!'}
          </div>

          <div className="success-actions">
            <button className="btn-primary" onClick={() => navigate('/')}>
              Book Another Trip
            </button>
            <button className="btn-outline" onClick={() => window.print()}>
              🖨️ Print Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
