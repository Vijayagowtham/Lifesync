import { useLocation, Link } from 'react-router-dom';
import { Bell, Clock, Activity, Menu, Hospital } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const pageTitles = {
  '/': 'Dashboard',
  '/hospital': 'Profile',
  '/doctors': 'Doctors',
  '/patients': 'Patient Records',
  '/appointments': 'Booked Appointments',
  '/availability': 'Availability Status',
  '/ambulance': 'Ambulance Fleet',
  '/ambulance-driver': 'Driver Dashboard',
};

export default function Topbar({ onToggleSidebar }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'LifeSync';
  const [time, setTime] = useState(new Date());
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    loadProfile();
    const channel = supabase.channel('realtime-topbar-hospital')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hospitals' }, () => {
        loadProfile();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadProfile() {
    const { data } = await supabase.from('hospitals').select('name, logo_url').order('id', { ascending: true }).limit(1).single();
    if (data) setProfile(data);
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={onToggleSidebar}>
          <Menu size={20} />
        </button>
        <div>
          <div className="topbar-title">{title}</div>
          <div className="topbar-breadcrumb">LifeSync / {title}</div>
        </div>
      </div>
      <div className="topbar-right">
        <div className="clock-wrap" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <Clock size={14} />
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <span className="topbar-badge"><Activity size={14} /> System Live</span>

        <button className="btn-icon btn-outline" style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '8px' }}>
          <Bell size={16} />
        </button>

        <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }}></div>

        <Link to="/hospital" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 10, 
          padding: '6px 12px', 
          borderRadius: 'var(--radius-full)', 
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          textDecoration: 'none',
          color: 'inherit',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        title="Edit Profile"
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {profile?.logo_url ? (
              <img src={profile.logo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Hospital size={16} />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '120px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.name || 'LifeSync Hospital'}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Profile
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
