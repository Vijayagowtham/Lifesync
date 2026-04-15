/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Map as MapIcon, 
  Hospital as HospitalIcon, 
  Ambulance, 
  Sparkles,
  Search,
  MessageSquare,
  Navigation,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Bell
} from 'lucide-react';
import MapView from '../components/ambulance/dashboard/MapView';

export default function UserDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState([13.0827, 80.2707]); // Default Chennai
  const [locationStatus, setLocationStatus] = useState('granted');
  const [aiInsight, setAiInsight] = useState('Analyzing health telemetry...');
  const [chatVisible, setChatVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const triageChips = [
    "I have a severe headache",
    "Where is the nearest ICU?",
    "Is my heart rate normal?",
    "Hospital with O+ blood"
  ];

  const fetchInsights = async (customQuery = null) => {
    setChatLoading(true);
    try {
      const AI_URL = import.meta.env.VITE_AI_API_URL || 'http://127.0.0.1:5000/api';
      const res = await fetch(`${AI_URL}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: customQuery || 'Provide a brief summary based on my pulse.',
          vitals: { bpm: 72, temp: 98.6 },
          location: userLocation
        })
      });
      const data = await res.json();
      setAiInsight(data.insight);
      if (customQuery) setChatVisible(true);
    } catch (err) {
      setAiInsight('Environmental sensors active. System monitoring in progress.');
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    // Simulate data fetch
    setTimeout(() => {
        setHospitals([
            { id: 1, name: 'Apollo Speciality Hospital', distance: '1.2 km', status: 'Available', lat: 13.0850, lng: 80.2720 },
            { id: 2, name: 'City Government Medical Center', distance: '2.5 km', status: 'Moderate', lat: 13.0800, lng: 80.2650 },
            { id: 3, name: 'St. Mary’s Emergency Hub', distance: '4.8 km', status: 'Busy', lat: 13.0900, lng: 80.2800 },
        ]);
        setLoading(false);
    }, 1500);

    // Get real location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                setLocationStatus('granted');
            },
            () => setLocationStatus('denied')
        );
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden font-inter">
      {/* ── Page Content ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-10 flex justify-between items-end"
          >
            <div>
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 mb-2 text-red-600 font-bold text-xs uppercase tracking-widest"
                >
                    <Activity size={14} /> System Online
                </motion.div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                    Hello, <span className="text-red-700">{user?.name || 'Member'}</span>
                </h1>
                <p className="text-slate-500 font-medium mt-1">Universal health tracking and emergency response hub.</p>
            </div>
          </motion.header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map Preview Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative h-[400px] bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 group"
            >
                <div className="absolute top-6 left-6 z-10 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm flex items-center gap-2">
                    <MapPin size={14} className="text-red-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Nearby Hospitals</span>
                </div>
                <MapView center={userLocation} zoom={13} markers={hospitals} />
                <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 shadow-inner rounded-[32px]"></div>
            </motion.div>

            {/* Local Stats & AI Insights */}
            <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                    <motion.div 
                      whileHover={{ y: -5 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      className="p-8 bg-black rounded-[32px] text-white shadow-xl hover:shadow-2xl transition-all"
                    >
                        <Activity className="text-red-500 mb-6" size={24} />
                        <div className="text-4xl font-black mb-1 tracking-tighter">72</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resting BPM</div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ y: -5 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-lg hover:shadow-2xl transition-all"
                    >
                        <HospitalIcon className="text-red-600 mb-6" size={24} />
                        <div className="text-4xl font-black mb-1 tracking-tighter">{hospitals.length}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nearby Facilities</div>
                    </motion.div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="p-8 bg-gradient-to-br from-red-700 to-red-900 rounded-[32px] text-white relative overflow-hidden shadow-2xl transition-all"
                >
                    <Sparkles className="absolute -top-4 -right-4 w-32 h-32 opacity-10" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="flex items-center gap-2 font-black text-sm uppercase tracking-[0.2em]">
                              <Sparkles size={16} /> LifeSync Carebot
                          </h3>
                          {chatLoading && <Loader2 className="animate-spin" size={16} />}
                        </div>

                        <div className="max-h-[120px] overflow-y-auto mb-6 custom-scrollbar">
                           <p className="text-lg font-medium leading-relaxed italic opacity-90">
                              "{aiInsight}"
                           </p>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                           {triageChips.map((chip, i) => (
                             <button
                               key={i}
                               onClick={() => fetchInsights(chip)}
                               className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/5 rounded-full text-[10px] font-bold tracking-wide transition-all"
                             >
                               {chip}
                             </button>
                           ))}
                        </div>

                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask Carebot anything..."
                            className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:bg-white/20 transition-all"
                            onKeyPress={(e) => e.key === 'Enter' && fetchInsights(query)}
                          />
                          <button 
                            onClick={() => fetchInsights(query)}
                            disabled={chatLoading}
                            className="p-3 bg-white text-red-900 rounded-2xl hover:scale-105 transition-all"
                          >
                            <MessageSquare size={18} />
                          </button>
                        </div>
                    </div>
                </motion.div>
            </div>
          </div>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-12 mb-20"
          >
            <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Nearby Facilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hospitals.map((h, i) => (
                    <motion.div 
                      key={h.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + (i * 0.1) }}
                      whileHover={{ scale: 1.02 }}
                      className="p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-xl transition-all group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-red-50 rounded-2xl group-hover:bg-red-600 transition-colors">
                                <HospitalIcon size={18} className="text-red-600 group-hover:text-white" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h.distance}</span>
                        </div>
                        <h4 className="font-black text-slate-900 mb-1">{h.name}</h4>
                        <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${h.status === 'Available' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                             <span className="text-xs font-bold text-slate-400">{h.status} Beds Available</span>
                        </div>
                    </motion.div>
                ))}
            </div>
          </motion.section>
        </main>

        {/* Right: Notification / Sidebar Hub */}
        <motion.aside 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-96 bg-white border-l border-slate-100 hidden xl:flex flex-col p-8 overflow-y-auto"
        >
            <div className="flex items-center justify-between mb-10">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Health Feed</h3>
                <Bell size={18} className="text-slate-400" />
            </div>

            <div className="space-y-6">
                {[
                    { title: 'Vaccination Alert', time: '2h ago', body: 'Free flu shots available at City Central.', color: 'bg-blue-500' },
                    { title: 'AI Observation', time: '5h ago', body: 'Heart rate was slightly elevated during sleep.', color: 'bg-red-500' },
                    { title: 'Policy Update', time: '1d ago', body: 'New medical records encryption enabled.', color: 'bg-emerald-500' },
                ].map((n, i) => (
                    <motion.div 
                      key={i} 
                      variant="hover"
                      whileHover={{ x: 5 }}
                      className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group"
                    >
                        <div className={`w-1 h-full rounded-full ${n.color} group-hover:w-2 transition-all`} />
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <h5 className="font-black text-slate-900 text-xs uppercase tracking-wider">{n.title}</h5>
                                <span className="text-[10px] text-slate-400 font-bold">{n.time}</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{n.body}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              className="mt-auto p-8 bg-slate-900 rounded-[32px] text-white overflow-hidden relative"
            >
                <Activity className="absolute -bottom-8 -right-8 w-32 h-32 text-white/5 opacity-40 rotate-12" />
                <h4 className="text-lg font-black mb-4 tracking-tight">Help & Support</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">Need assistance with your records or emergency services?</p>
                <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-red-500 hover:gap-4 transition-all cursor-pointer">
                    Chat with Expert <ArrowRight size={14} />
                </div>
            </motion.div>
        </motion.aside>
      </div>

      {/* ── Global Nav ── */}
      <nav className="h-20 bg-white border-t border-slate-100 px-8 flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <div className="bg-red-700 p-2 rounded-xl">
                <Activity size={16} className="text-white" />
            </div>
            <span className="font-black text-lg text-slate-900 tracking-tighter">LifeSync</span>
          </div>

          <div className="flex items-center gap-1">
              {['Health', 'Map', 'Hospitals', 'Emergency'].map((item, i) => (
                  <button key={item} className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${i === 0 ? 'bg-red-50 text-red-700' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
                      {item}
                  </button>
              ))}
          </div>

          <div className="flex items-center gap-4">
              <div className="text-right">
                  <p className="text-xs font-black text-slate-900">{user?.name || 'User'}</p>
                  <p className="text-[10px] font-bold text-slate-400">Verified Member</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-red-700">
                  {user?.name?.[0] || 'U'}
              </div>
          </div>
      </nav>
    </div>
  );
}
