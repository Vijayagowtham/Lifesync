import { 
  Ambulance as AmbulanceIcon, 
  Phone, 
  MapPin, 
  Clock, 
  Activity, 
  User, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Navigation
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ambulance } from "../types";
import { motion } from "motion/react";

interface AmbulancePanelProps {
  ambulances: Ambulance[];
}

export default function AmbulancePanel({ ambulances }: AmbulancePanelProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ambulance Support</h1>
          <p className="text-slate-500">Request emergency transport or track active ambulance units.</p>
        </div>
        <Button className="rounded-2xl bg-primary hover:bg-primary/90 py-6 px-8 text-lg font-bold shadow-lg shadow-primary/20">
          <AlertCircle className="w-6 h-6 mr-2" />
          Request Emergency Help
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Units List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="text-primary w-5 h-5" />
            Active Units
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ambulances.map((ambulance) => (
              <Card key={ambulance.id} className="border-none shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        ambulance.status === 'available' ? 'bg-green-50 text-green-600' : 
                        ambulance.status === 'en-route' ? 'bg-blue-50 text-blue-600' : 
                        'bg-red-50 text-red-600'
                      }`}>
                        <AmbulanceIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Unit #{ambulance.id}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <User className="w-3 h-3" /> {ambulance.driverName}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${
                      ambulance.status === 'available' ? 'bg-green-100 text-green-600' : 
                      ambulance.status === 'en-route' ? 'bg-blue-100 text-blue-600' : 
                      'bg-red-100 text-red-600'
                    } border-none px-3 py-1 rounded-lg`}>
                      {ambulance.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Current Location
                      </span>
                      <span className="font-bold text-slate-900">Downtown Area</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Est. Response Time
                      </span>
                      <span className="font-bold text-slate-900">
                        {ambulance.status === 'available' ? '5-8 mins' : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold">
                      <Navigation className="w-4 h-4 mr-2" />
                      Track Unit
                    </Button>
                    <Button variant="outline" className="rounded-xl border-slate-200 hover:bg-red-50 hover:text-primary hover:border-primary">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Request Status / Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="text-primary w-5 h-5" />
            Your Requests
          </h2>
          <Card className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="font-bold text-slate-900">No Active Requests</h3>
                <p className="text-sm text-slate-500 mt-2">
                  You haven't requested any ambulance services recently.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-primary text-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-xs">01</span>
                </div>
                <p className="text-xs text-white/70">Stay calm and provide your exact location to the dispatcher.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-xs">02</span>
                </div>
                <p className="text-xs text-white/70">Keep your phone line clear for incoming calls from the driver.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-xs">03</span>
                </div>
                <p className="text-xs text-white/70">Prepare any medical records or ID cards for the paramedics.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
