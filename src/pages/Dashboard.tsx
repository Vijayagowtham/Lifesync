import { 
  Activity, 
  MapPin, 
  Clock, 
  ChevronRight, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Bed, 
  Stethoscope,
  Ambulance as AmbulanceIcon,
  Hospital as HospitalIcon,
  Phone,
  Navigation,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hospital, Ambulance } from "../types";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

const chartData = [
  { time: "08:00", cases: 12 },
  { time: "10:00", cases: 18 },
  { time: "12:00", cases: 15 },
  { time: "14:00", cases: 25 },
  { time: "16:00", cases: 22 },
  { time: "18:00", cases: 30 },
  { time: "20:00", cases: 20 },
];

interface DashboardProps {
  hospitals: Hospital[];
  ambulances: Ambulance[];
  userLocation: [number, number] | null;
  onOpenChat: () => void;
}

/** Haversine distance in km between two lat/lng pairs */
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

export default function Dashboard({ hospitals, ambulances, userLocation, onOpenChat }: DashboardProps) {
  const totalBeds = hospitals.reduce((acc, h) => acc + h.availability.beds, 0);
  const totalICU = hospitals.reduce((acc, h) => acc + h.availability.icu, 0);
  const availableAmbulances = ambulances.filter(a => a.status === 'available').length;

  // Sort hospitals by real distance from user if location is available
  const sortedHospitals = userLocation
    ? [...hospitals].sort(
        (a, b) =>
          haversineKm(userLocation, [a.lat, a.lng]) -
          haversineKm(userLocation, [b.lat, b.lng])
      )
    : hospitals;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Health Overview</h1>
          <p className="text-slate-500">Real-time monitoring of healthcare resources in your area.</p>
        </div>
        <div className="flex gap-3 items-center">
          {userLocation && (
            <Badge className="bg-green-50 text-green-700 border-green-200 px-3 py-1 gap-1">
              <Navigation className="w-3 h-3" />
              {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
            </Badge>
          )}
          <Button variant="outline" className="rounded-xl" onClick={() => alert('Time range filters will be implemented in the next update.')}>
            <Clock className="w-4 h-4 mr-2" />
            Last 24 Hours
          </Button>
          <Button className="rounded-xl bg-primary hover:bg-primary/90" onClick={() => alert('Exporting health report to PDF...')}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                <Bed className="text-primary w-6 h-6" />
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-600 border-none">
                +2.4%
              </Badge>
            </div>
            <p className="text-slate-500 text-sm font-medium">Total Available Beds</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalBeds}</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                <Activity className="text-primary w-6 h-6" />
              </div>
              <Badge variant="secondary" className="bg-red-50 text-red-600 border-none">
                -1.2%
              </Badge>
            </div>
            <p className="text-slate-500 text-sm font-medium">ICU Capacity</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalICU}</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                <AmbulanceIcon className="text-primary w-6 h-6" />
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-600 border-none">
                Active
              </Badge>
            </div>
            <p className="text-slate-500 text-sm font-medium">Available Ambulances</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{availableAmbulances}</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                <Stethoscope className="text-primary w-6 h-6" />
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none">
                Stable
              </Badge>
            </div>
            <p className="text-slate-500 text-sm font-medium">On-duty Doctors</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">45</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Emergency Admissions</CardTitle>
              <p className="text-sm text-slate-500">Hourly admission rate across all centers</p>
            </div>
            <TrendingUp className="text-green-500 w-5 h-5" />
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cases" 
                  stroke="#DC2626" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCases)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Live Alerts */}
        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="text-primary w-5 h-5" />
              Live Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 rounded-xl border-l-4 border-primary">
              <div className="flex justify-between items-start mb-1">
                <p className="font-bold text-sm text-slate-900">Critical Shortage</p>
                <span className="text-[10px] text-slate-500 font-medium uppercase">2 mins ago</span>
              </div>
              <p className="text-xs text-slate-600">Blood type O- is running low at City General Hospital.</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-1">
                <p className="font-bold text-sm text-slate-900">Ambulance Dispatched</p>
                <span className="text-[10px] text-slate-500 font-medium uppercase">15 mins ago</span>
              </div>
              <p className="text-xs text-slate-600">Ambulance #AMB-2 is en-route to Northside district.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-1">
                <p className="font-bold text-sm text-slate-900">System Update</p>
                <span className="text-[10px] text-slate-500 font-medium uppercase">1 hour ago</span>
              </div>
              <p className="text-xs text-slate-600">All hospital databases are now synchronized.</p>
            </div>
            <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-red-50 rounded-xl text-sm font-bold" onClick={() => alert('Navigating to full alerts list...')}>
              View All Alerts
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recommended Hospital */}
        <Card className="border-none shadow-sm rounded-2xl bg-primary text-white">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <Badge className="bg-white/20 text-white border-none mb-2">Recommended for you</Badge>
                <h2 className="text-2xl font-bold">LifeCare Specialist Clinic</h2>
                <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> 0.8 km away • 5 mins drive
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl">
                <HospitalIcon className="w-8 h-8" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="text-[10px] text-white/60 uppercase font-bold">Beds</p>
                <p className="text-lg font-bold">20</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="text-[10px] text-white/60 uppercase font-bold">ICU</p>
                <p className="text-lg font-bold">6</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <p className="text-[10px] text-white/60 uppercase font-bold">Rating</p>
                <p className="text-lg font-bold">4.9</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 bg-white text-primary hover:bg-white/90 rounded-xl font-bold" onClick={() => alert('Appointment request submitted for LifeCare Specialist Clinic.')}>
                Book Appointment
              </Button>
              <Button variant="outline" className="bg-transparent border-white/30 hover:bg-white/10 text-white rounded-xl" onClick={() => alert('Calling LifeCare Specialist Clinic at +91 00000 00000...')}>
                <Phone className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Nearby Hospitals List */}
        <Card className="border-none shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Nearby Hospitals</CardTitle>
            <Button variant="ghost" className="text-primary font-bold text-sm" onClick={() => alert('Live Map navigation initiated.')}>View Map</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedHospitals.slice(0, 3).map((hospital) => {
              const dist = userLocation
                ? haversineKm(userLocation, [hospital.lat, hospital.lng]).toFixed(1)
                : hospital.distance.toFixed(1);
              return (
                <div key={hospital.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-red-50 transition-colors">
                      <HospitalIcon className="text-slate-400 group-hover:text-primary w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{hospital.name}</h4>
                      <p className="text-xs text-slate-500">{dist} km away • {hospital.availability.status}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 w-5 h-5 group-hover:text-primary transition-colors" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
