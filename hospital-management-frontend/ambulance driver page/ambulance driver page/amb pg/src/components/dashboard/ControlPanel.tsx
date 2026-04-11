import React, { useState } from 'react';
import { Power, ListFilter, AlertCircle, History, ClipboardList, BookOpen } from 'lucide-react';
import { RideRequest } from '../../types';
import { RideCard } from './RideCard';
import { RequestCard } from './RequestCard';
import { ProtocolModal } from './ProtocolModal';
import { LocationManager } from './LocationManager';
import { AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface ControlPanelProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  activeRide: RideRequest | null;
  requests: RideRequest[];
  rideHistory: RideRequest[];
  onAcceptRide: (id: string) => void;
  onCompleteRide: () => void;
  updateDriverLocation: (lat: number, lng: number) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isOnline,
  onToggleOnline,
  activeRide,
  requests,
  rideHistory,
  onAcceptRide,
  onCompleteRide,
  updateDriverLocation
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [isProtocolModalOpen, setProtocolModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Status Toggle */}
      <div className="p-6 pb-4">
        <button
          onClick={onToggleOnline}
          className={cn(
            "w-full p-4 rounded-2xl flex items-center justify-between transition-all duration-300 shadow-lg",
            isOnline 
              ? "bg-green-500 text-white shadow-green-200" 
              : "bg-gray-200 text-gray-500 shadow-gray-100"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-xl",
              isOnline ? "bg-white/20" : "bg-gray-300"
            )}>
              <Power className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">System Status</p>
              <p className="text-lg font-bold">{isOnline ? "Active & Online" : "System Offline"}</p>
            </div>
          </div>
          <div className={cn(
            "w-12 h-6 rounded-full relative transition-colors",
            isOnline ? "bg-white/30" : "bg-gray-400"
          )}>
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
              isOnline ? "right-1" : "left-1"
            )} />
          </div>
        </button>
      </div>

      <div className="px-6 pb-2">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('current')}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-colors",
              activeTab === 'current' ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-colors",
              activeTab === 'history' ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            History
          </button>
        </div>
      </div>

      <div className="px-6 pb-4 pt-2">
        <button 
          onClick={() => setProtocolModalOpen(true)}
          className="w-full py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors border border-blue-200"
        >
          <BookOpen className="w-4 h-4" />
          Emergency Protocols
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6 custom-scrollbar">
        <LocationManager onLocationUpdate={updateDriverLocation} />
        
        {activeTab === 'current' ? (
          <>
            {/* Active Ride Section */}
        {isOnline && activeRide && (
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-primary" />
              Active Mission
            </h2>
            <RideCard ride={activeRide} onComplete={onCompleteRide} />
          </section>
        )}

        {/* Requests Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <ListFilter className="w-3.5 h-3.5" />
              Incoming Requests ({requests.length})
            </h2>
          </div>

          {!isOnline ? (
            <div className="bg-gray-100 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">Go online to receive emergency requests</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <p className="text-gray-400 font-medium">Scanning for nearby emergencies...</p>
              <div className="mt-4 flex justify-center gap-1">
                <div className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {requests.map((request) => (
                  <RequestCard 
                    key={request.id} 
                    request={request} 
                    onAccept={onAcceptRide} 
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
          </>
        ) : (
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <History className="w-3.5 h-3.5" />
              Completed Missions ({rideHistory.length})
            </h2>
            
            {rideHistory.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No missions completed yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rideHistory.map((ride, idx) => (
                  <div key={`${ride.id}-${idx}`} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between shadow-xs">
                    <div>
                      <p className="font-bold text-secondary text-sm">{ride.patient.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{ride.pickup.address}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-md uppercase">
                        {ride.emergencyType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <ProtocolModal 
        isOpen={isProtocolModalOpen} 
        onClose={() => setProtocolModalOpen(false)} 
      />
    </div>
  );
};
