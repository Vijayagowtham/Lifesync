import { useLocation, Link } from 'react-router-dom';
import { Bell, Clock, Activity, Menu, Hospital, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

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

export default function Topbar({ onToggleSidebar, user, onLogout }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'LifeSync';
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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

        {/* Hospital profile pill */}
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
        title="View Profile"
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Hospital size={16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '140px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.hospitalName || 'LifeSync Hospital'}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {user?.email || 'Hospital Admin'}
            </span>
          </div>
        </Link>

        {/* Logout button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Log out"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <LogOut size={15} /> Logout
          </button>
        )}
      </div>
    </header>
  );
}
