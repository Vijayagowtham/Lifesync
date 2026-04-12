import React, { useState } from 'react';
import { Power, ListFilter, AlertCircle, History, ClipboardList, BookOpen, Shield, Radar, Wifi, MapPin } from 'lucide-react';
import { RideCard } from './RideCard';
import { RequestCard } from './RequestCard';
import { ProtocolModal } from './ProtocolModal';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../../lib/ambulance/utils';

export const ControlPanel = ({
  isOnline,
  onToggleOnline,
  activeRide,
  requests,
  rideHistory,
  onAcceptRide,
  onCompleteRide,
  updateDriverLocation
}) => {
  const [activeTab, setActiveTab] = useState('current');
  const [isProtocolModalOpen, setProtocolModalOpen] = useState(false);

  return (
    <div className="flex flex-col max-h-[85vh] h-[580px] bg-[#0f1115] text-white overflow-hidden rounded-[32px] border border-white/10 shadow-2xl">
      
      {/* ── Header: Operation Status ── */}
      <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5 shrink-0">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <div className={cn("w-2 h-2 rounded-full", isOnline ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-white/20")} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Network Status</p>
           </div>
           <h2 className="text-xl font-black tracking-tight">{isOnline ? "OPERATIONAL" : "STANDBY"}</h2>
        </div>
        <button
          onClick={onToggleOnline}
          className={cn(
            "p-4 rounded-2xl transition-all duration-500 group",
            isOnline 
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500" 
              : "bg-white/5 border border-white/10 text-white/30"
          )}
        >
          <Power className={cn("w-6 h-6 transition-transform group-active:scale-90", isOnline && "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]")} />
        </button>
      </div>

      {/* ── Operation Tabs ── */}
      <div className="flex border-b border-white/5 shrink-0">
        <button
          onClick={() => setActiveTab('current')}
          className={cn(
            "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'current' ? "text-white bg-white/5 border-b-2 border-red-500" : "text-white/30 hover:text-white/60"
          )}
        >
          Mission Control
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'history' ? "text-white bg-white/5 border-b-2 border-red-500" : "text-white/30 hover:text-white/60"
          )}
        >
          Archive
        </button>
      </div>

      {/* ── Mission Control Content ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
        <AnimatePresence mode="wait">
          {activeTab === 'current' ? (
            <motion.div 
               key="current"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-6"
            >
              {/* Active Mission HUD - High Priority */}
              {isOnline && activeRide && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />
                    <h3 className="text-[9px] font-black text-red-500 uppercase tracking-[0.15em]">Primary Objective</h3>
                  </div>
                  <RideCard ride={activeRide} onComplete={onCompleteRide} />
                </section>
              )}

              {/* Request Stack - Hidden when active ride is present to avoid clutter */}
              {!activeRide && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Radar className="w-3 h-3 text-white/40" />
                        <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">Scanning Grid...</h3>
                     </div>
                     <span className="text-[9px] font-black bg-white/5 px-2 py-0.5 rounded text-white/40">{requests.length} SIGNALS</span>
                  </div>

                  {!isOnline ? (
                    <div className="py-12 flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                         <Wifi className="w-6 h-6 text-white/20" />
                      </div>
                      <div>
                         <p className="text-white font-bold text-sm">Offline</p>
                         <p className="text-white/30 text-xs mt-1">Initialize link to receive data</p>
                      </div>
                    </div>
                  ) : requests.length === 0 ? (
                    <div className="py-12 border border-dashed border-white/5 rounded-3xl flex flex-col items-center space-y-4">
                       <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_20px_#ef4444]" 
                       />
                       <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.1em]">Awaiting Pulse</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {requests.map((request) => (
                          <RequestCard key={request.id} request={request} onAccept={onAcceptRide} />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </section>
              )}
            </motion.div>
          ) : (
            <motion.div 
               key="history"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-4"
            >
              <div className="flex items-center gap-2">
                 <History className="w-3 h-3 text-white/40" />
                 <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">Operation Logs</h3>
              </div>

              {rideHistory.length === 0 ? (
                <div className="py-16 text-center text-white/20 italic text-sm">No historical logs found</div>
              ) : (
                <div className="space-y-2">
                  {rideHistory.map((ride, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={`${ride.id}-${idx}`} 
                      className="group bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm">{ride.hospitalName}</p>
                        <div className="flex items-center gap-1.5 mt-1 opacity-40 text-[10px]">
                           <Shield className="w-2.5 h-2.5" />
                           <p className="truncate">{ride.driverName}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black px-2 py-1 bg-white/10 text-white/60 rounded uppercase">
                        {ride.emergencyType}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Protocol Footer ── */}
      <div className="p-4 border-t border-white/5 shrink-0">
         <button
            onClick={() => setProtocolModalOpen(true)}
            className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-2xl border border-red-500/20 flex items-center justify-center gap-2 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Protocols
          </button>
      </div>


      <ProtocolModal isOpen={isProtocolModalOpen} onClose={() => setProtocolModalOpen(false)} />
    </div>
  );
};

