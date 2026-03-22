import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import './Home.css';

const POPULAR_ROUTES = [
  { from: 'Bangalore', to: 'Chennai' },
  { from: 'Mumbai', to: 'Pune' },
  { from: 'Delhi', to: 'Agra' },
  { from: 'Hyderabad', to: 'Bangalore' },
];

export default function Home() {
  const navigate = useNavigate();
  const { setSearchParams } = useBooking();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    departureCity: '',
    arrivalCity: '',
    date: today,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.departureCity.trim()) errs.departureCity = 'Please enter departure city';
    if (!form.arrivalCity.trim()) errs.arrivalCity = 'Please enter arrival city';
    if (!form.date) errs.date = 'Please select travel date';
    if (form.departureCity.trim().toLowerCase() === form.arrivalCity.trim().toLowerCase()) {
      errs.arrivalCity = 'Departure and arrival cities must be different';
    }
    if (form.date && form.date < today) errs.date = 'Date cannot be in the past';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSearchParams(form);
    navigate(`/buses?departureCity=${encodeURIComponent(form.departureCity)}&arrivalCity=${encodeURIComponent(form.arrivalCity)}&date=${form.date}`);
  };

  const fillRoute = (route) => {
    setForm(f => ({ ...f, departureCity: route.from, arrivalCity: route.to }));
    setErrors({});
  };

  return (
    <div className="home page-enter">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
        </div>
        <div className="container hero-content">
          <div className="hero-tag">✦ Book your journey</div>
          <h1 className="hero-title">
            Travel smarter,<br />
            <span className="gradient-text">not harder</span>
          </h1>
          <p className="hero-subtitle">
            Find and book bus tickets across India instantly. Compare prices, choose your seat, and travel in comfort.
          </p>

          {/* Search Form */}
          <div className="search-card card">
            <h2 className="search-title">Find Your Bus</h2>
            <form onSubmit={handleSubmit} className="search-form">
              <div className="form-row">
                <div className={`form-group ${errors.departureCity ? 'error' : ''}`}>
                  <label>Departure City</label>
                  <div className="input-wrap">
                    <span className="input-icon">🚌</span>
                    <input
                      type="text"
                      name="departureCity"
                      value={form.departureCity}
                      onChange={handleChange}
                      placeholder="e.g. Bangalore"
                      autoComplete="off"
                    />
                  </div>
                  {errors.departureCity && <span className="err-msg">{errors.departureCity}</span>}
                </div>

                <div className="swap-btn" onClick={() => setForm(f => ({ ...f, departureCity: f.arrivalCity, arrivalCity: f.departureCity }))}>
                  <span>⇄</span>
                </div>

                <div className={`form-group ${errors.arrivalCity ? 'error' : ''}`}>
                  <label>Arrival City</label>
                  <div className="input-wrap">
                    <span className="input-icon">📍</span>
                    <input
                      type="text"
                      name="arrivalCity"
                      value={form.arrivalCity}
                      onChange={handleChange}
                      placeholder="e.g. Chennai"
                      autoComplete="off"
                    />
                  </div>
                  {errors.arrivalCity && <span className="err-msg">{errors.arrivalCity}</span>}
                </div>

                <div className={`form-group ${errors.date ? 'error' : ''}`}>
                  <label>Date of Travel</label>
                  <div className="input-wrap">
                    <span className="input-icon">📅</span>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      min={today}
                    />
                  </div>
                  {errors.date && <span className="err-msg">{errors.date}</span>}
                </div>
              </div>

              <button type="submit" className="btn-primary search-btn">
                Search Buses →
              </button>
            </form>

            {/* Popular Routes */}
            <div className="popular-routes">
              <span className="popular-label">Popular:</span>
              {POPULAR_ROUTES.map((r) => (
                <button key={`${r.from}-${r.to}`} className="route-chip" onClick={() => fillRoute(r)}>
                  {r.from} → {r.to}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features container">
        {[
          { icon: '🛡️', title: 'Safe & Secure', desc: 'Verified operators and secure payments' },
          { icon: '💺', title: 'Choose Your Seat', desc: 'Pick your preferred seat from live layout' },
          { icon: '⚡', title: 'Instant Booking', desc: 'Book in under 2 minutes, get e-ticket' },
          { icon: '🌐', title: '500+ Routes', desc: 'Covering all major cities across India' },
        ].map(f => (
          <div className="feature-card card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
