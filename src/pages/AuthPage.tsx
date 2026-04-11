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
  Stethoscope
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface AuthPageProps {
  onLogin: (userData: any) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    pinCode: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Instant validation and login
    if (mode === "login") {
      if (formData.email && formData.password) {
        const userData = {
          name: formData.name || "Alex Johnson",
          email: formData.email,
          avatarUrl: `https://picsum.photos/seed/${formData.email}/100/100`,
        };
        onLogin(userData);
      } else {
        setError("Please enter both email and password.");
        setLoading(false);
      }
    } else {
      if (formData.name && formData.email && formData.password) {
        const userData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          avatarUrl: `https://picsum.photos/seed/${formData.email}/100/100`,
        };
        onLogin(userData);
      } else {
        setError("Please fill in all required fields.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-900 font-inter antialiased">
      {/* ── Top Navigation ── */}
      <nav className="fixed top-0 w-full z-50 bg-slate-50/70 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="text-primary w-6 h-6" />
          <span className="text-2xl font-extrabold text-primary tracking-tighter font-headline">LifeSync</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-600 hover:text-primary transition-colors">
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </nav>

      {/* ── Main Content Area ── */}
      <main className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Editorial Branding */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-12 lg:col-span-5 space-y-8"
          >
            <div className="space-y-6">
              <Badge className="bg-red-50 text-primary border-primary/20 hover:bg-red-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {mode === "signup" ? "New Account" : "Welcome Back"}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-[1.1] font-headline">
                Your Health Journey <br />
                <span className="text-primary">Starts Here.</span>
              </h1>
              <p className="text-lg text-slate-500 font-body leading-relaxed max-w-md">
                {mode === "signup" 
                  ? "Join the LifeSync network to access personalized medical insights and find the best care around you."
                  : "Sign in to access your health dashboard, hospital status, and AI insights."}
              </p>
            </div>

            {/* Progress/Feature Indicator */}
            <div className="flex items-center gap-4">
              <div className="h-1 w-24 bg-primary rounded-full"></div>
              <div className={`h-1 w-24 ${mode === "signup" ? "bg-primary" : "bg-slate-200"} rounded-full transition-colors`}></div>
            </div>

            {/* Featured Image Card */}
            <div className="hidden lg:block relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-white group">
              <img 
                className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000"
                alt="Modern Hospital Lobby"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10"></div>
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-white/40">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShieldCheck className="text-primary w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Enterprise-Grade Security</p>
                </div>
                <p className="text-xs text-slate-600">Your clinical data is encrypted with LifeSync's 256-bit proprietary security protocol.</p>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Registration/Login Form */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-12 lg:col-span-7 bg-white rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(183,0,17,0.05)] border border-slate-100"
          >
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-2xl font-bold text-slate-900 mb-2 font-headline">
                {mode === "signup" ? "Create Your Account" : "Access Your Dashboard"}
              </h2>
              <p className="text-slate-400 text-sm">
                {mode === "signup" 
                  ? "Please provide your details below to get started." 
                  : "Enter your credentials to continue the journey."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {mode === "signup" ? (
                  <motion.div 
                    key="signup-fields"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-label ml-1 flex items-center gap-1.5">
                        <User className="w-3 h-3" /> Full Name
                      </label>
                      <Input 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-slate-50 border-transparent focus:bg-white focus:border-primary rounded-xl h-12" 
                        placeholder="e.g. Alex Johnson"
                        required
                      />
                    </div>
                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-label ml-1 flex items-center gap-1.5">
                        <PhoneIcon className="w-3 h-3" /> Phone Number
                      </label>
                      <Input 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="bg-slate-50 border-transparent focus:bg-white focus:border-primary rounded-xl h-12" 
                        placeholder="+1 (555) 000-0000"
                        type="tel"
                      />
                    </div>
                    {/* Email */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-label ml-1 flex items-center gap-1.5">
                        <AtSign className="w-3 h-3" /> Email Address
                      </label>
                      <Input 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-slate-50 border-transparent focus:bg-white focus:border-primary rounded-xl h-12" 
                        placeholder="alex.johnson@example.com"
                        type="email"
                        required
                      />
                    </div>
                    {/* Location */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-label ml-1 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" /> Your Location
                      </label>
                      <Input 
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="bg-slate-50 border-transparent focus:bg-white focus:border-primary rounded-xl h-12" 
                        placeholder="City, Country"
                      />
                    </div>
                    {/* Password */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-label ml-1 flex items-center gap-1.5">
                        <Lock className="w-3 h-3" /> Create Password
                      </label>
                      <Input 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="bg-slate-50 border-transparent focus:bg-white focus:border-primary rounded-xl h-12" 
                        placeholder="••••••••"
                        type="password"
                        required
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="login-fields"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-label ml-1 flex items-center gap-1.5">
                        <AtSign className="w-3 h-3" /> Email Address
                      </label>
                      <Input 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-slate-50 border-transparent focus:bg-white focus:border-primary rounded-xl h-12" 
                        placeholder="alex.johnson@example.com"
                        type="email"
                        required
                      />
                    </div>
                    {/* Password */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-label flex items-center gap-1.5">
                          <Lock className="w-3 h-3" /> Password
                        </label>
                        <a href="#" className="text-xs text-primary font-bold hover:underline">Forgot?</a>
                      </div>
                      <Input 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="bg-slate-50 border-transparent focus:bg-white focus:border-primary rounded-xl h-12" 
                        placeholder="••••••••"
                        type="password"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-primary/10 rounded-xl flex items-start gap-2 text-primary text-xs font-medium"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  {error}
                </motion.div>
              )}

              {/* Action Section */}
              <div className="pt-6 space-y-6">
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-xl shadow-primary/10 active:scale-[0.98] transition-all font-headline text-lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {mode === "signup" ? "Register Account" : "Sign In"}
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                      className="text-primary font-bold hover:underline"
                    >
                      {mode === "signup" ? "Already have an account?" : "Need a LifeSync account?"}
                    </button>
                  </div>
                  <a href="#" className="hover:text-primary transition-colors">Experience Support</a>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full py-8 bg-transparent flex flex-col md:flex-row justify-center items-center gap-6 opacity-60 text-xs text-slate-500">
        <div className="font-bold text-slate-900 font-headline">LifeSync Clinical Atelier</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Security</a>
        </div>
        <div>© 2024 LifeSync. All rights reserved.</div>
      </footer>
    </div>
  );
}
