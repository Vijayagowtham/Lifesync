import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import Modal from '../components/Modal';
import { Phone, Mail, Globe, Clock, Building2, ShieldCheck, MapPin, Edit, Hospital, Image as ImageIcon } from 'lucide-react';

export default function HospitalDetails() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', lat: '', lon: '', logo_url: '' });

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    setLoading(true);
    const { data } = await supabase.from('hospitals').select('*').order('id', { ascending: true }).limit(1).single();
    if (data) {
      setProfile(data);
      setForm({ name: data.name || '', phone: data.phone || '', email: data.email || '', lat: data.lat || '', lon: data.lon || '', logo_url: data.logo_url || '' });
    }
    setLoading(false);
  }

  async function saveProfile() {
    if (!profile) return;
    await supabase.from('hospitals').update({ name: form.name, phone: form.phone, lat: form.lat, lon: form.lon, logo_url: form.logo_url }).eq('id', profile.id);
    setShowEdit(false);
    loadProfile();
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />)}
    </div>
  );

  if (!profile) return (
    <div className="empty-state">
      <Hospital className="empty-state-icon" size={40} />
      <h3>No Profile Found</h3>
      <p>Ensure the database has a hospital record.</p>
    </div>
  );

  const infoItems = [
    { icon: <MapPin size={18} />, label: 'Address', value: profile.address || 'Central City' },
    { icon: <Phone size={18} />, label: 'Phone', value: profile.phone || '+91 XXXX XXXX' },
    { icon: <Mail size={18} />, label: 'Email', value: profile.email || 'contact@lifesync.com' },
    { icon: <Globe size={18} />, label: 'Website', value: profile.website || 'www.lifesync.com' },
    { icon: <Clock size={18} />, label: 'Working Hours', value: '24/7 Emergency • OPD: 8AM – 8PM' },
    { icon: <Building2 size={18} />, label: 'Type', value: 'Multi-Specialty Hospital' },
    { icon: <ShieldCheck size={18} />, label: 'Accreditation', value: 'NABH Accredited • ISO 9001:2015' }
  ];

  return (
    <div className="animate-up">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Profile</h1>
          <p>Manage your hospital identity and primary contact details</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowEdit(true)}>
          <Edit size={16} /> Edit Profile
        </button>
      </div>

      <div className="hospital-hero" style={{ padding: 'clamp(20px, 5vw, 32px)' }}>
        <div style={{ 
          display: 'flex', 
          gap: 'clamp(16px, 4vw, 24px)', 
          alignItems: 'center', 
          flexDirection: window.innerWidth <= 640 ? 'column' : 'row',
          textAlign: window.innerWidth <= 640 ? 'center' : 'left'
        }}>
          <div style={{ 
            width: 'clamp(80px, 20vw, 100px)', 
            height: 'clamp(80px, 20vw, 100px)', 
            borderRadius: 'var(--radius-lg)', 
            background: 'var(--surface-2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'var(--primary)', 
            flexShrink: 0, 
            overflow: 'hidden', 
            border: '1px solid var(--border)' 
          }}>
            {profile.logo_url ? <img src={profile.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Hospital size={48} />}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 2.2rem)', marginBottom: 8, color: 'var(--primary)', lineHeight: 1.1 }}>{profile.name}</h1>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Primary Healthcare Facility</div>
            <div style={{ 
              display: 'flex', 
              gap: 8, 
              marginTop: 14, 
              flexWrap: 'wrap',
              justifyContent: window.innerWidth <= 640 ? 'center' : 'flex-start'
            }}>
              <span className="badge badge-success">Active Location</span>
              <span className="badge badge-primary">Emergency Setup Ready</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginTop: 32 }}>
          {[
            { label: 'Total Beds', value: profile.beds || 300, icon: <div style={{background:'var(--primary-glow)',color:'var(--primary)',padding:8,borderRadius:'50%',display:'inline-flex'}}><MapPin size={18}/></div> },
            { label: 'Doctors', value: profile.doctors || 80, icon: <div style={{background:'var(--primary-glow)',color:'var(--primary)',padding:8,borderRadius:'50%',display:'inline-flex'}}><Building2 size={18}/></div> },
            { label: 'Experience', value: '15+ Yrs', icon: <div style={{background:'var(--primary-glow)',color:'var(--primary)',padding:8,borderRadius:'50%',display:'inline-flex'}}><ShieldCheck size={18}/></div> },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div>{s.icon}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginTop: 8 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <h3 className="section-title"><Building2 size={18} color="var(--primary)" /> Info & Contacts</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        {infoItems.map((item) => (
          <div key={item.label} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: 'var(--primary)', background: 'var(--primary-glow)', padding: '10px', borderRadius: 'var(--radius)' }}>{item.icon}</div>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{item.label}</label>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: 2 }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Hospital Profile"
        footer={<><button className="btn btn-outline" onClick={() => setShowEdit(false)}>Cancel</button><button className="btn btn-primary" onClick={saveProfile}>Save Changes</button></>}>
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Hospital Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="LifeSync Hospital" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Profile Image (URL)</label>
            <div style={{ position: 'relative' }}>
              <ImageIcon size={16} style={{ position: 'absolute', top: 12, left: 12, color: 'var(--text-muted)' }} />
              <input value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="https://example.com/logo.png" style={{ paddingLeft: 38 }} />
            </div>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Login Email ID <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.7rem' }}>(Protected)</span></label>
            <input value={form.email} readOnly disabled style={{ background: 'var(--surface-3)', cursor: 'not-allowed', color: 'var(--text-muted)' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Latitude</label>
            <input value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} placeholder="e.g. 13.0827" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
