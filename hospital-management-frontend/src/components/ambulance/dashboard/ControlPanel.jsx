import React, { useState } from 'react';
import { Power, ListFilter, AlertCircle, History, ClipboardList, BookOpen } from 'lucide-react';
import { RideCard } from './RideCard';
import { RequestCard } from './RequestCard';
import { ProtocolModal } from './ProtocolModal';
import { LocationManager } from './LocationManager';
import { AnimatePresence } from 'motion/react';
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
    <div className="flex flex-col h-full overflow-hidden bg-white">
      
      {/* Top Header Section with Status & Tabs */}
      <div className="flex flex-col shrink-0 border-b border-slate-100 p-5 space-y-5">
        
        {/* Status Toggle Button */}
        <button
          onClick={onToggleOnline}
          className={cn(
            "w-full p-4 rounded-2xl flex items-center justify-between transition-all duration-300 shadow-sm border",
            isOnline
              ? "bg-emerald-500 border-emerald-400 text-white shadow-emerald-200/50 hover:bg-emerald-600"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white"
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn("p-2.5 rounded-xl transition-colors", isOnline ? "bg-white/20" : "bg-slate-200")}>
              <Power className={cn("w-5 h-5", isOnline ? "text-white" : "text-slate-500")} />
            </div>
            <div className="text-left">
              <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-0.5", isOnline ? "text-emerald-100" : "text-slate-400")}>System Status</p>
              <p className="text-base font-bold leading-tight">{isOnline ? "Active & Online" : "System Offline"}</p>
            </div>
          </div>
          {/* Toggle pill */}
          <div className={cn("w-12 h-6 rounded-full relative transition-colors flex-shrink-0 border", isOnline ? "bg-emerald-600 border-emerald-400" : "bg-slate-300 border-slate-400")}>
            <div className={cn("absolute top-[1px] w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300", isOnline ? "right-[1px]" : "left-[1px]")} />
          </div>
        </button>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setActiveTab('current')}
            className={cn(
              "flex-1 py-2.5 text-[13px] font-bold rounded-lg transition-all duration-200",
              activeTab === 'current'
                ? "bg-white text-red-600 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 py-2.5 text-[13px] font-bold rounded-lg transition-all duration-200",
              activeTab === 'history'
                ? "bg-white text-red-600 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            )}
          >
            History
          </button>
        </div>

        {/* Emergency Protocols Button */}
        <button
          onClick={() => setProtocolModalOpen(true)}
          className="w-full py-3 text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-md hover:shadow-red-200/50"
        >
          <BookOpen className="w-4 h-4" />
          Emergency Protocols
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-5">
        <LocationManager onLocationUpdate={updateDriverLocation} />

        {activeTab === 'current' ? (
          <>
            {/* Active Mission */}
            {isOnline && activeRide && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Mission</h2>
                </div>
                <RideCard ride={activeRide} onComplete={onCompleteRide} />
              </section>
            )}

            {/* Incoming Requests */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <ListFilter className="w-3.5 h-3.5 text-slate-400" />
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Incoming Requests ({requests.length})
                </h2>
              </div>

              {!isOnline ? (
                <div className="bg-slate-50 rounded-2xl p-8 text-center border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-medium">Go online to receive emergency requests</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-8 text-center">
                  <p className="text-slate-400 text-sm font-medium">Scanning for nearby emergencies...</p>
                  <div className="mt-4 flex justify-center gap-1">
                    <div className="w-1.5 h-1.5 bg-red-400/50 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-red-400/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-red-400/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
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
          </>
        ) : (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Completed Missions ({rideHistory.length})
              </h2>
            </div>

            {rideHistory.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-10 text-center border border-slate-100">
                <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium">No missions completed yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rideHistory.map((ride, idx) => (
                  <div key={`${ride.id}-${idx}`} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{ride.patient.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{ride.pickup.address}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg uppercase flex-shrink-0">
                      {ride.emergencyType}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <ProtocolModal isOpen={isProtocolModalOpen} onClose={() => setProtocolModalOpen(false)} />
    </div>
  );
};
