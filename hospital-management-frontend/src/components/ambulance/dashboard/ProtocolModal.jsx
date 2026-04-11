import React from 'react';
import { X, AlertCircle, HeartPulse, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProtocolModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                <ShieldAlert className="w-6 h-6 text-red-500" />
                Emergency Protocols
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Trauma Protocol */}
              <div className="space-y-3">
                <h3 className="font-bold flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  Major Trauma Protocol
                </h3>
                <ul className="space-y-2 pl-4 text-sm text-gray-600 list-disc marker:text-orange-300">
                  <li>Ensure scene safety before approach</li>
                  <li>Apply C-spine stabilization immediately</li>
                  <li>Control massive hemorrhage (Tourniquet/Pressure)</li>
                  <li>Assess airway and assist ventilation if needed</li>
                  <li>Prepare for rapid transport (Load & Go)</li>
                </ul>
              </div>

              {/* Cardiac Protocol */}
              <div className="space-y-3">
                <h3 className="font-bold flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <HeartPulse className="w-5 h-5" />
                  Cardiac Arrest Protocol
                </h3>
                <ul className="space-y-2 pl-4 text-sm text-gray-600 list-disc marker:text-red-300">
                  <li>Initiate high-quality CPR (100-120/min)</li>
                  <li>Attach AED/Defibrillator immediately</li>
                  <li>Administer oxygen and manage airway</li>
                  <li>Establish IV/IO access safely</li>
                  <li>Minimize interruptions in chest compressions</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button onClick={onClose} className="w-full py-3 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition-colors">
                Close Reference
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
