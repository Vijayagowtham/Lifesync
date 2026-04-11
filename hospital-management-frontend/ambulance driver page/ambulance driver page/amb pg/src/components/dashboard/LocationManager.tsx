import React, { useEffect } from 'react';
import { AlertTriangle, MapPin, Loader2, Navigation, PowerOff } from 'lucide-react';
import { useLiveLocation } from '../../hooks/useLiveLocation';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LocationManagerProps {
  onLocationUpdate: (lat: number, lng: number) => void;
}

export const LocationManager: React.FC<LocationManagerProps> = ({ onLocationUpdate }) => {
  const { status, error, requestLocation, stopTracking } = useLiveLocation((pos) => {
    onLocationUpdate(pos.lat, pos.lng);
  });

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full"
          >
            <button
              onClick={requestLocation}
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-200 hover:bg-red-600 transition-colors"
            >
              <Navigation className="w-5 h-5" />
              Enable Live Location 🚑
            </button>
          </motion.div>
        )}

        {status === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl flex items-center justify-center gap-2"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            Acquiring GPS Signal...
          </motion.div>
        )}

        {status === 'granted' && (
          <motion.div
            key="granted"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full bg-green-50 rounded-2xl border border-green-200 overflow-hidden"
          >
            <div className="p-4 flex items-center justify-between bg-green-100/50">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <p className="text-sm font-bold text-green-800">Location: ON</p>
              </div>
              <button 
                onClick={stopTracking}
                className="text-xs font-bold px-3 py-1.5 bg-white text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1 shadow-sm"
              >
                <PowerOff className="w-3.5 h-3.5" />
                Stop Tracking
              </button>
            </div>
          </motion.div>
        )}

        {(status === 'denied' || status === 'unavailable') && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full bg-red-50 p-4 rounded-2xl border border-red-200"
          >
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800 mb-1">
                  {status === 'denied' ? "Permission Denied 🚑" : "Location Not Available"}
                </p>
                <p className="text-xs text-red-600 mb-3">{error}</p>
                <button
                  onClick={requestLocation}
                  className="text-xs font-bold px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors w-full flex justify-center items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
