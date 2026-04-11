import { useState, useEffect, useCallback } from 'react';
import { Driver, RideRequest, Location } from '../types';
import { MOCK_REQUESTS } from '../lib/mockData';

const INITIAL_LOCATION: Location = {
  lat: 40.7128,
  lng: -74.0060,
  address: 'New York City Medical Center'
};

export const useAmbulanceState = () => {
  const [driver, setDriver] = useState<Driver>({
    id: 'drv-1',
    name: 'Officer Rodriguez',
    isOnline: false,
    currentLocation: INITIAL_LOCATION
  });

  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [rideHistory, setRideHistory] = useState<RideRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Simulate incoming requests when online
  useEffect(() => {
    if (driver.isOnline && !activeRide) {
      const interval = setInterval(() => {
        if (requests.length < 3 && Math.random() > 0.7) {
          const newRequest = {
            ...MOCK_REQUESTS[Math.floor(Math.random() * MOCK_REQUESTS.length)],
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
          };
          setRequests(prev => [newRequest, ...prev]);
          
          // Play sound alert (optional, but requested)
          // Handling potential audio play restrictions from the browser
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch((err) => {
            console.warn('Audio playback prevented by browser policy', err);
          });
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [driver.isOnline, activeRide, requests.length]);

  const toggleOnline = useCallback(() => {
    setDriver(prev => ({ ...prev, isOnline: !prev.isOnline }));
    if (driver.isOnline) {
      setRequests([]);
      setActiveRide(null);
    }
  }, [driver.isOnline]);

  const acceptRide = useCallback((id: string) => {
    const ride = requests.find(r => r.id === id);
    if (ride) {
      setActiveRide(ride);
      setRequests(prev => prev.filter(r => r.id !== id));
    }
  }, [requests]);

  const completeRide = useCallback(() => {
    if (activeRide) {
      setRideHistory(prev => [activeRide, ...prev]);
      setActiveRide(null);
    }
  }, [activeRide]);

  const logout = useCallback(() => {
    setIsLoggedOut(true);
    setDriver(prev => ({ ...prev, isOnline: false }));
    setActiveRide(null);
    setRequests([]);
  }, []);

  const updateDriverLocation = useCallback((lat: number, lng: number) => {
    setDriver(prev => ({
      ...prev,
      currentLocation: {
        ...prev.currentLocation,
        lat,
        lng
      }
    }));
  }, []);

  return {
    driver,
    activeRide,
    requests,
    rideHistory,
    isLoading,
    isLoggedOut,
    toggleOnline,
    acceptRide,
    completeRide,
    logout,
    updateDriverLocation
  };
};
