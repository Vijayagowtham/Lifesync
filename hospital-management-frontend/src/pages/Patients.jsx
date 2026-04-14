/* eslint-disable */
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import Modal from '../components/Modal';
import { Search, Plus, Save, Phone, Mail, User, AlertTriangle, FileText, Droplets } from 'lucide-react';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadPatients() {
    const { data } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
    setPatients(data || []);
    setLoading(false);
  }

  useEffect(() => { loadPatients(); }, []);
  const filtered = patients.filter(p => p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.phone?.includes(search) || p.blood_group?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-up">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Patient Records</h1>
          <p>Manage medical history and contact information</p>
        </div>
      </div>

      <div className="search-bar" style={{ marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ flex: '1 1 300px' }}>
          <Search size={16} className="search-icon" />
          <input placeholder="Search by name, phone or blood group..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Contact Info</th>
              <th>Blood Group</th>
              <th>Gender / Age</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan="6"><div className="skeleton" style={{ height: 32, borderRadius: 'var(--radius)' }} /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="empty-state" style={{ border: 'none' }}><User size={30} className="empty-state-icon" /><div>No patients found</div></td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(p)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', border: '1px solid var(--border)', flexShrink: 0 }}>
                      <User size={18} color="var(--primary)" />
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{p.full_name}</div>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{p.phone}</div>
                  {p.email && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.email}</div>}
                </td>
                <td><span className="badge badge-danger" style={{ whiteSpace: 'nowrap' }}><Droplets size={10} style={{marginRight:2}}/>{p.blood_group || '—'}</span></td>
                <td>
                  <div style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{p.gender}</div>
                  {p.dob && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>DOB: {p.dob}</div>}
                </td>
                <td><span className="badge badge-success">Active</span></td>
                <td><button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setSelected(p); }}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Patient Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Patient Record" size="lg">
        {selected && (
          <div>
            <div style={{ 
              display: 'flex', 
              gap: 20, 
              alignItems: window.innerWidth <= 480 ? 'center' : 'flex-start', 
              marginBottom: 24,
              flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
              textAlign: window.innerWidth <= 480 ? 'center' : 'left'
            }}>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', border: '1px solid var(--border)', flexShrink: 0 }}>
                <User size={32} color="var(--primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selected.full_name}</div>
                <div style={{ 
                  display: 'flex', 
                  gap: 8, 
                  marginTop: 6, 
                  flexWrap: 'wrap',
                  justifyContent: window.innerWidth <= 480 ? 'center' : 'flex-start'
                }}>
                  <span className="badge badge-muted">{selected.gender}</span>
                  <span className="badge badge-danger"><Droplets size={10} style={{marginRight:2}}/> Blood: {selected.blood_group || 'Unknown'}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Phone</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14}/> {selected.phone}</div>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Email</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={14}/> {selected.email || '—'}</div>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Date of Birth</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{selected.dob || '—'}</div>
              </div>
            </div>

            <h3 className="section-title"><AlertTriangle size={16} color="var(--warning)" /> Medical Alerts</h3>
            <div style={{ background: 'var(--warning-light)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: 24 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--warning)', marginBottom: 4 }}>Allergies</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selected.allergies || 'No known allergies reported.'}</p>
            </div>

            <h3 className="section-title"><FileText size={16} color="var(--primary)" /> Medical History</h3>
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {selected.medical_history || 'No previous medical history recorded.'}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
