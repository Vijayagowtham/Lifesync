import React from 'react';
import { Navbar } from './components/Navbar';
import { ControlPanel } from './components/dashboard/ControlPanel';
import { MapView } from './components/dashboard/MapView';
import { useAmbulanceState } from './hooks/useAmbulanceState';
import { motion, AnimatePresence } from 'motion/react';
import { Activity } from 'lucide-react';

export default function App() {
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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="bg-primary p-4 rounded-2xl shadow-xl shadow-red-100 mb-6"
        >
          <Activity className="w-12 h-12 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold tracking-tight">LifeSync</h1>
        <p className="text-gray-400 text-sm mt-2">Initializing Emergency Dashboard...</p>
      </div>
    );
  }

  if (isLoggedOut) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
        <Activity className="w-12 h-12 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold tracking-tight text-gray-600">LifeSync</h1>
        <p className="text-gray-400 mt-2">You have been logged out.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-6 py-2 bg-primary text-white rounded-full font-medium"
        >
          Login Again
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Navbar driverName={driver.name} isOnline={driver.isOnline} onLogout={logout} />
      
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Panel - Controls */}
        <div className="w-full md:w-[400px] lg:w-[450px] h-full bg-white border-r border-gray-100 z-10 shadow-xl">
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

        {/* Right Panel - Map */}
        <div className="flex-1 h-full relative">
          <MapView 
            driverLocation={driver.currentLocation} 
            patientLocation={activeRide?.pickup}
          />
          
          {/* Mobile Bottom Sheet Indicator (Visual only for now) */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 h-1 bg-gray-300 w-12 mx-auto rounded-full mb-2 z-20" />
        </div>

        {/* Global Notifications Overlay */}
        <div className="absolute top-6 right-6 z-[2000] pointer-events-none">
          <AnimatePresence>
            {requests.length > 0 && !activeRide && driver.isOnline && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="bg-primary text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto"
              >
                <div className="bg-white/20 p-2 rounded-xl">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <p className="font-bold text-sm">New Emergency Request</p>
                  <p className="text-xs opacity-80">{requests[0].distance} away • {requests[0].patient.condition}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
