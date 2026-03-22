import { useNavigate } from 'react-router-dom';
import './Routes.css';

const ROUTES = [
  { from: 'Bangalore', to: 'Chennai', duration: '6h', price: 600 },
  { from: 'Mumbai', to: 'Pune', duration: '3.5h', price: 450 },
  { from: 'Delhi', to: 'Agra', duration: '3.5h', price: 350 },
  { from: 'Hyderabad', to: 'Bangalore', duration: '9h', price: 800 },
  { from: 'Chennai', to: 'Bangalore', duration: '6h', price: 600 },
  { from: 'Pune', to: 'Mumbai', duration: '3.5h', price: 450 },
];

export default function Routes() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const handleRoute = (route) => {
    navigate(`/buses?departureCity=${route.from}&arrivalCity=${route.to}&date=${today}`);
  };

  return (
    <div className="routes-page page-enter container">
      <div className="routes-header">
        <h1>Popular Routes</h1>
        <p>Choose from our most travelled routes</p>
      </div>
      <div className="routes-grid">
        {ROUTES.map(route => (
          <div key={`${route.from}-${route.to}`} className="route-card card" onClick={() => handleRoute(route)}>
            <div className="rc-cities">
              <span className="rc-city">{route.from}</span>
              <span className="rc-arrow">→</span>
              <span className="rc-city">{route.to}</span>
            </div>
            <div className="rc-meta">
              <span>⏱ {route.duration}</span>
              <span className="rc-price">from ₹{route.price}</span>
            </div>
            <div className="rc-btn">View Buses →</div>
          </div>
        ))}
      </div>
    </div>
  );
}
