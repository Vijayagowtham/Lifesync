import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, CheckCircle, Navigation, Activity } from 'lucide-react';
import { RideRequest } from '../../types';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface RideCardProps {
  ride: RideRequest;
  onComplete: () => void;
}

export const RideCard: React.FC<RideCardProps> = ({ ride, onComplete }) => {
  const [heartRate, setHeartRate] = useState(85);
  const [spo2, setSpo2] = useState(98);

  useEffect(() => {
    // Simulate real-time vitals
    const interval = setInterval(() => {
      setHeartRate(prev => Math.max(60, Math.min(150, prev + Math.floor(Math.random() * 5 - 2))));
      setSpo2(prev => Math.max(88, Math.min(100, prev + Math.floor(Math.random() * 3 - 1))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <span className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
          ride.emergencyType === 'Critical' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
        )}>
          Active Emergency: {ride.emergencyType}
        </span>
        <span className="text-xs text-gray-400 font-mono">{ride.eta} away</span>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-secondary">{ride.patient.name}</h3>
          <p className="text-sm text-gray-500">{ride.patient.condition}</p>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1 p-1.5 bg-gray-50 rounded-lg">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold tracking-tight">Pickup Location</p>
            <p className="text-sm font-medium leading-tight mt-0.5">{ride.pickup.address}</p>
          </div>
        </div>

          <div className="flex flex-col gap-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Navigation className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Distance</p>
                  <p className="text-sm font-bold">{ride.distance}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">ETA</p>
                  <p className="text-sm font-bold">{ride.eta}</p>
                </div>
              </div>
            </div>

            {/* Simulated Vitals */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl border border-red-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-500 animate-pulse" />
                  <p className="text-[10px] text-red-600 font-bold uppercase">Heart Rate</p>
                </div>
                <p className="text-sm font-bold text-red-700">{heartRate} <span className="text-[10px] font-normal">bpm</span></p>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  </div>
                  <p className="text-[10px] text-blue-600 font-bold uppercase">SpO2</p>
                </div>
                <p className="text-sm font-bold text-blue-700">{spo2}<span className="text-[10px] font-normal">%</span></p>
              </div>
            </div>
          </div>

        <div className="flex flex-col gap-3 pt-4">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ride.pickup.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <Navigation className="w-4 h-4" />
            Live Navigation
          </a>
          <div className="flex gap-3">
            <button className="flex-1 bg-secondary text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-colors">
              <Phone className="w-4 h-4" />
              Call Patient
            </button>
            <button 
              onClick={onComplete}
              className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
            >
              <CheckCircle className="w-4 h-4" />
              Complete Ride
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
