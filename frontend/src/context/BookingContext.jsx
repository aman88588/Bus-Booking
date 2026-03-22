import { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [searchParams, setSearchParams] = useState(null);
  const [sessionId] = useState(() => crypto.randomUUID());

  const clearBooking = () => {
    setSelectedBus(null);
    setSelectedSeats([]);
  };

  return (
    <BookingContext.Provider value={{
      selectedBus, setSelectedBus,
      selectedSeats, setSelectedSeats,
      searchParams, setSearchParams,
      sessionId,
      clearBooking,
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider');
  return ctx;
};
