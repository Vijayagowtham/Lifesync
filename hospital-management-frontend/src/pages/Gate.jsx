import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  User, 
  AtSign, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Plus,
  Activity,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

export default function Gate({ onSelect, onAuth }) {
  const [activeRole, setActiveRole] = useState('hospital');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      
      const data = await response.json();
      onAuth({ 
          name: activeRole === 'hospital' ? 'Clinical Admin' : 'Member Patient', 
          email: data.user?.email || formData.email, 
          role: activeRole 
      });
    } catch (err) {
      console.error("Login Error:", err);
      alert("Failed to fetch. Cannot connect to the backend server.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-900 font-inter antialiased overflow-x-hidden">
      {/* ── Top Navigation ── */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl flex justify-between items-center px-8 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="text-red-700 w-6 h-6" strokeWidth={3} />
          <span className="text-2xl font-black text-red-700 tracking-tighter">LifeSync</span>
        </div>
        <HelpCircle className="w-5 h-5 text-slate-400 cursor-pointer hover:text-red-700 transition-colors" />
      </nav>

      {/* ── Main Content Area (Editorial Split Layout) ── */}
      <main className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Side: Editorial Branding */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 hidden lg:block space-y-12"
          >
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-[10px] font-black uppercase tracking-widest">
                Professional Network
              </div>
              <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-[1.05]">
                Clinical <br /> 
                <span className="text-red-700">Reliability.</span> <br />
                Universal Care.
              </h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-sm">
                Join the most trusted medical ecosystem. Manage clinics, track assets, and deliver care with precision.
              </p>
            </div>

            {/* Featured Image Group */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-red-100/50 rounded-[40px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl bg-white border border-slate-100 h-80">
                <img 
                  className="w-full h-full object-cover opacity-90 transition-transform duration-[2000ms] group-hover:scale-110" 
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000"
                  alt="Modern Healthcare"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-700 rounded-lg">
                      <ShieldCheck className="text-white w-4 h-4" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Enterprise Medical Encryption</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Clinical Portal Access Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-7 flex justify-center"
          >
            <div className="w-full max-w-[580px] bg-white rounded-[56px] p-12 md:p-16 shadow-[0_48px_120px_-32px_rgba(183,18,18,0.1)] border border-slate-100/50">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">
                  Clinical Portal Access
                </h2>
                <p className="text-slate-400 text-sm font-semibold tracking-wide">
                  Precision health management for the modern era.
                </p>
              </div>

              <div className="space-y-12">
                {/* Entry Point Selector */}
                <div className="space-y-5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                    Select Entry Point
                  </label>
                  <div className="flex gap-5">
                    <button
                      onClick={() => setActiveRole('hospital')}
                      className={`flex-1 flex items-center justify-center gap-3 py-6 rounded-3xl font-bold transition-all duration-300 border-2 ${
                        activeRole === 'hospital' 
                        ? 'bg-white border-red-700 text-red-700 shadow-2xl shadow-red-900/5' 
                        : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <Building2 size={22} strokeWidth={2.5} />
                      Hospital
                    </button>
                    <button
                      onClick={() => setActiveRole('patient')}
                      className={`flex-1 flex items-center justify-center gap-3 py-6 rounded-3xl font-bold transition-all duration-300 border-2 ${
                        activeRole === 'patient' 
                        ? 'bg-white border-red-700 text-red-700 shadow-2xl shadow-red-100/5' 
                        : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <User size={22} strokeWidth={2.5} />
                      Patient
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-600 ml-1">Email ID</label>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2">
                         <AtSign size={20} className="text-slate-300 group-focus-within:text-red-700 transition-colors" />
                      </div>
                      <input 
                        type="email"
                        required
                        placeholder="name@atelier.healthcare"
                        className="w-full bg-slate-50 border-transparent border-2 focus:bg-white focus:border-red-700/10 rounded-[24px] pl-16 pr-6 py-5 text-sm font-bold text-slate-900 outline-none transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-bold text-slate-600">Password</label>
                      <button type="button" className="text-[10px] font-black text-red-700 uppercase tracking-widest hover:underline">
                          Forgot Access?
                      </button>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2">
                         <Lock size={20} className="text-slate-300 group-focus-within:text-red-700 transition-colors" />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50 border-transparent border-2 focus:bg-white focus:border-red-700/10 rounded-[24px] pl-16 pr-16 py-5 text-sm font-bold text-slate-900 outline-none transition-all"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-700 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button 
                      type="submit"
                      style={{ backgroundColor: '#b70011' }}
                      className="w-full hover:bg-red-800 text-white font-black py-6 rounded-[28px] shadow-2xl shadow-red-900/20 active:scale-[0.98] transition-all text-sm uppercase tracking-[0.25em] flex items-center justify-center gap-3 transform group"
                    >
                      Enter Atelier 
                      <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                    </button>
                  </div>
                </form>

                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New to the network? </span>
                  <button className="text-[10px] font-black text-red-700 uppercase tracking-widest hover:underline">Sign Up</button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* ── Sticky Footer ── */}
      <footer className="fixed bottom-0 w-full py-6 flex justify-center border-t border-slate-50/50">
         <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] ml-1">
            © 2026 LifeSync Clinical Atelier • Encrypted
         </p>
      </footer>
    </div>
  );
}
