/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchBuses } from '../services/api';
import { useBooking } from '../context/BookingContext';
import './BusList.css';

const SEAT_TYPES = ['normal', 'semi-sleeper', 'sleeper'];
const AC_TYPES = [{ label: 'AC', value: 'true' }, { label: 'NON-AC', value: 'false' }];
const SLOTS = ['morning', 'afternoon', 'evening', 'night'];
const SLOT_LABELS = { morning: 'Morning (6AM–12PM)', afternoon: 'Afternoon (12PM–4PM)', evening: 'Evening (4PM–8PM)', night: 'Night (8PM–6AM)' };

export default function BusList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSelectedBus } = useBooking();

  const departureCity = searchParams.get('departureCity') || '';
  const arrivalCity = searchParams.get('arrivalCity') || '';
  const date = searchParams.get('date') || '';

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBuses, setTotalBuses] = useState(0);

  const [filters, setFilters] = useState({
    seatTypes: [],
    acTypes: [],
    slots: [],
  });

  const fetchBuses = useCallback(async (currentPage = 1) => {
    if (!departureCity || !arrivalCity || !date) return;
    setLoading(true);
    setError('');
    try {
      const params = {
        departureCity,
        arrivalCity,
        date,
        page: currentPage,
        pageSize: 10,
      };
      if (filters.seatTypes.length === 1) params.seatType = filters.seatTypes[0];
      if (filters.acTypes.length === 1) params.isAC = filters.acTypes[0];
      if (filters.slots.length === 1) params.departureSlot = filters.slots[0];

      const res = await searchBuses(params);
      setBuses(res.data.buses || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalBuses(res.data.totalBuses || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch buses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [departureCity, arrivalCity, date, filters]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setPage(1);
    fetchBuses(1);
  }, [filters, departureCity, arrivalCity, date]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchBuses(page);
  }, [page]);

  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const arr = prev[category];
      return {
        ...prev,
        [category]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  };

  const clearFilters = () => setFilters({ seatTypes: [], acTypes: [], slots: [] });

  const handleBookNow = (bus) => {
    setSelectedBus(bus);
    navigate(`/buses/${bus.id}/seats`);
  };

  const getDeparture = (bus) => bus.stops?.[0]?.departureTime || '—';
  const getArrival = (bus) => bus.stops?.[bus.stops.length - 1]?.arrivalTime || '—';

  const activeFilterCount = filters.seatTypes.length + filters.acTypes.length + filters.slots.length;

  return (
    <div className="buslist-page page-enter">
      <div className="buslist-header">
        <div className="container">
          <div className="buslist-breadcrumb">
            <span onClick={() => navigate('/')} className="breadcrumb-link">Home</span>
            <span className="breadcrumb-sep">/</span>
            <span>Search Results</span>
          </div>
          <h1 className="buslist-title">
            {departureCity} <span className="route-arrow">→</span> {arrivalCity}
          </h1>
          <p className="buslist-meta">{date} · {totalBuses} bus{totalBuses !== 1 ? 'es' : ''} found</p>
        </div>
      </div>

      <div className="container buslist-body">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar card">
          <div className="filters-header">
            <h3>Filters</h3>
            {activeFilterCount > 0 && (
              <button className="clear-filters" onClick={clearFilters}>
                Clear all ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="filter-section">
            <h4>Seat Type</h4>
            {SEAT_TYPES.map(type => (
              <label key={type} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.seatTypes.includes(type)}
                  onChange={() => toggleFilter('seatTypes', type)}
                />
                <span className="checkbox-box" />
                <span className="checkbox-label">{type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}</span>
              </label>
            ))}
          </div>

          <div className="filter-section">
            <h4>AC Type</h4>
            {AC_TYPES.map(({ label, value }) => (
              <label key={value} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.acTypes.includes(value)}
                  onChange={() => toggleFilter('acTypes', value)}
                />
                <span className="checkbox-box" />
                <span className="checkbox-label">{label}</span>
              </label>
            ))}
          </div>

          <div className="filter-section">
            <h4>Departure Time</h4>
            {SLOTS.map(slot => (
              <label key={slot} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.slots.includes(slot)}
                  onChange={() => toggleFilter('slots', slot)}
                />
                <span className="checkbox-box" />
                <span className="checkbox-label">{SLOT_LABELS[slot]}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* Bus List */}
        <main className="buses-main">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Finding best buses for you…</p>
            </div>
          ) : error ? (
            <div className="error-state card">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button className="btn-outline" onClick={() => fetchBuses(page)}>Retry</button>
            </div>
          ) : buses.length === 0 ? (
            <div className="empty-state card">
              <span className="empty-icon">🚌</span>
              <h3>No buses found</h3>
              <p>Try changing your filters or search for a different route.</p>
              <button className="btn-outline" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              {buses.map((bus, idx) => (
                <div key={bus.id} className="bus-card card" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="bus-card-main">
                    <div className="bus-info">
                      <div className="bus-name-row">
                        <h3 className="bus-name">{bus.name}</h3>
                        <div className="bus-badges">
                          <span className={`badge ${bus.isAC ? 'badge-ac' : 'badge-nonac'}`}>
                            {bus.isAC ? '❄️ AC' : 'NON-AC'}
                          </span>
                          <span className={`badge ${bus.seatType === 'sleeper' ? 'badge-sleeper' :
                            bus.seatType === 'semi-sleeper' ? 'badge-semi' : 'badge-normal'
                            }`}>
                            {bus.seatType}
                          </span>
                        </div>
                      </div>

                      <div className="bus-route-display">
                        <div className="time-block">
                          <span className="time">{getDeparture(bus)}</span>
                          <span className="city">{bus.stops?.[0]?.stopName}</span>
                        </div>
                        <div className="route-line">
                          <div className="route-dot" />
                          <div className="route-dashes" />
                          <div className="route-dot" />
                        </div>
                        <div className="time-block right">
                          <span className="time">{getArrival(bus)}</span>
                          <span className="city">{bus.stops?.[bus.stops.length - 1]?.stopName}</span>
                        </div>
                      </div>

                      <div className="bus-meta-row">
                        <span className="meta-item">
                          <span className="meta-icon">💺</span>
                          {bus.availableSeats} seats left
                        </span>
                        {bus.stops?.length > 2 && (
                          <span className="meta-item">
                            <span className="meta-icon">🛑</span>
                            {bus.stops.length - 2} stop{bus.stops.length - 2 !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bus-card-actions">
                      <div className="bus-price">
                        <span className="price-label">from</span>
                        <span className="price-value">₹{bus.price.toLocaleString()}</span>
                        <span className="price-per">per seat</span>
                      </div>
                      <button
                        className="btn-primary book-btn"
                        onClick={() => handleBookNow(bus)}
                        disabled={bus.availableSeats === 0}
                      >
                        {bus.availableSeats === 0 ? 'Sold Out' : 'Book Now'}
                      </button>
                      {bus.availableSeats > 0 && bus.availableSeats <= 5 && (
                        <span className="seats-warning">Only {bus.availableSeats} left!</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn-outline page-btn"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={`page-btn ${p === page ? 'page-active' : 'btn-outline'}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="btn-outline page-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}