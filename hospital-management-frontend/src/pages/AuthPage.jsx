import { useState } from 'react';
import { Activity, User, Mail, Lock, Phone, MapPin, ArrowRight, AlertCircle, ShieldCheck, HelpCircle } from 'lucide-react';

// ── localStorage helpers ────────────────────────────────────────────────────
const USERS_KEY = 'hms_users';
const SESSION_KEY = 'hms_session';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}
function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function findUser(email, password) {
  return getUsers().find(u => u.email === email && u.password === password);
}
function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ── Input Field Component ────────────────────────────────────────────────────
function Field({ icon: Icon, label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 5 }}>
        {Icon && <Icon size={11} />} {label}
      </label>
      <input
        {...props}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 10,
          border: '1.5px solid #e8edf2',
          background: '#f8fafb',
          fontSize: '0.92rem',
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'all 0.2s',
          boxSizing: 'border-box',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = '#fff'; }}
        onBlur={e => { e.target.style.borderColor = '#e8edf2'; e.target.style.background = '#f8fafb'; }}
      />
    </div>
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

    if (mode === 'signup') {
      if (!form.hospitalName || !form.email || !form.password) {
        setError('Please fill all required fields.');
        setLoading(false); return;
      }
      if (form.password !== form.confirm) {
        setError('Passwords do not match.');
        setLoading(false); return;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false); return;
      }
      const existing = getUsers().find(u => u.email === form.email);
      if (existing) { setError('This email is already registered.'); setLoading(false); return; }

      const user = { hospitalName: form.hospitalName, email: form.email, phone: form.phone, location: form.location, password: form.password };
      saveUser(user);
      saveSession(user);
      onAuth(user);
    } else {
      if (!form.email || !form.password) {
        setError('Please enter your email and password.');
        setLoading(false); return;
      }
      try {
        const response = await fetch("http://127.0.0.1:5000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email: form.email, password: form.password })
        });
        
        if (!response.ok) {
          throw new Error("Invalid email or password.");
        }
        
        const data = await response.json();
        const user = data.user || { email: form.email, hospitalName: 'Hospital' };
        saveSession(user);
        onAuth(user);
      } catch (err) {
        console.error("Login Error:", err);
        setError("Failed to fetch. Cannot connect to the server.");
      }
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fb', fontFamily: 'var(--font-body, Inter, sans-serif)', display: 'flex', flexDirection: 'column' }}>
      {/* ── Navbar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(247,249,251,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #eaeef2', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'var(--primary, #b70011)', borderRadius: 10, padding: '6px 8px', display: 'flex' }}>
            <Activity size={20} color="#fff" />
          </div>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary, #b70011)', letterSpacing: '-0.03em', fontFamily: 'var(--font-heading, Manrope, sans-serif)' }}>LifeSync</span>
        </div>
        <HelpCircle size={20} style={{ color: '#64748b', cursor: 'pointer' }} />
      </nav>

      {/* ── Main ── */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 1100, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48, alignItems: 'center' }}>

          {/* Left: Branding */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ffd6d9', color: '#8b0010', borderRadius: 20, padding: '4px 14px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                {mode === 'signup' ? 'New Registration' : 'Hospital Portal'}
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading, Manrope, sans-serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, color: '#0f172a', margin: '0 0 16px' }}>
                Clinical <span style={{ color: 'var(--primary, #b70011)' }}>Excellence</span><br />Starts Here.
              </h1>
              <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.7, maxWidth: 420 }}>
                {mode === 'signup'
                  ? 'Register your medical facility to join the LifeSync network. Enterprise-grade security for clinical data.'
                  : 'Sign in to your hospital management portal to access real-time data, patient records, and operational analytics.'}
              </p>
            </div>

            {/* Progress Bar */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ height: 4, width: 80, borderRadius: 4, background: 'var(--primary, #b70011)' }} />
              <div style={{ height: 4, width: 80, borderRadius: 4, background: mode === 'signup' ? 'var(--primary, #b70011)' : '#e2e8f0', transition: 'all 0.3s' }} />
            </div>

            {/* Feature Image */}
            <div style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', aspectRatio: '4/3', maxWidth: 460, boxShadow: '0 20px 60px rgba(183,0,17,0.08)', display: 'none' }} className="auth-image-panel">
              <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200" alt="Hospital" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
              <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <ShieldCheck size={22} color="var(--primary, #b70011)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Trusted by 450+ medical centers globally</span>
              </div>
            </div>

            {/* Features list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Real-time patient tracking', 'Doctor & appointment management', 'Emergency ambulance dispatch'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a' }} />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 'clamp(24px, 5vw, 48px)', boxShadow: '0 4px 40px rgba(0,0,0,0.06)', border: '1px solid #f0f4f8' }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'var(--font-heading, Manrope, sans-serif)', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                {mode === 'signup' ? 'Register Your Hospital' : 'Access Hospital Portal'}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
                {mode === 'signup' ? 'Please provide your institution details below.' : 'Enter your credentials to continue.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {mode === 'signup' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Field icon={User} label="Hospital Name *" type="text" placeholder="e.g. Apollo Hospital" value={form.hospitalName} onChange={e => set('hospitalName', e.target.value)} required />
                    <Field icon={Phone} label="Contact Number" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                  <Field icon={MapPin} label="Hospital Location" type="text" placeholder="City, State" value={form.location} onChange={e => set('location', e.target.value)} />
                </>
              )}

              <Field icon={Mail} label="Official Email *" type="email" placeholder="admin@hospital.com" value={form.email} onChange={e => set('email', e.target.value)} required />

              <div style={{ display: 'grid', gridTemplateColumns: mode === 'signup' ? '1fr 1fr' : '1fr', gap: 14 }}>
                <Field icon={Lock} label={mode === 'signup' ? 'Create Password *' : 'Password *'} type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
                {mode === 'signup' && (
                  <Field icon={Lock} label="Confirm Password *" type="password" placeholder="••••••••" value={form.confirm} onChange={e => set('confirm', e.target.value)} required />
                )}
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, color: '#be123c', fontSize: '0.85rem', fontWeight: 500 }}>
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ marginTop: 4, width: '100%', padding: '15px', borderRadius: 14, background: loading ? '#f1f5f9' : 'linear-gradient(135deg, #dc2626, #b70011)', color: loading ? '#94a3b8' : '#fff', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', fontFamily: 'var(--font-heading, Manrope, sans-serif)', boxShadow: loading ? 'none' : '0 8px 20px rgba(183,0,17,0.25)' }}
              >
                {loading
                  ? <><div style={{ width: 18, height: 18, border: '2.5px solid #cbd5e1', borderTopColor: 'var(--primary, #b70011)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Processing...</>
                  : <>{mode === 'signup' ? 'Register Hospital' : 'Sign In'} <ArrowRight size={18} /></>
                }
              </button>

              <div style={{ textAlign: 'center', paddingTop: 4 }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  {mode === 'signup' ? 'Already registered? ' : 'New to LifeSync? '}
                </span>
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setForm({ hospitalName: '', email: '', phone: '', location: '', password: '', confirm: '' }); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary, #b70011)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  {mode === 'signup' ? 'Sign In' : 'Register your hospital'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ padding: '20px 24px', borderTop: '1px solid #f0f4f8', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 24px', opacity: 0.6 }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>LifeSync Clinical Systems</span>
        {['Privacy Policy', 'Terms of Service', 'Security', 'Support'].map(l => (
          <a key={l} href="#" style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'none' }}>{l}</a>
        ))}
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>© 2024 LifeSync. All rights reserved.</span>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 768px) { .auth-image-panel { display: block !important; } }
      `}</style>
    </div>
  );
}
