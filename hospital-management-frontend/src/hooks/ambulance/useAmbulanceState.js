import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase';

const INITIAL_LOCATION = {
  lat: 13.0827,
  lng: 80.2707,
  address: 'LifeSync Medical Center'
};

export const useAmbulanceState = () => {
  const [driver, setDriver] = useState({
    id: 'drv-101',
    name: 'Officer Rodriguez',
    contact: '+91 91234 56789',
    isOnline: false,
    currentLocation: INITIAL_LOCATION,
    currentSpeed: 0,
    heading: 0
  });

  const [activeRide, setActiveRide] = useState(null);
  const [requests, setRequests] = useState([]);
  const [rideHistory, setRideHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // ── Initial Data Fetch & Realtime Subscription ──
  useEffect(() => {
    if (!driver.isOnline) return;

    // 1. Initial Fetch
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('ambulance_requests')
        .select('*')
        .neq('status', 'completed');
      
      if (!error && data) {
        setRequests(data.filter(r => r.status === 'pending'));
        const active = data.find(r => r.status === 'accepted' || r.status === 'en-route');
        if (active) setActiveRide(active);
      }
    };
    fetchRequests();

    // 2. Realtime Channel
    const channel = supabase
      .channel('ambulance-dispatch')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ambulance_requests' },
        (payload) => {
          console.log('[Supabase Realtime] Dispatch update:', payload);
          const newRecord = payload.new;
          
          if (payload.eventType === 'INSERT') {
            if (newRecord.status === 'pending') {
              setRequests(prev => [newRecord, ...prev]);
              // alert sound
              new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
            }
          } else if (payload.eventType === 'UPDATE') {
            // Update requests list
            setRequests(prev => prev.filter(r => r.id !== newRecord.id && newRecord.status === 'pending'));
            
            // Update active ride
            if (activeRide && activeRide.id === newRecord.id) {
              if (newRecord.status === 'completed') {
                setRideHistory(prev => [newRecord, ...prev]);
                setActiveRide(null);
              } else {
                setActiveRide(newRecord);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driver.isOnline, activeRide?.id]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const toggleOnline = useCallback(() => {
    setDriver(prev => ({ ...prev, isOnline: !prev.isOnline }));
    if (driver.isOnline) {
      setRequests([]);
      setActiveRide(null);
    }
  }, [driver.isOnline]);

  const acceptRide = useCallback(async (id) => {
    try {
      const { data, error } = await supabase
        .from('ambulance_requests')
        .update({ 
          status: 'accepted',
          driver_name: driver.name,
          contact: driver.contact
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setActiveRide(data);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to accept ride", err);
    }
  }, [driver.name, driver.contact]);

  const completeRide = useCallback(async () => {
    if (!activeRide) return;
    try {
      const { error } = await supabase
        .from('ambulance_requests')
        .update({ status: 'completed' })
        .eq('id', activeRide.id);

      if (error) throw error;
      setRideHistory(prev => [activeRide, ...prev]);
      setActiveRide(null);
    } catch (err) {
      console.error("Failed to complete ride", err);
    }
  }, [activeRide]);

  const logout = useCallback(() => {
    setIsLoggedOut(true);
    setDriver(prev => ({ ...prev, isOnline: false }));
    setActiveRide(null);
    setRequests([]);
  }, []);

  const updateDriverLocation = useCallback(async (lat, lng, speed = 0, heading = 0) => {
    setDriver(prev => ({
      ...prev,
      currentLocation: { ...prev.currentLocation, lat, lng },
      currentSpeed: speed,
      heading: heading
    }));

    // Broadcast to Supabase for other users/dashboards
    await supabase.from('ambulances').update({ lat, lng }).eq('id', driver.id);
  }, [driver.id]);

  // ── Simulation Mode Logic ──
  useEffect(() => {
    if (!driver.isOnline || !activeRide) return;

    const interval = setInterval(() => {
      setDriver(prev => {
        const targetLat = activeRide.lat;
        const targetLng = activeRide.lng;
        const curLat = prev.currentLocation.lat;
        const curLng = prev.currentLocation.lng;

        // Simple linear interpolation for simulation
        const step = 0.0005; // speed factor
        const diffLat = targetLat - curLat;
        const diffLng = targetLng - curLng;
        const distance = Math.sqrt(diffLat * diffLat + diffLng * diffLng);

        if (distance < step) {
          clearInterval(interval);
          return prev;
        }

        const nextLat = curLat + (diffLat / distance) * step;
        const nextLng = curLng + (diffLng / distance) * step;
        
        // Calculate heading (angle)
        const angle = Math.atan2(diffLng, diffLat) * (180 / Math.PI);

        // Update database (Throttled ideally, but for simulation every tick is fine)
        supabase.from('ambulances').update({ 
          lat: nextLat, 
          lng: nextLng, 
          status: 'On Call' 
        }).eq('id', prev.id).then();

        return {
          ...prev,
          currentLocation: { ...prev.currentLocation, lat: nextLat, lng: nextLng },
          currentSpeed: Math.floor(Math.random() * 20) + 40, // 40-60 km/h
          heading: angle
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [driver.isOnline, activeRide]);

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
