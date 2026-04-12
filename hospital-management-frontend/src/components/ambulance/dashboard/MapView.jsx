import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'motion/react';

// Custom Pulse Icon for Driver
const driverPulseIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-12 h-12 bg-emerald-500/20 rounded-full animate-ping"></div>
      <div class="absolute w-8 h-8 bg-emerald-500/40 rounded-full animate-pulse"></div>
      <div class="relative w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center">
        <div class="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Emergency Patient Icon
const patientPulseIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-16 h-16 bg-red-500/20 rounded-full animate-ping"></div>
      <svg width="34" height="42" viewBox="0 0 34 42" fill="none" class="relative drop-shadow-2xl">
        <path d="M17 0C7.61116 0 0 7.61116 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.61116 26.3888 0 17 0Z" fill="#ef4444"/>
        <path d="M17 5C23.6274 5 29 10.3726 29 17C29 23.6274 23.6274 29 17 29C10.3726 29 5 23.6274 5 17C5 10.3726 10.3726 5 17 5Z" fill="white" fill-opacity="0.2"/>
        <circle cx="17" cy="17" r="6" fill="white"/>
      </svg>
    </div>
  `,
  iconSize: [34, 42],
  iconAnchor: [17, 42],
});

const MapController = ({ driverLocation, patientLocation }) => {
  const map = useMap();
  React.useEffect(() => {
    if (patientLocation && driverLocation) {
      const bounds = L.latLngBounds(
        [driverLocation.lat, driverLocation.lng],
        [patientLocation.lat, patientLocation.lng]
      );
      map.fitBounds(bounds, { padding: [100, 100], animate: true });
    } else if (driverLocation) {
      map.flyTo([driverLocation.lat, driverLocation.lng], 14, { animate: true });
    }
  }, [driverLocation, patientLocation, map]);
  return null;
};

export default function MapView({ driverLocation, patientLocation, activeRide }) {
  const routePositions = patientLocation ? [
    [driverLocation.lat, driverLocation.lng],
    [patientLocation.lat, patientLocation.lng]
  ] : [];

  return (
    <div className="w-full h-full relative group">
      <MapContainer
        center={[driverLocation.lat, driverLocation.lng]}
        zoom={14}
        className="w-full h-full grayscale-[0.2] brightness-[0.8]"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverPulseIcon}>
          <Popup className="premium-popup">
            <div className="p-1">
              <p className="font-black text-xs uppercase tracking-widest text-[#1a1c22]">Your Unit</p>
              <p className="text-[10px] text-gray-400 mt-1">{driverLocation.address}</p>
            </div>
          </Popup>
        </Marker>

        {patientLocation && (
          <>
            <Marker position={[patientLocation.lat, patientLocation.lng]} icon={patientPulseIcon}>
              <Popup className="premium-popup">
                <div className="p-1">
                  <p className="font-black text-xs uppercase tracking-widest text-red-600">Distress Signal</p>
                  <p className="text-[10px] text-gray-400 mt-1">{patientLocation.address}</p>
                </div>
              </Popup>
            </Marker>
            
            <Polyline 
              positions={routePositions}
              pathOptions={{ 
                color: '#ef4444', 
                weight: 4, 
                opacity: 0.6,
                dashArray: '10, 15',
                lineCap: 'round'
              }}
            />
          </>
        )}

        <MapController driverLocation={driverLocation} patientLocation={patientLocation} />
      </MapContainer>

      {/* Map Vignetee */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.5)] z-[1]" />

      <style>{`
        .premium-popup .leaflet-popup-content-wrapper {
          background: #ffffff;
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .premium-popup .leaflet-popup-tip {
          background: #ffffff;
        }
      `}</style>
    </div>
  );
};

