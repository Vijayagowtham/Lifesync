import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Hospital, Ambulance } from "../types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Ambulance as AmbulanceIcon, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

// Fix Leaflet default icon
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// ── Map marker icons ──────────────────────────────────────────────────────────
const hospitalIcon = L.divIcon({
  className: "bg-transparent",
  html: `
    <div class="relative">
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 rounded-full blur-[2px]"></div>
      <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-md">
        <path d="M17 0C7.61116 0 0 7.61116 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.61116 26.3888 0 17 0Z" fill="#EF4444"/>
        <path d="M17 5C23.6274 5 29 10.3726 29 17C29 23.6274 23.6274 29 17 29C10.3726 29 5 23.6274 5 17C5 10.3726 10.3726 5 17 5Z" fill="white" fill-opacity="0.2"/>
        <rect x="15" y="10" width="4" height="14" rx="2" fill="white"/>
        <rect x="10" y="15" width="14" height="4" rx="2" fill="white"/>
      </svg>
    </div>
  `,
  iconSize: [34, 42],
  iconAnchor: [17, 42],
});

const ambulanceIcon = L.divIcon({
  className: "bg-transparent",
  html: `
    <div class="relative">
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 rounded-full blur-[2px]"></div>
      <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-md">
        <path d="M17 0C7.61116 0 0 7.61116 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.61116 26.3888 0 17 0Z" fill="#3B82F6"/>
        <path d="M17 5C23.6274 5 29 10.3726 29 17C29 23.6274 23.6274 29 17 29C10.3726 29 5 23.6274 5 17C5 10.3726 10.3726 5 17 5Z" fill="white" fill-opacity="0.2"/>
        <rect x="10" y="14" width="14" height="6" rx="1" fill="white"/>
        <path d="M17 12V18M14 15H20" stroke="#3B82F6" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </div>
  `,
  iconSize: [34, 42],
  iconAnchor: [17, 42],
});

const userIcon = L.divIcon({
  className: "bg-transparent",
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
      <div class="absolute w-6 h-6 bg-blue-500/20 rounded-full"></div>
      <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg shadow-blue-500/50"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// ── Fly-to controller (syncs map centre with prop) ────────────────────────────
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    // Only fly on initial load or if the user is significantly far from current view
    const currentCenter = map.getCenter();
    const distance = map.distance(L.latLng(center), currentCenter);
    
    if (distance > 1000) { // If moved more than 1km or initial
      map.flyTo(center, 14, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface LiveMapProps {
  hospitals: Hospital[];
  ambulances: Ambulance[];
  /** Real-time coordinates from the root App geolocation (always non-null here). */
  userLocation: [number, number] | null;
}

export default function LiveMap({ hospitals, ambulances, userLocation }: LiveMapProps) {
  // Fallback (should never be null when this page renders, but just in case)
  const center: [number, number] = userLocation ?? [40.7128, -74.006];

  return (
    <div className="h-full flex flex-col space-y-4 md:space-y-6">
      {/* ── Page header ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Live Resource Map</h1>
          <p className="text-sm text-slate-500">Real-time tracking of hospitals and ambulance units.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Live location badge */}
          <Badge className="bg-green-50 text-green-700 border-green-200 px-3 py-1 gap-1 text-[10px] md:text-xs">
            <Navigation className="w-3 h-3" />
            {center[0].toFixed(4)}, {center[1].toFixed(4)}
          </Badge>
          <Badge className="bg-red-50 text-primary border-primary/20 px-3 py-1 text-[10px] md:text-xs">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" />
            Live Tracking
          </Badge>
        </div>
      </motion.div>

      {/* ── Map card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 min-h-[400px] md:min-h-[500px]"
      >
        <Card className="h-full border-none shadow-sm rounded-2xl overflow-hidden relative">
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <MapController center={center} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User marker */}
          <Marker position={center} icon={userIcon}>
            <Popup className="custom-popup">
              <div className="p-2">
                <p className="font-bold text-slate-900">Your Location</p>
                <p className="text-xs text-slate-500">
                  {center[0].toFixed(5)}, {center[1].toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Hospital markers */}
          {hospitals.map((hospital) => (
            <Marker
              key={hospital.id}
              position={[hospital.lat, hospital.lng]}
              icon={hospitalIcon}
            >
              <Popup className="custom-popup">
                <div className="p-3 min-w-[200px]">
                  <h3 className="font-bold text-slate-900 mb-1">{hospital.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" /> {hospital.address}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Beds</p>
                      <p className="text-sm font-bold text-slate-900">
                        {hospital.availability.beds}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">ICU</p>
                      <p className="text-sm font-bold text-slate-900">
                        {hospital.availability.icu}
                      </p>
                    </div>
                  </div>
                  <Button className="w-full h-8 text-xs bg-primary rounded-lg">
                    View Details
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Ambulance markers */}
          {ambulances.map((ambulance) => (
            <Marker
              key={ambulance.id}
              position={[ambulance.location.lat, ambulance.location.lng]}
              icon={ambulanceIcon}
            >
              <Popup className="custom-popup">
                <div className="p-3 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <AmbulanceIcon className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-slate-900">Ambulance #{ambulance.id}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">Driver: {ambulance.driverName}</p>
                  <Badge
                    className={`mb-4 ${
                      ambulance.status === "available"
                        ? "bg-green-100 text-green-600"
                        : ambulance.status === "en-route"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-red-100 text-red-600"
                    } border-none`}
                  >
                    {ambulance.status.toUpperCase()}
                  </Badge>
                  <Button variant="outline" className="w-full h-8 text-xs rounded-lg border-slate-200">
                    <Phone className="w-3 h-3 mr-2" />
                    Contact Driver
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend overlay */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute top-4 right-4 z-[1000]"
        >
          <Card className="p-2 shadow-lg border-none rounded-xl bg-white/90 backdrop-blur">
            <div className="flex flex-col md:flex-row lg:flex-col gap-2">
              {[
                { color: "bg-primary",  label: "Hospitals" },
                { color: "bg-blue-600", label: "Ambulances" },
                { color: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]",label: "You" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2 px-2 py-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-[10px] md:text-xs font-bold text-slate-700">{label}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </Card>
    </motion.div>
  </div>
  );
}
