import React, { useState } from 'react';
import { supabase } from '../supabase';

export function getSession() {
  try { return JSON.parse(localStorage.getItem('hms_session')); } catch { return null; }
}

export function clearSession() {
  localStorage.removeItem('hms_session');
  supabase.auth.signOut();
}

export default function LoginUI({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('user'); // 'user' | 'hospital'
  const [showPassword, setShowPassword] = useState(false);
  
  const [form, setForm] = useState({
    hospitalName: '',
    phone: '',
    email: '',
    location: '',
    pinCode: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        if (!form.email || !form.password || (role === 'hospital' && !form.hospitalName)) {
          throw new Error('Please fill out all required fields.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              name: role === 'hospital' ? form.hospitalName : form.hospitalName || 'New User',
              role: role,
              location: form.location,
              contact_number: form.phone,
            }
          }
        });

        if (signUpError) throw signUpError;
        if (!data.user) throw new Error("Registration failed.");

        const profile = {
          id: data.user.id,
          name: role === 'hospital' ? form.hospitalName : form.hospitalName || 'New User',
          email: form.email,
          role: role
        };

        await supabase.from('profiles').upsert(profile);
        
        localStorage.setItem('hms_session', JSON.stringify(profile));
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

        let finalProfile;
        if (profileError) {
          const userMetaRole = data.user.user_metadata?.role || role;
          finalProfile = { email: data.user.email, role: userMetaRole, name: data.user.user_metadata?.name || 'User' };
        } else {
          finalProfile = profile;
        }

        localStorage.setItem('hms_session', JSON.stringify(finalProfile));
        onAuth(finalProfile);
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#e0e3e5] border-none rounded-lg px-4 py-3 focus:outline-none focus:bg-white transition-all text-[#191c1e] placeholder-[#916f6b]/60 text-sm";

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f7f9fb', minHeight: '100vh', color: '#191c1e' }}>
      
      {/* ── TopNavBar ── */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        backgroundColor: 'rgba(247,249,251,0.7)', backdropFilter: 'blur(20px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <polyline points="1,10 5,10 6,5 8,15 10,8 12,12 13,10 19,10" stroke="#b70011" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#b70011', letterSpacing: '-0.05em' }}>LifeSync</span>
        </div>
        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['NETWORK', 'SECURITY', 'SUPPORT'].map(link => (
              <a key={link} href="#" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', color: '#94a3b8', textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}
                onMouseOver={e => e.target.style.color = '#b70011'} onMouseOut={e => e.target.style.color = '#94a3b8'}>
                {link}
              </a>
            ))}
          </div>
          <span className="material-symbols-outlined" style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '20px' }}>help_outline</span>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main style={{ minHeight: '100vh', paddingTop: '96px', paddingBottom: '48px', paddingLeft: '24px', paddingRight: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '1100px', width: '100%', display: 'grid', gridTemplateColumns: '5fr 7fr', gap: '48px', alignItems: 'start' }}>
          
          {/* ── LEFT SIDE ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Headline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: '3.5rem', color: '#191c1e', lineHeight: 1.05, letterSpacing: '-0.03em', margin: 0 }}>
                Your Health,<br/>
                <span style={{ color: '#b70011' }}>Synchronized.</span>
              </h1>
              <p style={{ fontSize: '1rem', color: '#5c403c', lineHeight: 1.7, maxWidth: '360px', opacity: 0.8, margin: 0 }}>
                Access the world's most advanced healthcare network. Personalized care, optimized by intelligence.
              </p>
            </div>

            {/* Military-Grade Security Badge */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', maxWidth: '380px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fff1f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ color: '#b70011', fontSize: '22px' }}>shield</span>
              </div>
              <div>
                <h4 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: '0.875rem', color: '#191c1e', margin: 0 }}>Military-Grade Security</h4>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0, marginTop: '2px' }}>256-bit AES Clinical Encryption Protocol</p>
              </div>
            </div>

            {/* Healthcare Innovation Card (Image) */}
            <div style={{ borderRadius: '16px', overflow: 'hidden', position: 'relative', aspectRatio: '4/3', background: '#e2e8f0', maxWidth: '380px' }}>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBllBFao7KYmbYjhC2_bSuSxN0Ber6yPx1M-TA6oX0tOY8mOW4MrFtPwxTHmLb38uCEBh4K4j_RkxtR0QxDFP5XomaYDo6WB2PUNZK-X7GGwJqrojPcIvgIH-PQO6rDg9iisJZINFb6lPTZEw6XjZkuJB1prGeVjJA_pGz8H6eHow6u1irOrpPnI9XT-E30S2obhLpS68TIjOCB13kNMDFw4p_L2JUalZO9lCxON4S_hxHSjq5Bs-uUPr_cXHsx_gcN2LmCAGM1VCs"
                alt="Healthcare Innovation"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9, mixBlendMode: 'multiply' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(183,0,17,0.15), transparent)' }} />
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', background: 'rgba(247,249,251,0.85)', backdropFilter: 'blur(12px)', borderRadius: '12px', padding: '16px' }}>
                <span className="material-symbols-outlined" style={{ color: '#b70011', fontSize: '20px', display: 'block', marginBottom: '4px' }}>verified_user</span>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#191c1e', margin: 0 }}>Trusted by over 450+ medical centers globally</p>
              </div>
              {/* Bottom label */}
              <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.9)', borderRadius: '8px', padding: '6px 12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#191c1e', letterSpacing: '0.05em' }}>Healthcare Innovation</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDE: Access Portal ── */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '48px', boxShadow: '0 12px 32px rgba(167,56,49,0.06)', border: '1px solid #eceef0' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* Header */}
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: '2rem', color: '#191c1e', margin: 0, marginBottom: '6px' }}>Access Portal</h2>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#5c403c', opacity: 0.5, letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>
                  Care optimized for the digital era.
                </p>
              </div>

              {/* USER / HOSPITAL Tabs */}
              <div style={{ display: 'flex', background: '#f2f4f6', borderRadius: '14px', padding: '4px', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: role === 'user' ? '#fff' : 'transparent',
                    boxShadow: role === 'user' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    color: role === 'user' ? '#b70011' : '#94a3b8',
                    fontWeight: 800, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase',
                    fontFamily: "'Inter', sans-serif",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                  USER
                </button>
                <button
                  type="button"
                  onClick={() => setRole('hospital')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: role === 'hospital' ? '#fff' : 'transparent',
                    boxShadow: role === 'hospital' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    color: role === 'hospital' ? '#b70011' : '#94a3b8',
                    fontWeight: 800, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase',
                    fontFamily: "'Inter', sans-serif",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>domain</span>
                  HOSPITAL
                </button>
              </div>

              {/* SIGNUP-specific fields */}
              {mode === 'signup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 700, color: '#5c403c', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
                      {role === 'hospital' ? 'Hospital Name' : 'Full Name'}
                    </label>
                    <input name="hospitalName" value={form.hospitalName} onChange={handleInputChange} required
                      type="text" placeholder={role === 'hospital' ? "e.g. St. Mary's General" : "e.g. John Doe"}
                      className={inputClass} style={{ background: '#eceef0', borderRadius: '10px', padding: '12px 16px', width: '100%', border: 'none', outline: 'none', fontSize: '14px', color: '#191c1e' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 700, color: '#5c403c', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Contact Number</label>
                    <input name="phone" value={form.phone} onChange={handleInputChange}
                      type="tel" placeholder="+91 98765 43210"
                      style={{ background: '#eceef0', borderRadius: '10px', padding: '12px 16px', width: '100%', border: 'none', outline: 'none', fontSize: '14px', color: '#191c1e', boxSizing: 'border-box' }} />
                  </div>
                  {role === 'hospital' && (
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: '#5c403c', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Location</label>
                      <input name="location" value={form.location} onChange={handleInputChange}
                        type="text" placeholder="Full street address, City"
                        style={{ background: '#eceef0', borderRadius: '10px', padding: '12px 16px', width: '100%', border: 'none', outline: 'none', fontSize: '14px', color: '#191c1e', boxSizing: 'border-box' }} />
                    </div>
                  )}
                </div>
              )}

              {/* EMAIL ID */}
              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, color: '#5c403c', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>Email ID</label>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#94a3b8', pointerEvents: 'none' }}>mail</span>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    type="email"
                    placeholder="alex@lifesync.health"
                    style={{ background: '#eceef0', borderRadius: '10px', padding: '12px 16px 12px 42px', width: '100%', border: 'none', outline: 'none', fontSize: '14px', color: '#191c1e', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 700, color: '#5c403c', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Password</label>
                  {mode === 'login' && (
                    <a href="#" onClick={e => { e.preventDefault(); alert('Password reset link will be sent to your email.'); }}
                      style={{ fontSize: '10px', fontWeight: 800, color: '#b70011', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}>
                      Forgot?
                    </a>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <span className="material-symbols-outlined" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#94a3b8', pointerEvents: 'none' }}>lock</span>
                  <input
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    style={{ background: '#eceef0', borderRadius: '10px', padding: '12px 42px 12px 42px', width: '100%', border: 'none', outline: 'none', fontSize: '14px', color: '#191c1e', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94a3b8' }}>
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ba1a1a', background: 'rgba(255,218,214,0.5)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error_outline</span>
                  {error}
                </div>
              )}

              {/* ENTER PORTAL Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', background: '#cc0000', color: '#fff',
                  borderRadius: '50px', padding: '18px',
                  fontFamily: "'Manrope', sans-serif", fontWeight: 900,
                  fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  boxShadow: '0 8px 24px rgba(183,0,17,0.25)',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => !loading && (e.target.style.background = '#b70011')}
                onMouseOut={e => !loading && (e.target.style.background = '#cc0000')}
              >
                {loading ? 'Processing...' : (mode === 'signup' ? 'Join the Network' : 'Enter Portal')}
              </button>

              {/* Bottom Links */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setForm({ hospitalName: '', phone: '', email: '', location: '', pinCode: '', password: '' }); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b70011', fontWeight: 700, fontSize: '13px', padding: 0 }}
                >
                  {mode === 'signup' ? 'Already have an account? Sign in' : 'Join the Network'}
                </button>
                <a href="#" onClick={e => { e.preventDefault(); alert('Contact our support team at support@lifesync.health'); }}
                  style={{ color: '#005e8d', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Support Center
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
                </a>
              </div>

            </form>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', opacity: 0.5, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '13px', color: '#191c1e' }}>LifeSync</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy Policy', 'Terms of Service', 'Security'].map(link => (
            <a key={link} href="#" onClick={e => { e.preventDefault(); alert(`${link} will be available soon.`); }}
              style={{ color: '#64748b', fontSize: '11px', textDecoration: 'none', letterSpacing: '0.03em' }}>
              {link}
            </a>
          ))}
        </div>
        <span style={{ color: '#64748b', fontSize: '11px' }}>© 2026 LifeSync. All rights reserved.</span>
      </footer>

    </div>
  );
}
