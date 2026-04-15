import { useState } from 'react';
import { Activity, User, Mail, Lock, Phone, MapPin, ArrowRight, AlertCircle, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';

// ── localStorage helpers ────────────────────────────────────────────────────
const SESSION_KEY = 'hms_session';

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  supabase.auth.signOut();
}

// ── Input Field Component ────────────────────────────────────────────────────
function Field({ icon: Icon, label, ...props }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="field-container"
      style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
    >
      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 5 }}>
        {Icon && <Icon size={11} />} {label}
      </label>
      <input
        {...props}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 12,
          border: '1.5px solid #e8edf2',
          background: 'rgba(248, 250, 251, 0.5)',
          backdropFilter: 'blur(4px)',
          fontSize: '0.92rem',
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'all 0.2s',
          boxSizing: 'border-box',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(183, 0, 17, 0.05)'; }}
        onBlur={e => { e.target.style.borderColor = '#e8edf2'; e.target.style.background = 'rgba(248, 250, 251, 0.5)'; e.target.style.boxShadow = 'none'; }}
      />
    </motion.div>
  );
}

// ── Auth Page Component ──────────────────────────────────────────────────────
export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ hospitalName: '', email: '', phone: '', location: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        if (!form.hospitalName || !form.email || !form.password) {
          throw new Error('Please fill all required fields.');
        }
        if (form.password !== form.confirm) {
          throw new Error('Passwords do not match.');
        }
        if (form.password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              hospital_name: form.hospitalName,
              role: 'hospital'
            }
          }
        });

        if (signUpError) throw signUpError;
        if (!data.user) throw new Error("Registration failed.");

        const profile = {
          id: data.user.id,
          name: form.hospitalName,
          email: form.email,
          role: 'hospital'
        };
        
        await supabase.from('profiles').upsert(profile);
        saveSession(profile);
        onAuth(profile);
      } else {
        if (!form.email || !form.password) {
          throw new Error('Please enter your email and password.');
        }

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        });
        
        if (signInError) throw signInError;
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          const fallback = { email: data.user.email, role: 'hospital', name: 'Hospital Admin' };
          saveSession(fallback);
          onAuth(fallback);
        } else {
          saveSession(profile);
          onAuth(profile);
        }
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top right, #fff5f5, #f7f9fb)', fontFamily: 'var(--font-body, Inter, sans-serif)', display: 'flex', flexDirection: 'column' }}>
      {/* ── Navbar ── */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(234, 238, 242, 0.5)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'var(--primary, #b70011)', borderRadius: 12, padding: '6px 8px', display: 'flex', boxShadow: '0 4px 12px rgba(183, 0, 17, 0.2)' }}>
            <Activity size={20} color="#fff" />
          </div>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary, #b70011)', letterSpacing: '-0.03em', fontFamily: 'var(--font-heading, Manrope, sans-serif)' }}>LifeSync</span>
        </div>
        <HelpCircle size={20} style={{ color: '#64748b', cursor: 'pointer' }} />
      </motion.nav>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 1100, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48, alignItems: 'center' }}>

          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
          >
            <div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ffd6d9', color: '#8b0010', borderRadius: 20, padding: '4px 14px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}
              >
                {mode === 'signup' ? 'New Registration' : 'Hospital Portal'}
              </motion.div>
              <h1 style={{ fontFamily: 'var(--font-heading, Manrope, sans-serif)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1, color: '#0f172a', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
                Clinical <span style={{ color: 'var(--primary, #b70011)' }}>Excellence</span><br />Starts Here.
              </h1>
              <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: 450 }}>
                {mode === 'signup'
                  ? 'Register your medical facility to join the LifeSync network. Enterprise-grade security for clinical data.'
                  : 'Sign in to your hospital management portal to access real-time data, patient records, and operational analytics.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ height: 4, width: 80, borderRadius: 4, background: 'var(--primary, #b70011)' }} />
              <div style={{ height: 4, width: 80, borderRadius: 4, background: mode === 'signup' ? 'var(--primary, #b70011)' : '#e2e8f0', transition: 'all 0.3s' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['Real-time patient tracking', 'Doctor & appointment management', 'Emergency ambulance dispatch'].map((f, i) => (
                <motion.div 
                  key={f} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#475569', fontSize: '0.95rem', fontWeight: 500 }}
                >
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 4px rgba(22, 163, 74, 0.1)' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a' }} />
                  </div>
                  {f}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ 
              background: 'rgba(255, 255, 255, 0.8)', 
              borderRadius: 32, 
              padding: 'clamp(24px, 5vw, 48px)', 
              boxShadow: '0 25px 50px -12px rgba(183, 0, 17, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.4) inset', 
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(240, 244, 248, 0.8)' 
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div 
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontFamily: 'var(--font-heading, Manrope, sans-serif)', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                    {mode === 'signup' ? 'Register Your Hospital' : 'Access Hospital Portal'}
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, fontWeight: 500 }}>
                    {mode === 'signup' ? 'Please provide your institution details below.' : 'Enter your credentials to continue.'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {mode === 'signup' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Field icon={User} label="Hospital Name *" type="text" placeholder="Apollo Hospital" value={form.hospitalName} onChange={e => set('hospitalName', e.target.value)} required />
                        <Field icon={Phone} label="Contact Number" type="tel" placeholder="+91 98765" value={form.phone} onChange={e => set('phone', e.target.value)} />
                      </div>
                      <Field icon={MapPin} label="Hospital Location" type="text" placeholder="City, State" value={form.location} onChange={e => set('location', e.target.value)} />
                    </>
                  )}

                  <Field icon={Mail} label="Official Email *" type="email" placeholder="admin@hospital.com" value={form.email} onChange={e => set('email', e.target.value)} required />

                  <div style={{ display: 'grid', gridTemplateColumns: mode === 'signup' ? '1fr 1fr' : '1fr', gap: 16 }}>
                    <Field icon={Lock} label={mode === 'signup' ? 'Create Password *' : 'Password *'} type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
                    {mode === 'signup' && (
                      <Field icon={Lock} label="Confirm Password *" type="password" placeholder="••••••••" value={form.confirm} onChange={e => set('confirm', e.target.value)} required />
                    )}
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, color: '#be123c', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      <AlertCircle size={15} /> {error}
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    style={{ 
                      marginTop: 8, 
                      width: '100%', 
                      padding: '16px', 
                      borderRadius: 16, 
                      background: loading ? '#f1f5f9' : 'linear-gradient(135deg, #dc2626, #b70011)', 
                      color: loading ? '#94a3b8' : '#fff', 
                      border: 'none', 
                      fontSize: '1.05rem', 
                      fontWeight: 800, 
                      cursor: loading ? 'not-allowed' : 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: 10, 
                      transition: 'all 0.3s', 
                      fontFamily: 'var(--font-heading, Manrope, sans-serif)', 
                      boxShadow: loading ? 'none' : '0 10px 25px rgba(183, 0, 17, 0.3)' 
                    }}
                  >
                    {loading
                      ? <><div style={{ width: 18, height: 18, border: '2.5px solid #cbd5e1', borderTopColor: 'var(--primary, #b70011)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Processing...</>
                      : <>{mode === 'signup' ? 'Register Hospital' : 'Sign In Account'} <ArrowRight size={20} /></>
                    }
                  </motion.button>

                  <div style={{ textAlign: 'center', paddingTop: 8 }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>
                      {mode === 'signup' ? 'Already registered? ' : 'New to LifeSync? '}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setForm({ hospitalName: '', email: '', phone: '', location: '', password: '', confirm: '' }); }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary, #b70011)', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer', padding: 0, textDecoration: 'underline', textUnderlineOffset: '4px' }}
                    >
                      {mode === 'signup' ? 'Sign In' : 'Register your hospital'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      <footer style={{ padding: '24px', borderTop: '1px solid rgba(240, 244, 248, 0.5)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 32px', opacity: 0.7 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>LifeSync Clinical Systems</span>
        {['Privacy Policy', 'Terms of Service', 'Security', 'Support'].map(l => (
          <a key={l} href="#" style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>{l}</a>
        ))}
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>© 2024 LifeSync. All rights reserved.</span>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
