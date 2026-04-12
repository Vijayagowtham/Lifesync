import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { 
  Hospital as HospitalIcon, 
  MapPin, 
  Phone, 
  Star, 
  Bed, 
  Activity, 
  Users, 
  ChevronRight,
  Search,
  Filter,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hospital } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface HospitalStatusProps {
  hospitals: Hospital[];
  userLocation: [number, number] | null;
}

// ── Map Icons ────────────────────────────────────────────────────────────────
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

function BoundsController({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [points, map]);
  return null;
}

/** Haversine distance in km */
function haversineKm(
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number]
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HospitalStatus({ hospitals, userLocation }: HospitalStatusProps) {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHospitals = hospitals
    .filter(
      (h) =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) =>
      userLocation
        ? haversineKm(userLocation, [a.lat, a.lng]) -
          haversineKm(userLocation, [b.lat, b.lng])
        : a.distance - b.distance
    );

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hospital Status</h1>
          <p className="text-slate-500">View detailed availability and contact information for medical centers.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        {/* Hospital List */}
        <Card className="lg:col-span-1 border-none shadow-sm rounded-2xl flex flex-col overflow-hidden">
          <CardHeader className="pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input 
                placeholder="Search hospitals..." 
                className="pl-10 rounded-xl border-slate-100 bg-slate-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1 px-4 pb-4">
            <div className="space-y-3">
              {filteredHospitals.map((hospital) => (
                <div 
                  key={hospital.id}
                  onClick={() => setSelectedHospital(hospital)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                    selectedHospital?.id === hospital.id 
                      ? "border-primary bg-red-50" 
                      : "border-transparent bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900">{hospital.name}</h3>
                    <Badge className={
                      hospital.availability.status === 'Critical' 
                        ? "bg-red-100 text-red-600 border-none" 
                        : "bg-green-100 text-green-600 border-none"
                    }>
                      {userLocation
                        ? `${haversineKm(userLocation, [hospital.lat, hospital.lng]).toFixed(1)} km`
                        : `${hospital.distance} km`}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" /> {hospital.address}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < Math.floor(hospital.rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`} 
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-primary uppercase">{hospital.availability.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Detailed View */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl overflow-hidden bg-white relative">
          <AnimatePresence mode="wait">
            {selectedHospital ? (
              <motion.div
                key={selectedHospital.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <div className="h-48 bg-primary relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <img 
                    src={`https://picsum.photos/seed/${selectedHospital.id}/800/400`} 
                    alt={selectedHospital.name}
                    className="w-full h-full object-cover opacity-60"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 left-4 text-white hover:bg-white/20"
                    onClick={() => setSelectedHospital(null)}
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                  <div className="absolute bottom-6 left-8 text-white">
                    <h2 className="text-3xl font-bold">{selectedHospital.name}</h2>
                    <p className="text-white/80 flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4" /> {selectedHospital.address}
                    </p>
                  </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Bed className="text-primary w-5 h-5" />
                        </div>
                        <p className="font-bold text-slate-900">General Beds</p>
                      </div>
                      <p className="text-4xl font-bold text-slate-900">{selectedHospital.availability.beds}</p>
                      <p className="text-xs text-slate-500 mt-1">Available currently</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Activity className="text-primary w-5 h-5" />
                        </div>
                        <p className="font-bold text-slate-900">ICU Units</p>
                      </div>
                      <p className="text-4xl font-bold text-slate-900">{selectedHospital.availability.icu}</p>
                      <p className="text-xs text-slate-500 mt-1">Critical care units</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Users className="text-primary w-5 h-5" />
                        </div>
                        <p className="font-bold text-slate-900">On-duty Doctors</p>
                      </div>
                      <p className="text-4xl font-bold text-slate-900">{selectedHospital.availability.doctors}</p>
                      <p className="text-xs text-slate-500 mt-1">Specialists available</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h4>
                      <div className="flex flex-wrap gap-4">
                        <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-red-50 hover:text-primary hover:border-primary">
                          <Phone className="w-4 h-4 mr-2" />
                          {selectedHospital.contact}
                        </Button>
                        <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-red-50 hover:text-primary hover:border-primary">
                          <MapPin className="w-4 h-4 mr-2" />
                          Get Directions
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-4">Services Available</h4>
                      <div className="flex flex-wrap gap-2">
                        {["Emergency", "Cardiology", "Neurology", "Pediatrics", "Radiology", "Pharmacy"].map((service) => (
                          <Badge key={service} variant="secondary" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-medium">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {userLocation && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="pt-4 border-t border-slate-100"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-bold text-slate-900">Connection Path</h4>
                          <Badge className="bg-primary hover:bg-primary text-white text-sm px-3 py-1">
                            {haversineKm(userLocation, [selectedHospital.lat, selectedHospital.lng]).toFixed(2)} km
                          </Badge>
                        </div>
                        <div className="h-64 rounded-2xl overflow-hidden shadow-inner border border-slate-200 relative z-0">
                          <MapContainer 
                            center={[selectedHospital.lat, selectedHospital.lng]}
                            zoom={14} 
                            style={{ height: "100%", width: "100%", zIndex: 0 }}
                            scrollWheelZoom={false}
                          >
                            <TileLayer
                              attribution='&copy; OpenStreetMap'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <BoundsController points={[userLocation, [selectedHospital.lat, selectedHospital.lng]]} />
                            
                            <Marker position={userLocation} icon={userIcon} />
                            <Marker position={[selectedHospital.lat, selectedHospital.lng]} icon={hospitalIcon} />
                            
                            <Polyline 
                              positions={[userLocation, [selectedHospital.lat, selectedHospital.lng]]} 
                              pathOptions={{ 
                                color: '#EF4444', 
                                weight: 4, 
                                dashArray: '10, 10',
                                lineCap: 'round',
                                lineJoin: 'round'
                              }} 
                            />
                          </MapContainer>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="mt-12">
                    <Button className="w-full py-6 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-bold shadow-lg shadow-primary/20">
                      Book Emergency Appointment
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <HospitalIcon className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Select a Hospital</h3>
                <p className="text-slate-500 max-w-xs mt-2">
                  Choose a hospital from the list to view detailed availability and contact information.
                </p>
              </div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
