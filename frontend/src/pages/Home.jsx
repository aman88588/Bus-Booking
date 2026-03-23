import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import './Home.css';

/* ── City list (matches seed data) ── */
const CITIES = ['Agra', 'Ahmedabad', 'Bangalore', 'Bhubaneswar', 'Chennai', 'Delhi', 'Hyderabad', 'Jaipur', 'Kolkata', 'Mumbai', 'Pune'];

const POPULAR_ROUTES = [
  { from: 'Bangalore', to: 'Chennai' },
  { from: 'Mumbai', to: 'Pune' },
  { from: 'Delhi', to: 'Agra' },
  { from: 'Hyderabad', to: 'Bangalore' },
];

/* ══════════════════════════════════════════════════
   CityAutocomplete — reusable typeahead input
   ══════════════════════════════════════════════════ */
function CityAutocomplete({ name, value, onChange, placeholder, icon, error }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);
  // Always keep a ref to the latest onChange so debounce closure is never stale
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  /* Input changes: lift value immediately, debounce the dropdown filter */
  const handleInput = (e) => {
    const val = e.target.value;
    onChangeRef.current(name, val);   // always calls latest handler
    setActiveIdx(-1);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = val.trim().toLowerCase();
      if (q.length === 0) {
        setSuggestions([]);
        setOpen(false);
      } else {
        const filtered = CITIES.filter(c => c.toLowerCase().includes(q));
        setSuggestions(filtered);
        setOpen(filtered.length > 0);
      }
    }, 300);
  };

  /* Close on click-outside */
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Keyboard navigation */
  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      selectCity(suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  const selectCity = (city) => {
    onChangeRef.current(name, city);  // use ref — always latest, never stale
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
  };


  /* Highlight matching substring */
  const highlight = (city) => {
    const q = value.trim();
    if (!q) return city;
    const idx = city.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return city;
    return (
      <>
        {city.slice(0, idx)}
        <mark className="ac-highlight">{city.slice(idx, idx + q.length)}</mark>
        {city.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className={`form-group ${error ? 'error' : ''}`} ref={wrapRef}>
      <label>{name === 'departureCity' ? 'Departure City' : 'Arrival City'}</label>
      <div className="input-wrap">
        <span className="input-icon">{icon}</span>
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
        />
      </div>
      {error && <span className="err-msg">{error}</span>}

      {open && (
        <ul className="ac-dropdown" role="listbox">
          {suggestions.map((city, i) => (
            <li
              key={city}
              className={`ac-item ${i === activeIdx ? 'ac-active' : ''}`}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={(e) => { e.preventDefault(); selectCity(city); }}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <span className="ac-item-icon">🏙️</span>
              {highlight(city)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Home page
   ══════════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();
  const { setSearchParams } = useBooking();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({ departureCity: '', arrivalCity: '', date: today });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.departureCity.trim()) errs.departureCity = 'Please enter departure city';
    if (!form.arrivalCity.trim()) errs.arrivalCity = 'Please enter arrival city';
    if (!form.date) errs.date = 'Please select travel date';
    if (form.departureCity.trim().toLowerCase() === form.arrivalCity.trim().toLowerCase() &&
      form.departureCity.trim()) {
      errs.arrivalCity = 'Departure and arrival cities must be different';
    }
    if (form.date && form.date < today) errs.date = 'Date cannot be in the past';
    return errs;
  };

  /* Shared change handler lifted from CityAutocomplete */
  const handleCityChange = (name, value) => {
    // Capitalize first letter of each word
    const capitalized = value
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    setForm(f => ({ ...f, [name]: capitalized }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const handleDateChange = (e) => {
    setForm(f => ({ ...f, date: e.target.value }));
    if (errors.date) setErrors(e => ({ ...e, date: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
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

                <CityAutocomplete
                  name="departureCity"
                  value={form.departureCity}
                  onChange={handleCityChange}
                  placeholder="e.g. Bangalore"
                  icon="🚌"
                  error={errors.departureCity}
                />

                <div
                  className="swap-btn"
                  onClick={() => {
                    setForm(f => ({ ...f, departureCity: f.arrivalCity, arrivalCity: f.departureCity }));
                    setErrors({});
                  }}
                >
                  <span>⇄</span>
                </div>

                <CityAutocomplete
                  name="arrivalCity"
                  value={form.arrivalCity}
                  onChange={handleCityChange}
                  placeholder="e.g. Chennai"
                  icon="📍"
                  error={errors.arrivalCity}
                />

                <div className={`form-group ${errors.date ? 'error' : ''}`}>
                  <label>Date of Travel</label>
                  <div className="input-wrap">
                    <span className="input-icon">📅</span>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleDateChange}
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
