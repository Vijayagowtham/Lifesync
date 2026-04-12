import { useState, useEffect } from "react";
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
  Navigation,
  Loader2,
  Shield,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ambulance } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";

interface AmbulancePanelProps {
  ambulances: Ambulance[];
  user?: any;
}

export default function AmbulancePanel({ ambulances, user }: AmbulancePanelProps) {
  const [activeRequest, setActiveRequest] = useState<any>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  // ── Supabase Realtime Subscription ──
  useEffect(() => {
    if (!activeRequest?.id) return;

    console.log(`[Supabase] Subscribing to request: ${activeRequest.id}`);
    
    const channel = supabase
      .channel(`request-${activeRequest.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ambulance_requests',
          filter: `id=eq.${activeRequest.id}`,
        },
        (payload) => {
          console.log('[Supabase] Real-time update received:', payload);
          const updated = payload.new as any;
          setActiveRequest(prev => {
            if (!prev) return null;
            return {
              ...prev,
              status: updated.status,
              driverName: updated.driver_name,
              hospitalName: updated.hospital_name,
              contact: updated.contact,
              lat: updated.lat,
              lng: updated.lng
            };
          });

          if (updated.status === 'completed') {
            setTimeout(() => setActiveRequest(null), 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRequest?.id]);

  // Handle Live Location Tracking (Direct to Supabase)
  useEffect(() => {
    if (activeRequest?.status !== 'accepted' && activeRequest?.status !== 'en-route') return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Directly update Supabase for lower latency and better persistence
        await supabase
          .from('ambulance_requests')
          .update({ lat: latitude, lng: longitude })
          .eq('id', activeRequest.id);
      },
      (err) => console.error("Location tracking error", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [activeRequest?.status, activeRequest?.id]);

  const handleRequestHelp = async (selectedAmbulance?: any) => {
    setIsRequesting(true);
    const target = selectedAmbulance || ambulances[0] || { driverName: "Emergency Response", contact: "+91 98765 43210" };
    
    try {
      // Get current location first
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        
        const { data, error } = await supabase
          .from('ambulance_requests')
          .insert([{
            driver_name: target.driverName,
            hospital_name: "LifeSync General",
            contact: target.contact || user?.contact || "+91 98765 43210",
            lat: latitude,
            lng: longitude,
            status: 'pending'
          }])
          .select()
          .single();

        if (error) throw error;
        
        setActiveRequest(data);
        setIsRequesting(false);
      }, (err) => {
        console.error("Location access denied", err);
        alert("Location access is required for emergency requests.");
        setIsRequesting(false);
      });
    } catch (err) {
      console.error("Request failed", err);
      setIsRequesting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ambulance Support</h1>
          <p className="text-slate-500">Request emergency transport or track active ambulance units.</p>
        </div>
        {!activeRequest ? (
          <Button 
            onClick={handleRequestHelp}
            disabled={isRequesting}
            className="rounded-2xl bg-primary hover:bg-primary/90 py-6 px-8 text-lg font-bold shadow-lg shadow-primary/20"
          >
            {isRequesting ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : <AlertCircle className="w-6 h-6 mr-2" />}
            Request Emergency Help
          </Button>
        ) : (
          <Badge className="bg-red-50 text-red-600 border-red-100 py-3 px-6 rounded-2xl text-lg font-black animate-pulse">
            EMERGENCY ACTIVE
          </Badge>
        )}
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
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {!activeRequest ? (
                  <motion.div 
                    key="no-request"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center py-8"
                  >
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="font-bold text-slate-900">No Active Requests</h3>
                    <p className="text-sm text-slate-500 mt-2">
                      You haven't requested any ambulance services recently.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="active-request"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                   >
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Status</p>
                        <h4 className="text-red-600 font-bold uppercase">{activeRequest.status}</h4>
                      </div>
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Activity className="text-red-500 animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                           <User className="w-4 h-4 text-slate-400" />
                         </div>
                         <div>
                           <p className="text-[9px] font-bold text-slate-400 uppercase">Hospital</p>
                           <p className="text-sm font-bold">{activeRequest.hospitalName}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                           <User className="w-4 h-4 text-slate-400" />
                         </div>
                         <div>
                           <p className="text-[9px] font-bold text-slate-400 uppercase">Driver</p>
                           <p className="text-sm font-bold">{activeRequest.driverName}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                           <Phone className="w-4 h-4 text-slate-400" />
                         </div>
                         <div>
                           <p className="text-[9px] font-bold text-slate-400 uppercase">Contact</p>
                           <p className="text-sm font-bold">{activeRequest.contact}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                           <Clock className="w-4 h-4 text-slate-400" />
                         </div>
                         <div>
                           <p className="text-[9px] font-bold text-slate-400 uppercase">Time Requested</p>
                           <p className="text-sm font-bold">{new Date(activeRequest.timestamp).toLocaleTimeString()}</p>
                         </div>
                      </div>
                    </div>

                    {activeRequest.status === 'accepted' || activeRequest.status === 'en-route' ? (
                       <Button className="w-full bg-slate-900 text-white rounded-xl py-6 font-bold flex items-center justify-center gap-2">
                         <Navigation className="w-5 h-5" /> Live Tracking Active
                       </Button>
                    ) : (
                       <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                         <Loader2 className="animate-spin text-slate-400" />
                         <span className="text-xs font-medium text-slate-500">Connecting to nearest medical dispatch...</span>
                       </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
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
