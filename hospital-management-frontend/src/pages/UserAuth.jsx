/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { 
  Activity, 
  User, 
  Phone as PhoneIcon, 
  Mail, 
  MapPin, 
  Lock, 
  ArrowRight, 
  AtSign, 
  ShieldCheck,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { supabase } from "../supabase";

export default function UserAuth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    pinCode: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              role: 'user'
            }
          }
        });

        if (signUpError) throw signUpError;
        if (!data.user) throw new Error("Registration failed.");

        const profile = {
          id: data.user.id,
          name: formData.name,
          email: formData.email,
          role: 'user',
          phone: formData.phone,
          location: formData.location
        };
        
        await supabase.from('profiles').upsert(profile);
        onAuth(profile);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        
        if (signInError) throw signInError;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        onAuth(profile || { email: data.user.email, role: 'user', name: 'Member User' });
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-900 font-inter antialiased">
      {/* ── Top Navigation ── */}
      <nav className="fixed top-0 w-full z-50 bg-slate-50/70 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="text-red-700 w-6 h-6" />
          <span className="text-2xl font-extrabold text-red-700 tracking-tighter sm:text-3xl">LifeSync</span>
        </div>
        <HelpCircle className="w-5 h-5 text-slate-400 cursor-pointer hover:text-red-700 transition-colors" />
      </nav>

      {/* ── Main Content Area ── */}
      <main className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Editorial Branding */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-5 hidden md:block space-y-12"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-[10px] font-black uppercase tracking-widest">
                {mode === "signup" ? "Step 2 of 2" : "Member Access"}
              </div>
              <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Clinical <span className="text-red-700">Excellence</span> <br />
                Starts Here.
              </h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                Access your personalized health dashboard, track diagnostics, and find the best care networks around you.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-1 w-24 bg-red-700 rounded-full"></div>
              <div className="h-1 w-24 bg-red-700 rounded-full"></div>
            </div>

            {/* Featured Image Card */}
            <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl bg-white border border-slate-100 group">
              <img 
                className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000"
                alt="Modern Healthcare"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-white/40">
                <ShieldCheck className="text-red-700 w-5 h-5 mb-2" />
                <p className="text-sm font-bold text-slate-900 leading-tight">Trusted by 450+ medical centers globally</p>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Form */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-7 bg-white rounded-[40px] p-8 md:p-14 shadow-[0_20px_50px_rgba(183,0,17,0.05)] border border-slate-100"
          >
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                {mode === "signup" ? "Member Registration" : "Account Access"}
              </h2>
              <p className="text-slate-400 text-sm font-medium">
                Please provide your official details to proceed.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mode === "signup" && (
                  <>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                       <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-red-700/30 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold transition-all outline-none" 
                            placeholder="e.g. John Doe"
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                       <div className="relative">
                          <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-red-700/30 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold transition-all outline-none" 
                            placeholder="+1 (555) 000-0000"
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                       </div>
                    </div>
                  </>
                )}

                <div className={mode === 'signup' ? 'md:col-span-2 space-y-2' : 'space-y-2 w-full'}>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                   <div className="relative">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email"
                        className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-red-700/30 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold transition-all outline-none" 
                        placeholder="administration@hospital.com"
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                   </div>
                </div>

                {mode === "signup" && (
                  <div className="md:col-span-2 space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Location</label>
                     <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-red-700/30 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold transition-all outline-none" 
                          placeholder="Full street address, City"
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                     </div>
                  </div>
                )}

                <div className={mode === 'signup' ? 'space-y-2' : 'space-y-2'}>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pin Code</label>
                   <input 
                     className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-red-700/30 rounded-2xl px-6 py-4 text-sm font-bold transition-all outline-none" 
                     placeholder="123456"
                     onChange={(e) => setFormData({...formData, pinCode: e.target.value})}
                   />
                </div>

                <div className={mode === 'signup' ? 'space-y-2' : 'space-y-2'}>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                   <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="password"
                        className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-red-700/30 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold transition-all outline-none" 
                        placeholder="••••••••"
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                      />
                   </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-[11px] font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <div className="pt-6 space-y-6">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-700 hover:bg-red-600 text-white font-black py-5 rounded-[20px] shadow-xl shadow-red-900/10 active:scale-[0.98] transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? "Processing..." : (
                    <>
                      {mode === "signup" ? "Register Member" : "Sign In Account"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                   <button 
                     type="button"
                     onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                     className="text-[11px] font-black text-red-700 uppercase tracking-widest hover:underline"
                   >
                     {mode === 'login' ? "Need a LifeSync account?" : "Already have an account?"}
                   </button>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     Need help? Contact Support
                   </p>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
