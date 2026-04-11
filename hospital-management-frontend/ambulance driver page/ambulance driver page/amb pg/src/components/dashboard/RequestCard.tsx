import React from 'react';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { RideRequest } from '../../types';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface RequestCardProps {
  request: RideRequest;
  onAccept: (id: string) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onAccept }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-1">
          <span className={cn(
            "w-fit px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider",
            request.emergencyType === 'Critical' ? "bg-red-100 text-red-600" : 
            request.emergencyType === 'Moderate' ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
          )}>
            {request.emergencyType}
          </span>
          <h4 className="font-bold text-secondary">{request.patient.condition}</h4>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-primary">{request.distance}</p>
          <p className="text-[10px] text-gray-400 font-mono">{request.eta}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-500 mb-4">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <p className="text-xs truncate">{request.pickup.address}</p>
      </div>

      <button
        onClick={() => onAccept(request.id)}
        className="w-full bg-gray-50 group-hover:bg-primary group-hover:text-white text-secondary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
      >
        Accept Request
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};
