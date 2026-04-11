import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icons
const ambulanceIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1032/1032989.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const patientIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2838/2838912.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const RecenterMap = ({ location }) => {
  const map = useMap();
  React.useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], map.getZoom(), {
        animate: true,
        duration: 1.5
      });
    }
  }, [location, map]);
  return null;
};

export const MapView = ({ driverLocation, patientLocation }) => {
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={[driverLocation.lat, driverLocation.lng]}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={ambulanceIcon}>
          <Popup>
            <div className="font-sans">
              <p className="font-bold">Your Location</p>
              <p className="text-xs text-gray-500">{driverLocation.address}</p>
            </div>
          </Popup>
        </Marker>

        {patientLocation && (
          <Marker position={[patientLocation.lat, patientLocation.lng]} icon={patientIcon}>
            <Popup>
              <div className="font-sans">
                <p className="font-bold text-red-500">Patient Pickup</p>
                <p className="text-xs text-gray-500">{patientLocation.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        <RecenterMap location={patientLocation || driverLocation} />
      </MapContainer>

      {/* Map Controls Overlay */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[1000]">
        <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors font-bold text-xl">+</button>
        <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors font-bold text-xl">-</button>
      </div>
    </div>
  );
};
