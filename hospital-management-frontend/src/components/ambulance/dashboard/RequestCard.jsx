import React from 'react';
import { MapPin, ArrowRight, Zap, Target, Radio } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/ambulance/utils';

export const RequestCard = ({ request, onAccept }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] hover:border-red-500/30 transition-all group overflow-hidden relative"
    >
      {/* ── Background Pulse for Critical ── */}
      {request.emergencyType === 'Critical' && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[40px] -mr-16 -mt-16 pointer-events-none" />
      )}

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="space-y-1.5">
           <div className="flex items-center gap-2">
              <Radio className="w-3 h-3 text-red-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-red-500">
                Incoming Emergency
              </span>
           </div>
           <h4 className="text-white font-black text-sm leading-tight group-hover:text-red-400 transition-colors uppercase tracking-tight">
             {request.hospitalName}
           </h4>
           <p className="text-white/50 text-[10px] uppercase font-bold">{request.driverName}</p>
        </div>
        <div className="text-right">
           <p className="text-white font-mono text-xs font-black">{new Date(request.timestamp).toLocaleTimeString()}</p>
           <p className="text-white/30 text-[9px] font-black uppercase mt-0.5 tracking-tighter">Request Time</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-white/50 mb-5 relative z-10 px-3 py-2 bg-black/20 rounded-xl border border-white/5">
        <Phone className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
        <p className="text-[10px] font-bold truncate opacity-80 uppercase tracking-tighter">{request.contact}</p>
      </div>

      <button
        onClick={() => onAccept(request.id)}
        className="w-full h-11 bg-white/[0.08] border border-white/10 group-hover:bg-red-600 group-hover:border-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl group-hover:shadow-red-600/20"
      >
        <span>Intercept Mission</span>
        <Target className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

