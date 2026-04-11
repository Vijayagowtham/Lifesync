import React from 'react';
import { ControlPanel } from '../components/ambulance/dashboard/ControlPanel';
import { MapView } from '../components/ambulance/dashboard/MapView';
import { useAmbulanceState } from '../hooks/ambulance/useAmbulanceState';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, LogIn } from 'lucide-react';

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - var(--topbar-height))', background: '#f8fafc' }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="bg-red-500 p-4 rounded-2xl shadow-xl shadow-red-100 mb-6"
        >
          <Activity className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800">Initializing Emergency Dashboard...</h2>
        <p className="text-gray-400 text-sm mt-2 font-medium">Connecting to mission control</p>
      </div>
    );
  }

  if (isLoggedOut) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: 'calc(100vh - var(--topbar-height))', background: '#f8fafc' }}>
        <Activity className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold tracking-tight text-gray-600">Session Ended</h2>
        <p className="text-gray-400 mt-2 font-medium">The driver has been signed out.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2.5 bg-red-500 text-white rounded-full font-bold shadow-lg shadow-red-100 hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" /> Login Again
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        height: 'calc(100vh - var(--topbar-height))',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        background: '#f8fafc',
        position: 'relative',
      }}
    >
      {/* Left Control Panel */}
      <div
        style={{
          width: 400,
          minWidth: 320,
          flexShrink: 0,
          height: '100%',
          background: '#fff',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '4px 0 20px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        {/* Driver Identity Strip */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={18} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{driver.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ambulance Driver</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: driver.isOnline ? '#10b981' : '#94a3b8',
                animation: driver.isOnline ? 'pulse 2s infinite' : 'none',
              }}
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: driver.isOnline ? '#10b981' : '#94a3b8' }}>
              {driver.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

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
      </div>

      {/* Right Map Area */}
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        <MapView
          driverLocation={driver.currentLocation}
          patientLocation={activeRide?.pickup}
        />

        {/* Floating Emergency Notification */}
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 2000, pointerEvents: 'none' }}>
          <AnimatePresence>
            {requests.length > 0 && !activeRide && driver.isOnline && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  padding: '14px 20px',
                  borderRadius: 16,
                  boxShadow: '0 8px 24px rgba(239,68,68,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  pointerEvents: 'auto',
                  minWidth: 260,
                }}
              >
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 10 }}>
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>New Emergency Request</p>
                  <p style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: 2 }}>
                    {requests[0].distance} away • {requests[0].patient.condition}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
