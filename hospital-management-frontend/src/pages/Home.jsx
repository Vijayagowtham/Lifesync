import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import {
  Users, CalendarDays, Activity, ArrowRight, TrendingUp, Hospital, UserCheck
} from 'lucide-react';

function CountUp({ target, duration = 1200 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count}</span>;
}

export default function Home() {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0 });
  const [recentAppts, setRecentAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [{ count: dCount }, { count: pCount }, { count: aCount }] = await Promise.all([
        supabase.from('doctors').select('*', { count: 'exact', head: true }),
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ doctors: dCount || 0, patients: pCount || 0, appointments: aCount || 0 });

      const { data: appts } = await supabase
        .from('appointments')
        .select(`*, doctors(name, specialization), patients(full_name)`)
        .order('created_at', { ascending: false })
        .limit(6);
      setRecentAppts(appts || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const statCards = [
    { label: 'Doctors', value: stats.doctors, icon: <UserCheck size={24} /> },
    { label: 'Patients', value: stats.patients, icon: <Users size={24} /> },
    { label: 'Appointments', value: stats.appointments, icon: <CalendarDays size={24} /> },
  ];

  const statusColor = { Pending: 'warning', Confirmed: 'success', Cancelled: 'danger', Completed: 'info' };

  return (
    <div className="animate-up">
      <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'clamp(20px, 5vw, 32px)',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', opacity: 0.03, color: 'var(--primary)', pointerEvents: 'none' }}>
          <Hospital size={180} />
        </div>
        <div style={{ maxWidth: 600, position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
            Live System — Real Time Data
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 6vw, 2.2rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 10, color: 'var(--text-primary)' }}>
            Welcome to <span style={{ color: 'var(--primary)' }}>LifeSync</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.875rem, 2vw, 1rem)', lineHeight: 1.6 }}>
            Complete hospital management — track doctors, patients, appointments and all resource availability in real-time.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            <Link to="/appointments" className="btn btn-primary" style={{ flex: '1 1 auto', minWidth: '160px' }}>
              <CalendarDays size={16} /> Booked Appointments
            </Link>
            <Link to="/availability" className="btn btn-outline" style={{ flex: '1 1 auto', minWidth: '160px' }}>
              <Activity size={16} /> Check Availability
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: 28, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-info">
              <h3>
                {loading ? <span className="skeleton" style={{ display: 'inline-block', width: 40, height: 28 }} /> : <CountUp target={s.value} />}
              </h3>
              <p>{s.label}</p>
              <div className="stat-change up"><TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />Active</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="section-title" style={{ margin: 0 }}><CalendarDays size={18} color="var(--primary)" /> Recent Appointments</h3>
          <Link to="/appointments" style={{ color: 'var(--primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius)' }} />)}
          </div>
        ) : recentAppts.length === 0 ? (
          <div className="empty-state">
            <CalendarDays className="empty-state-icon" size={40} />
            <h3>No appointments yet</h3>
            <p>Bookings will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {recentAppts.map((a) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.patients?.full_name || 'Unknown'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Dr. {a.doctors?.name} • {a.appointment_date}
                  </div>
                </div>
                <span className={`badge badge-${statusColor[a.status] || 'muted'}`}>{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { to: '/hospital', icon: <Hospital size={28} />, label: 'Profile' },
          { to: '/doctors', icon: <UserCheck size={28} />, label: 'Doctors' },
          { to: '/patients', icon: <Users size={28} />, label: 'Patients' },
          { to: '/appointments', icon: <CalendarDays size={28} />, label: 'Appointments' },
          { to: '/availability', icon: <Activity size={28} />, label: 'Availability' },
        ].map((l) => (
          <Link key={l.to} to={l.to} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 16px',
            textAlign: 'center',
            transition: 'var(--transition)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-sm)'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ marginBottom: 12, color: 'inherit' }}>{l.icon}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{l.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
