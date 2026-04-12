import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, CheckCircle, Navigation, Activity, Heart, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/ambulance/utils';

export const RideCard = ({ ride, onComplete }) => {
  const [heartRate, setHeartRate] = useState(85);
  const [spo2, setSpo2] = useState(98);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => Math.max(60, Math.min(150, prev + Math.floor(Math.random() * 5 - 2))));
      setSpo2(prev => Math.max(88, Math.min(100, prev + Math.floor(Math.random() * 3 - 1))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!ride) return null;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-[#0f1115] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl ring-1 ring-white/5"
    >
      {/* ── Status Header ── */}
      <div className="p-5 pb-4 border-b border-white/5 bg-gradient-to-br from-red-600/10 via-transparent to-transparent">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]" />
             <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Active Intercept</span>
          </div>
          <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-red-500/20 text-red-500 border-red-500/30">
            EMERGENCY
          </span>
        </div>

        <div className="flex items-end justify-between">
           <div>
              <h3 className="text-xl font-black text-white tracking-tight">{ride.hospitalName}</h3>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter mt-1 flex items-center gap-1.5">
                 <Shield className="w-3 h-3 text-red-500" /> UNIT: {ride.driverName}
              </p>
           </div>
           <div className="text-right">
              <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">REQ ID</p>
              <p className="text-white font-mono text-lg font-black leading-none">#{ride.id.slice(-4)}</p>
           </div>
        </div>
      </div>

      {/* ── Medical Monitor Section ── */}
      <div className="p-5 grid grid-cols-2 gap-4 border-b border-white/5 bg-black/20">
         <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
               <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
               <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Heart Rate</p>
            </div>
            <p className="text-2xl font-mono font-black text-red-500 leading-none">{heartRate}<span className="text-[10px] font-bold text-white/20 ml-1">BPM</span></p>
         </div>
         <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/5 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
               <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">SPO2 Status</p>
            </div>
            <p className="text-2xl font-mono font-black text-blue-500 leading-none">{spo2}<span className="text-[10px] font-bold text-white/20 ml-1">%</span></p>
         </div>
      </div>

      {/* ── Action Section ── */}
      <div className="p-6 space-y-4">
        {/* Destination HUD */}
        <div className="flex items-start gap-4">
           <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <MapPin className="w-5 h-5 text-red-500" />
           </div>
           <div className="flex-1 min-w-0">
              <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Live Tracking Active</p>
              <p className="text-white text-xs font-bold leading-relaxed">
                Lat: {ride.lat.toFixed(4)}, Lng: {ride.lng.toFixed(4)}
                <br/>
                Contact: {ride.contact}
              </p>
           </div>
        </div>

        {/* Action Matrix */}
        <div className="space-y-3">
           <a
             href={`https://www.google.com/maps/dir/?api=1&destination=${ride.lat},${ride.lng}`}
             target="_blank"
             rel="noopener noreferrer"
             className="w-full h-14 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
           >
             <Navigation className="w-4 h-4" /> Start Live Guidance
           </a>
           <div className="flex gap-3">
              <button className="flex-1 h-12 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                 <Phone className="w-4 h-4" /> Comms
              </button>
              <button 
                 onClick={onComplete}
                 className="flex-[2] h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
              >
                 <CheckCircle className="w-4 h-4" /> Complete Mission
              </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

