import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Hospital, Stethoscope, Users,
  CalendarDays, Activity, Heart, Ambulance, X, LogOut
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/hospital', icon: Hospital, label: 'Profile' },
  { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/appointments', icon: CalendarDays, label: 'Booked Appointments' },
  { to: '/availability', icon: Activity, label: 'Availability' },
  { to: '/ambulance', icon: Ambulance, label: 'Ambulance' },
  { to: '/ambulance-driver', icon: Users, label: 'Driver Dashboard' },
];

export default function Sidebar({ isOpen, onClose, user, onLogout }) {
  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Heart size={20} />
        </div>
        <div className="sidebar-logo-text">
          <h2>LifeSync</h2>
          <span>Hospital System</span>
        </div>
        <button 
          className="menu-toggle" 
          onClick={onClose}
          style={{ marginLeft: 'auto', display: window.innerWidth <= 768 ? 'block' : 'none' }}
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={handleNavClick}
          >
            <Icon size={18} className="nav-icon" />
            {label}
          </NavLink>
        ))}

        <div className="nav-separator" style={{ height: 1, background: 'var(--border)', margin: '16px 12px' }} />
        
        <button 
          className="nav-item" 
          onClick={() => {
            if (confirm('Are you sure you want to logout?')) {
              onLogout && onLogout();
            }
          }}
          style={{ width: 'calc(100% - 24px)', margin: '0 12px 12px', color: 'var(--danger)' }}
        >
          <LogOut size={18} className="nav-icon" style={{ color: 'var(--danger)' }} />
          Logout
        </button>
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
          © 2026 LifeSync
        </div>
        <div style={{ marginTop: 4, color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 600 }}>
          {user?.hospitalName ? `${user.hospitalName}` : 'LifeSync Hospital'}
        </div>
      </div>
    </aside>
  );
}
