/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Hospital as HospitalIcon,
  Map as MapIcon,
  Ambulance as AmbulanceIcon,
  Bell,
  Search,
  Activity,
  MapPin,
  LogOut,
  Navigation,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Hospital, Ambulance } from "./types";
import Chatbot from "./components/Chatbot";
import ProfileModal, { UserProfile } from "./components/ProfileModal";
import { supabase } from "./lib/supabase";

// Pages
import Dashboard from "./pages/Dashboard";
import HospitalStatus from "./pages/HospitalStatus";
import LiveMap from "./pages/LiveMap";
import AmbulancePanel from "./pages/AmbulancePanel";
import AuthPage from "./pages/AuthPage";

type Page = "dashboard" | "hospitals" | "map" | "ambulance";
type LocationStatus = "pending" | "requesting" | "granted" | "denied" | "unavailable";

const DEFAULT_PROFILE: UserProfile = {
  name: "User",
  email: "user@lifesync.health",
  avatarUrl: "https://picsum.photos/seed/user/100/100",
};

// ── Location Permission Gate ─────────────────────────────────────────────────
function LocationGate({
  status,
  onRequest,
}: {
  status: LocationStatus;
  onRequest: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-red-700 to-red-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-primary p-4 rounded-2xl shadow-lg shadow-primary/30">
            <Activity className="text-white w-10 h-10" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Life Sync</h1>
        <p className="text-slate-500 text-sm mb-8">Healthcare at your fingertips</p>
        
        {status === "denied" || status === "unavailable" ? (
          <div className="space-y-6">
            <div className="bg-red-50 rounded-2xl p-6">
              <AlertTriangle className="w-10 h-10 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Location Access Required</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {status === "unavailable" ? "Your browser does not support location services." : "Location access is required to find nearby hospitals."}
              </p>
            </div>
            {status === "denied" && (
              <Button onClick={onRequest} className="w-full py-6 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Navigation className="w-5 h-5 mr-2" /> Try Again
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-red-50 rounded-2xl p-6">
              {status === "requesting" ? (
                <>
                  <Loader2 className="w-10 h-10 text-primary mx-auto mb-3 animate-spin" />
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Detecting Your Location…</h2>
                  <p className="text-sm text-slate-600">Please accept the browser permission prompt to continue.</p>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Allow Location Access</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Life Sync needs your current location to show nearby hospitals, ambulances, and emergency services in real time.
                  </p>
                </>
              )}
            </div>
            {status !== "requesting" && (
              <Button onClick={onRequest} className="w-full py-6 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Navigation className="w-5 h-5 mr-2" /> Allow Location Access
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("pending");
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // ── Auth Session Check & Loading Timeout ──
  useEffect(() => {
    let mounted = true;

    // Safety timeout: Never stay in loading state more than 8 seconds
    const safetyTimeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 8000);

    async function checkUser() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (mounted && session?.user) {
          setIsLoggedIn(true);
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileData) {
            setProfile(profileData);
          } else {
            setProfile({
              name: session.user.email?.split('@')[0] || "User",
              email: session.user.email || "",
              avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
            });
          }
        }
      } catch (err: any) {
        console.error("Auth session check failed or timed out:", err);
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
    }
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoggedIn(true);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profileData) setProfile(profileData);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setProfile(DEFAULT_PROFILE);
        setLocationStatus("pending");
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (userData: UserProfile) => {
    setIsLoggedIn(true);
    setProfile(userData);
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }
    setLocationStatus("requesting");
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocationStatus("granted");
      },
      (err) => {
        console.error("Location error:", err);
        setLocationStatus(prev => prev === "granted" ? "granted" : "denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }
    setLocationStatus("requesting");
  }, []);

  // Fetch hospitals & ambulances
  useEffect(() => {
    if (locationStatus !== 'granted') return;
    const fetchData = async () => {
      try {
        const params = userLocation ? `?lat=${userLocation[0]}&lng=${userLocation[1]}` : "";
        const [hospRes, ambRes] = await Promise.all([
          fetch(`/api/hospitals${params}`),
          fetch(`/api/ambulances${params}`),
        ]);
        
        if (hospRes.ok) setHospitals(await hospRes.json());
        if (ambRes.ok) setAmbulances(await ambRes.json());
      } catch (err) {
        console.error("Critical fetching error:", err);
      }
    };
    fetchData();
  }, [userLocation, locationStatus]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("lifesync_auth");
    localStorage.removeItem("lifesync_profile");
    sessionStorage.clear();
    setIsLoggedIn(false);
    setUserLocation(null);
    setLocationStatus("pending");
  };

  const handleProfileSave = async (updated: UserProfile) => {
    setProfile(updated);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('profiles').update({
        name: updated.name,
        avatar_url: updated.avatarUrl
      }).eq('id', session.user.id);
    }
  };

  // Initials for avatar fallback
  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const menuItems = [
    { id: "dashboard", label: "Dashboard",       icon: LayoutDashboard },
    { id: "hospitals", label: "Hospital Status", icon: HospitalIcon },
    { id: "map",       label: "Live Map",         icon: MapIcon },
    { id: "ambulance", label: "Ambulance Info",  icon: AmbulanceIcon },
  ];

  // Show Login if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading LifeSync…</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <AuthPage onLogin={handleLogin} onOpenChat={() => setChatOpen(true)} />
        <Chatbot hospitals={[]} isOpen={chatOpen} setIsOpen={setChatOpen} />
      </>
    );
  }

  // Show location gate until granted
  if (locationStatus !== "granted") {
    return <LocationGate status={locationStatus} onRequest={requestLocation} />;
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-white overflow-hidden">
        {/* ── Sidebar ── */}
        <AnimatePresence>
          {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
            <motion.aside 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`w-[280px] bg-primary text-white flex flex-col z-50 fixed md:relative h-full flex-shrink-0 shadow-2xl md:shadow-none`}
            >
              {/* Brand */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-xl">
                    <Activity className="text-primary w-6 h-6" />
                  </div>
                  <span className="font-bold text-xl tracking-tight">Life Sync</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden text-white hover:bg-white/10"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Live location badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-4 mb-4 px-4 py-2 bg-white/10 rounded-xl flex items-center gap-2 text-xs text-white/80"
              >
                <MapPin className="w-3 h-3 text-green-300 flex-shrink-0" />
                <span className="truncate">
                  {userLocation
                    ? `${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}`
                    : "Locating…"}
                </span>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0 ml-auto" />
              </motion.div>

              {/* Nav */}
              <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id as Page);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
                      activePage === item.id
                        ? "bg-white/20 text-white shadow-lg"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-6 h-6 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}

                {/* ── AI Insights inside Left Sidebar ── */}
                <div className="mt-6 p-4 bg-gradient-to-br from-white/10 to-transparent rounded-2xl border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Sparkles className="w-16 h-16 text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-3 relative z-10">
                    <div className="p-1.5 bg-white/20 rounded-md">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-white text-sm">AI Insights</h3>
                  </div>
                  
                  <div className="space-y-3 relative z-10">
                    <p className="text-[11px] text-white/80 leading-relaxed">
                      Based on your location, <span className="font-bold text-white">City General Hospital</span> currently has the lowest waiting times.
                    </p>
                    <p className="text-[11px] text-white/80 leading-relaxed">
                      Heavy traffic detected. AI suggests the <span className="font-bold text-white">Western Bypass</span> in an emergency.
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/10 relative z-10">
                    <Button 
                      onClick={() => setChatOpen(true)}
                      className="w-full bg-white hover:bg-white/90 text-primary rounded-xl shadow-lg h-9 text-xs font-bold"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-2" />
                      Ask AI
                    </Button>
                  </div>
                </div>
              </nav>

              {/* Profile mini-card in sidebar */}
              <div className="p-4 border-t border-white/10 bg-primary/50 mt-auto">
                <button
                  onClick={() => setProfileOpen(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all group text-left"
                >
                  <Avatar className="w-9 h-9 border-2 border-white/30 flex-shrink-0">
                    <AvatarImage src={profile.avatarUrl} />
                    <AvatarFallback className="bg-white/20 text-white text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{profile.name}</p>
                    <p className="text-[11px] text-white/60 truncate">{profile.email}</p>
                  </div>
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="mt-1 w-full flex items-center gap-4 p-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all group"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span className="font-medium text-sm">Logout</span>
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Main Content ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Navbar */}
          <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 z-40">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              onClick={() => setSidebarOpen(true)}
            >
              <LayoutDashboard className="w-6 h-6 text-slate-600" />
            </Button>
            
            {/* Search */}
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search hospitals, services..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Live location status */}
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Location Active
              </div>

              <Separator orientation="vertical" className="h-8" />

              {/* Bell */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5 text-slate-600" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>

              {/* Profile button — clicking opens the modal */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    id="profile-btn"
                    onClick={() => setProfileOpen(true)}
                    className="flex items-center gap-3 pl-1 pr-3 py-1.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                  >
                    <Avatar className="w-9 h-9 border-2 border-primary/15 group-hover:border-primary/40 transition-all">
                      <AvatarImage src={profile.avatarUrl} />
                      <AvatarFallback className="bg-red-50 text-primary font-bold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-bold text-slate-900 leading-tight">
                        {profile.name}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Edit Profile
                      </p>
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Edit Profile</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-8" />

              {/* Logout */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-slate-500 hover:text-primary hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Logout</TooltipContent>
              </Tooltip>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Syncing healthcare data…</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={activePage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {activePage === "dashboard" && (
                    <Dashboard
                      hospitals={hospitals}
                      ambulances={ambulances}
                      userLocation={userLocation}
                      onOpenChat={() => setChatOpen(true)}
                    />
                  )}
                  {activePage === "hospitals" && (
                    <HospitalStatus hospitals={hospitals} userLocation={userLocation} />
                  )}
                  {activePage === "map" && (
                    <LiveMap
                      hospitals={hospitals}
                      ambulances={ambulances}
                      userLocation={userLocation}
                    />
                  )}
                  {activePage === "ambulance" && (
                    <AmbulancePanel ambulances={ambulances} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        {/* ── AI Chatbot ── */}
        <Chatbot 
          hospitals={hospitals} 
          isOpen={chatOpen} 
          setIsOpen={setChatOpen} 
        />

        {/* ── Profile Modal ── */}
        <ProfileModal
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          profile={profile}
          onSave={handleProfileSave}
        />
      </div>
    </TooltipProvider>
  );
}
