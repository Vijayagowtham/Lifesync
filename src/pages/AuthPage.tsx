import React, { useState } from "react";
import { 
  Activity, 
  User, 
  Phone as PhoneIcon, 
  Mail, 
  MapPin, 
  Lock, 
  ArrowRight, 
  AtSign, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Building2,
  Stethoscope,
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "../lib/supabase";

interface AuthPageProps {
  onLogin: (userData: any) => void;
  onOpenChat?: () => void;
}

type AuthRole = "user" | "hospital";
type AuthMode = "login" | "signup";

export default function AuthPage({ onLogin, onOpenChat }: AuthPageProps) {
  const [role, setRole] = useState<AuthRole>("user");
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    age: "",
    bloodGroup: "",
    phone: "",
    location: "",
    email: "",
    password: "",
    confirmPassword: "",
    hospitalName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSupportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenChat) onOpenChat();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        // 1. Sign up user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username || formData.name,
              hospitalName: formData.hospitalName,
              role: role,
            }
          }
        });

        if (authError) throw authError;
        
        // Manual profile creation removed: Handled by DB trigger for robustness.
        setIsSignupSuccess(true);
      } else {
        // 1. Sign in
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;

        // 2. Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          // Fallback if profile doesn't exist yet
          const fallback = {
            name: authData.user.email?.split('@')[0] || "User",
            email: authData.user.email,
            role: role,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authData.user.email}`
          };
          
          if (role === "hospital") {
            localStorage.setItem("hms_session", JSON.stringify(fallback));
            window.location.assign("/clinical-portal/");
          } else {
            onLogin(fallback);
          }
        } else {
          if (role === "hospital" || profileData.role === "hospital") {
            localStorage.setItem("hms_session", JSON.stringify(profileData));
            window.location.assign("/clinical-portal/");
          } else {
            onLogin(profileData);
          }
        }
      }
    } catch (err: any) {
      console.error("Auth Error (full):", err);
      // Only show 'network error' if it's truly a fetch failure with no response
      const isNetworkError =
        (err.message === "Failed to fetch" ||
          err.message?.includes("NetworkError") ||
          err.message?.includes("fetch")) &&
        err.name === "TypeError";

      if (isNetworkError) {
        setError(
          "Cannot connect to Supabase. Your project may be paused. Visit supabase.com/dashboard → your project → click 'Restore project', then try again."
        );
      } else {
        // Show the real error message (e.g. "Email not confirmed", "Invalid login credentials")
        setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isSignupSuccess) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-6 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-white rounded-[56px] p-12 md:p-16 shadow-[0_60px_100px_-40px_rgba(183,0,17,0.1)] border border-slate-100/50 text-center space-y-8"
        >
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <Mail className="text-green-500 w-10 h-10" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Sign-up successful</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              A confirmation email has been sent to <span className="text-primary font-bold">{formData.email}</span>. 
              Please verify your account to unlock all features of the LifeSync network.
            </p>
          </div>
          <Button 
            onClick={() => {
              setIsSignupSuccess(false);
              setMode("login");
            }}
            className="w-full h-16 bg-primary hover:bg-red-800 text-white font-black rounded-[28px] text-sm uppercase tracking-[0.2em]"
          >
            Back to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-900 font-inter antialiased overflow-x-hidden selection:bg-red-100 selection:text-red-700">
      {/* ── Top Navigation ── */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl flex justify-between items-center px-10 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="text-primary w-7 h-7" strokeWidth={3} />
          <span className="text-3xl font-black text-primary tracking-tighter font-headline">LifeSync</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
             <a href="#" className="hover:text-primary transition-colors">Network</a>
             <a href="#" className="hover:text-primary transition-colors">Security</a>
             <button onClick={handleSupportClick} className="hover:text-primary transition-colors uppercase">Support</button>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary transition-colors rounded-full" onClick={handleSupportClick}>
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </nav>

      {/* ── Main Content Area ── */}
      <main className="min-h-screen pt-32 pb-16 px-6 lg:px-12 flex items-center justify-center">
        <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
          
          {/* Left Side: Branding & Editorial */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-12 lg:col-span-5 space-y-12"
          >
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="bg-red-50 text-primary border-primary/20 hover:bg-red-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {role === "user" ? "Patient Portal" : "Clinical Administration"}
                </Badge>
              </motion.div>
              
              <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1] font-headline">
                {role === "user" ? (
                  <>Your Health, <br /> <span className="text-primary">Synchronized.</span></>
                ) : (
                  <>Clinical <br /> <span className="text-primary">Excellence.</span></>
                )}
              </h1>
              
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-md">
                {role === "user" 
                  ? "Access the world's most advanced healthcare network. Personalized care, optimized by intelligence."
                  : "Empowering medical institutions with enterprise-grade clinical management tools and data encryption."}
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-4 pt-4">
              <div className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="p-3 bg-red-50 rounded-2xl">
                  <ShieldCheck className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Military-Grade Security</h3>
                  <p className="text-xs text-slate-400 font-medium">256-bit AES Clinical Encryption Protocol</p>
                </div>
              </div>
            </div>

            {/* Featured Visual */}
            <div className="hidden lg:block relative aspect-[16/10] rounded-[40px] overflow-hidden shadow-2xl bg-white border border-slate-100 group">
              <img 
                className="w-full h-full object-cover opacity-90 transition-transform duration-[3000ms] group-hover:scale-110" 
                src={role === "user" 
                  ? "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=2000" 
                  : "https://images.unsplash.com/photo-1551076805-e1869043e560?auto=format&fit=crop&q=80&w=2000"}
                alt="Healthcare Innovation"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary w-5 h-5" />
                  <p className="text-sm font-black text-slate-900 uppercase tracking-widest">
                    {role === "user" ? "Verified Care Network" : "ISO 27001 Certified"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Auth Form */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-12 lg:col-span-7 flex justify-center"
          >
            <div className="w-full max-w-[620px] bg-white rounded-[56px] p-10 md:p-14 shadow-[0_60px_100px_-40px_rgba(183,0,17,0.1)] border border-slate-100/50 relative overflow-hidden">
              
              {/* Form Heading */}
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">
                  {role === "user" 
                    ? (mode === "signup" ? "Create Account" : "Access Portal")
                    : (mode === "signup" ? "Hospital Registration" : "Management Portal")}
                </h2>
                <p className="text-slate-400 text-xs font-bold tracking-wide">
                  {role === "user" 
                    ? "Care optimized for the digital era." 
                    : "Precision health management tools."}
                </p>
              </div>

              {/* Role Selector */}
              <div className="grid grid-cols-2 gap-4 mb-8 p-2 bg-slate-50 rounded-[30px]">
                <button
                  onClick={() => { setRole("user"); setIsSignupSuccess(false); }}
                  className={`flex items-center justify-center gap-3 py-4 rounded-[26px] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                    role === "user" 
                    ? "bg-white text-primary shadow-xl shadow-red-900/5" 
                    : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <User size={16} />
                  User
                </button>
                <button
                  onClick={() => { setRole("hospital"); setIsSignupSuccess(false); }}
                  className={`flex items-center justify-center gap-3 py-4 rounded-[26px] font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                    role === "hospital" 
                    ? "bg-white text-primary shadow-xl shadow-red-900/5" 
                    : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Building2 size={16} />
                  Hospital
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={`${role}-${mode}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-5"
                  >
                    {role === "user" && (
                      <>
                        {mode === "signup" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                              <Input name="username" value={formData.username} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-12 outline-none" placeholder="alex_johnson" required />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                              <Input name="age" type="number" value={formData.age} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-12 outline-none" placeholder="25" required />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                              <select 
                                name="bloodGroup" 
                                value={formData.bloodGroup} 
                                onChange={handleChange}
                                className="w-full bg-slate-50 border-transparent rounded-[20px] h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                                required
                              >
                                <option value="">Select</option>
                                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                              <Input name="phone" value={formData.phone} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-12 outline-none" placeholder="+1 (555) 000-0000" required />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Location</label>
                              <Input name="location" value={formData.location} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-12 outline-none" placeholder="San Francisco, CA" required />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email ID</label>
                              <Input name="email" type="email" value={formData.email} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-12 outline-none" placeholder="alex@example.com" required />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                              <Input name="password" type="password" value={formData.password} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-12 outline-none" placeholder="••••••••" required />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                              <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-12 outline-none" placeholder="••••••••" required />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email ID</label>
                              <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 transition-colors group-focus-within:text-primary" />
                                <Input name="email" type="email" value={formData.email} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-14 pl-14 outline-none" placeholder="alex@lifesync.health" required />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center px-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <button type="button" className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Forgot?</button>
                              </div>
                              <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 transition-colors group-focus-within:text-primary" />
                                <Input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-14 pl-14 pr-14" placeholder="••••••••" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors">
                                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {role === "hospital" && (
                      <>
                        {mode === "signup" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Hospital Name</label>
                              <Input name="hospitalName" value={formData.hospitalName} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-12 outline-none" placeholder="City Medical Center" required />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                              <Input name="phone" value={formData.phone} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-12 outline-none" placeholder="+1 (555) 000-0000" required />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                              <Input name="location" value={formData.location} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-12 outline-none" placeholder="Address, City" required />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email ID</label>
                              <Input name="email" type="email" value={formData.email} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-12 outline-none" placeholder="admin@hospital.com" required />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                              <Input name="password" type="password" value={formData.password} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-12 outline-none" placeholder="••••••••" required />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                              <Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-12 outline-none" placeholder="••••••••" required />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Hospital Email</label>
                              <Input name="email" type="email" value={formData.email} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-14 pl-6 outline-none" placeholder="admin@hospital.com" required />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                              <Input name="password" type="password" value={formData.password} onChange={handleChange} className="bg-slate-50 border-transparent rounded-[20px] h-14 pl-6" placeholder="••••••••" required />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </motion.div>
                )}

                <div className="pt-4 space-y-6 relative z-10">
                  <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-red-800 text-white font-black py-5 rounded-[26px] shadow-xl shadow-red-900/10 active:scale-[0.98] transition-all text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 disabled:opacity-50 relative z-20">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (mode === "signup" ? "Complete Registration" : "Enter Portal")}
                  </button>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    <button type="button" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(null); }} className="text-primary hover:underline">
                      {mode === "signup" ? "Already Registered?" : "Join the Network"}
                    </button>
                    <button type="button" onClick={handleSupportClick} className="hover:text-primary transition-colors flex items-center gap-2">
                       Support Center <Activity size={12} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </main>

      {/* ── Editorial Footer ── */}
      <footer className="w-full py-12 px-12 flex flex-col md:flex-row justify-between items-center bg-transparent opacity-40">
        <div className="flex items-center gap-2 mb-6 md:mb-0">
          <Activity className="text-slate-900 w-5 h-5" />
          <span className="text-sm font-black text-slate-900 tracking-tighter uppercase tracking-[0.2em]">LifeSync Clinical Atelier</span>
        </div>
        <div className="flex gap-10 text-[10px] font-black text-slate-900 uppercase tracking-widest">
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <button onClick={handleSupportClick} className="hover:text-primary transition-colors uppercase tracking-widest">Support</button>
        </div>
        <div className="mt-6 md:mt-0 text-[10px] font-black text-slate-900 uppercase tracking-widest">© 2026 LifeSync. All rights reserved.</div>
      </footer>
    </div>
  );
}
