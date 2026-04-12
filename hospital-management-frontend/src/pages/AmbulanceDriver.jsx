import React from 'react';
import { ControlPanel } from '../components/ambulance/dashboard/ControlPanel';
import MapView from '../components/ambulance/dashboard/MapView';
import { useAmbulanceState } from '../hooks/ambulance/useAmbulanceState';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, LogIn, Navigation, Shield, Zap, AlertTriangle } from 'lucide-react';

export default function AmbulanceDriver() {
  const {
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
  } = useAmbulanceState();

  if (isLoggedOut) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-white overflow-hidden p-6 text-center">
         <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-8 border border-red-500/30"
         >
           <Activity className="w-10 h-10 text-red-500" />
         </motion.div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-4">Mission Terminated</h2>
        <p className="text-gray-400 max-w-sm mb-10 leading-relaxed">Your active session has ended. All active tracking and emergency monitoring systems are offline.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-white text-black rounded-2xl font-black shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 uppercase tracking-widest text-sm"
        >
          <LogIn className="w-5 h-5" /> Re-Authorize
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#0f1115]">
      {/* ── Background Map Canvas ── */}
      <div className="absolute inset-0 z-0">
        <MapView
          driverLocation={driver.currentLocation}
          patientLocation={activeRide ? { lat: activeRide.lat, lng: activeRide.lng, address: activeRide.patientName } : null}
          activeRide={activeRide}
        />
      </div>

      {/* ── Top Status HUD ── */}
      <div className="absolute top-6 left-6 right-6 flex items-start justify-between z-10 pointer-events-none">
        <div className="flex gap-4 pointer-events-auto">
          {/* Driver Identity Glass */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-4 px-5 py-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-2xl"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-inner">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <motion.div 
                animate={{ scale: driver.isOnline ? [1, 1.2, 1] : 1 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1a1c22] ${driver.isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`} 
              />
            </div>
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-wider">{driver.name}</h3>
              <p className="text-white/50 text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1">
                <Shield className="w-3 h-3 text-red-500" /> Authorized Responder
              </p>
            </div>
          </motion.div>

          {/* Telemetry HUD */}
          <AnimatePresence>
            {driver.isOnline && (
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="flex items-center gap-8 px-8 py-4 bg-[#0f1115]/80 backdrop-blur-xl border border-white/5 rounded-[24px] shadow-2xl"
              >
                <div className="text-center">
                  <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">SPD</p>
                  <p className="text-white font-mono text-xl font-black leading-none">{driver.currentSpeed}<span className="text-[10px] ml-1 opacity-40">KM/H</span></p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">HDG</p>
                  <p className="text-white font-mono text-xl font-black leading-none">{Math.round(driver.heading % 360)}°<span className="text-[10px] ml-1 opacity-40">NW</span></p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System Alerts Container */}
        <div className="flex flex-col gap-3 items-end pointer-events-auto">
          <AnimatePresence>
            {requests.length > 0 && !activeRide && driver.isOnline && (
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                className="bg-red-600/90 backdrop-blur-md border border-red-500/50 p-5 rounded-2xl shadow-[0_20px_50px_rgba(220,38,38,0.3)] flex items-center gap-5 min-w-[320px]"
              >
                 <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg transform -rotate-12 animate-pulse">
                   <Zap className="w-6 h-6 text-red-600" />
                 </div>
                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-0.5">
                     <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                     <p className="text-white font-black text-xs uppercase tracking-widest">Immediate Response Required</p>
                   </div>
                   <h4 className="text-white text-lg font-black leading-tight">Emergency Code Red</h4>
                   <p className="text-white/70 text-xs font-bold mt-1 uppercase">
                     {requests[0].patientName} • Dist: Pending Sync
                   </p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Floating Command Panel (Draggable/Interactable) ── */}
      <div className="absolute bottom-6 left-6 w-[420px] max-w-[90vw] z-50">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#0f1115]/90 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          <ControlPanel
            isOnline={driver.isOnline}
            onToggleOnline={toggleOnline}
            activeRide={activeRide}
            requests={requests}
            rideHistory={rideHistory}
            onAcceptRide={acceptRide}
            onCompleteRide={completeRide}
            updateDriverLocation={updateDriverLocation}
          />
        </motion.div>
      </div>

      {/* ── Status HUD Right Overlay ── */}
      <div className="absolute right-6 bottom-6 flex flex-col gap-3 z-10">
         <div className="px-5 py-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-right">
            <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Satellite Status</p>
            <p className="text-emerald-500 text-xs font-black uppercase flex items-center justify-end gap-2">
               Active Link <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            </p>
         </div>
      </div>

      {/* ── Emergency Screen Flash (On Request) ── */}
      <AnimatePresence>
        {requests.length > 0 && !activeRide && driver.isOnline && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.05, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-red-600 pointer-events-none z-[1]"
          />
        )}
      </AnimatePresence>

    </div>
  );
}
