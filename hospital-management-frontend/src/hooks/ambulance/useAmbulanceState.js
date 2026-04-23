import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../supabase';
import { useLiveLocation } from './useLiveLocation';

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

  // Throttle ref: only push GPS to DB every 3 seconds
  const lastGpsPushRef = useRef(0);

  // ── Wire live GPS to Supabase broadcast ──
  const handlePositionUpdate = useCallback(async (pos) => {
    setDriver(prev => ({
      ...prev,
      currentLocation: { ...prev.currentLocation, lat: pos.lat, lng: pos.lng }
    }));

    const now = Date.now();
    if (now - lastGpsPushRef.current > 3000) {
      lastGpsPushRef.current = now;
      await supabase
        .from('ambulances')
        .update({ lat: pos.lat, lng: pos.lng, status: 'On Call' })
        .eq('id', 'drv-101');
    }
  }, []);

  const { requestLocation, stopTracking } = useLiveLocation(handlePositionUpdate);

  // ── Initial Data Fetch & Realtime Subscription ──
  useEffect(() => {
    if (!driver.isOnline) return;

    // Start real GPS tracking
    requestLocation();

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
          const newRecord = payload.new;
          
          if (payload.eventType === 'INSERT') {
            if (newRecord.status === 'pending') {
              setRequests(prev => [newRecord, ...prev]);
              // Alert sound
              new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
            }
          } else if (payload.eventType === 'UPDATE') {
            setRequests(prev => prev.filter(r => r.id !== newRecord.id && newRecord.status === 'pending'));
            
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
      stopTracking();
      supabase.removeChannel(channel);
    };
  }, [driver.isOnline, activeRide?.id]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const toggleOnline = useCallback(() => {
    const goingOnline = !driver.isOnline;
    setDriver(prev => ({ ...prev, isOnline: goingOnline }));
    if (!goingOnline) {
      stopTracking();
      setRequests([]);
      setActiveRide(null);
      // Mark ambulance available again
      supabase.from('ambulances').update({ status: 'Available' }).eq('id', 'drv-101').then();
    }
  }, [driver.isOnline, stopTracking]);

  const acceptRide = useCallback(async (id) => {
    try {
      const { data, error } = await supabase
        .from('ambulance_requests')
        .update({ 
          status: 'accepted',
          driver_name: driver.name,
          driver_phone: driver.contact   // ✅ Fixed: was 'contact', schema column is 'driver_phone'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setActiveRide(data);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to accept ride', err);
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
      console.error('Failed to complete ride', err);
    }
  }, [activeRide]);

  const logout = useCallback(() => {
    stopTracking();
    setIsLoggedOut(true);
    setDriver(prev => ({ ...prev, isOnline: false }));
    setActiveRide(null);
    setRequests([]);
  }, [stopTracking]);

  const updateDriverLocation = useCallback(async (lat, lng, speed = 0, heading = 0) => {
    setDriver(prev => ({
      ...prev,
      currentLocation: { ...prev.currentLocation, lat, lng },
      currentSpeed: speed,
      heading: heading
    }));

    // Broadcast to Supabase for other dashboards (throttled)
    const now = Date.now();
    if (now - lastGpsPushRef.current > 3000) {
      lastGpsPushRef.current = now;
      await supabase.from('ambulances').update({ lat, lng }).eq('id', driver.id);
    }
  }, [driver.id]);

  // ── Simulation Mode Logic (when on active ride) ──
  useEffect(() => {
    if (!driver.isOnline || !activeRide) return;

    const interval = setInterval(() => {
      setDriver(prev => {
        const targetLat = activeRide.lat;
        const targetLng = activeRide.lng;
        const curLat = prev.currentLocation.lat;
        const curLng = prev.currentLocation.lng;

        const step = 0.0005;
        const diffLat = targetLat - curLat;
        const diffLng = targetLng - curLng;
        const distance = Math.sqrt(diffLat * diffLat + diffLng * diffLng);

        if (distance < step) {
          clearInterval(interval);
          return prev;
        }

        const nextLat = curLat + (diffLat / distance) * step;
        const nextLng = curLng + (diffLng / distance) * step;
        const angle = Math.atan2(diffLng, diffLat) * (180 / Math.PI);

        // Push to DB (throttled via ref)
        const now = Date.now();
        if (now - lastGpsPushRef.current > 3000) {
          lastGpsPushRef.current = now;
          supabase.from('ambulances').update({ 
            lat: nextLat, 
            lng: nextLng, 
            status: 'On Call' 
          }).eq('id', prev.id).then();
        }

        return {
          ...prev,
          currentLocation: { ...prev.currentLocation, lat: nextLat, lng: nextLng },
          currentSpeed: Math.floor(Math.random() * 20) + 40,
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
