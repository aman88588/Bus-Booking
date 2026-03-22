import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BusList from './pages/BusList';
import SeatSelection from './pages/SeatSelection';
import BookingConfirmation from './pages/BookingConfirmation';
import BookingSuccess from './pages/BookingSuccess';
import RoutesPage from './pages/Routes';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <BookingProvider>
        <div className="app">
          <Navbar />
          <main style={{ position: 'relative', zIndex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/buses" element={<BusList />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/buses/:busId/seats" element={<SeatSelection />} />
              <Route path="/buses/:busId/booking" element={<BookingConfirmation />} />
              <Route path="/booking-success" element={<BookingSuccess />} />
              <Route path="*" element={
                <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                  <h2 style={{ fontSize: 32, marginBottom: 12 }}>404</h2>
                  <p style={{ color: 'var(--text-2)' }}>Page not found</p>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </BookingProvider>
    </BrowserRouter>
  );
}

export default App;
