import { useState, useRef, useCallback } from 'react';

export const useLiveLocation = (onPositionUpdate) => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  const handleSuccess = useCallback((pos) => {
    setStatus('granted');
    setError(null);
    const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    
    if (onPositionUpdate) {
      onPositionUpdate(newPos);
    }
  }, [onPositionUpdate]);

  const handleError = useCallback((err) => {
    stopTracking();
    if (err.code === err.PERMISSION_DENIED) {
      setStatus('denied');
      setError("Location access denied. Please go to browser settings and enable location permissions.");
    } else if (err.code === err.POSITION_UNAVAILABLE) {
      setStatus('unavailable');
      setError("Location not available. Please ensure your GPS is turned on.");
    } else {
      setStatus('unavailable');
      setError("An unknown error occurred while trying to fetch location.");
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable');
      setError("Your browser does not support geolocation tracking.");
      return;
    }

    setStatus('loading');
    
    // Immediately attempt to get current position for snappier feedback
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleSuccess(pos);
        // Then start continuous tracking
        if (watchIdRef.current === null) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            { enableHighAccuracy: true, maximumAge: 0 }
          );
        }
      },
      handleError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [handleSuccess, handleError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setStatus('idle');
  }, []);

  return {
    status,
    error,
    requestLocation,
    stopTracking
  };
};
