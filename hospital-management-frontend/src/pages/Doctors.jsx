/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import Modal from '../components/Modal';
import { Search, Phone, Mail, Calendar, User, Stethoscope, Plus, Save, Upload, Download, Trash2, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SPECIALIZATIONS = ['All','Cardiology','Orthopedics','Neurology','Oncology','Pediatrics','Gynecology','Dermatology','ENT','Ophthalmology','Gastroenterology','General Surgery','Emergency Medicine','Radiology','Psychiatry','Pulmonology'];

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('All');
  const [availFilter, setAvailFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [loading, setLoading] = useState(true);

  // Bulk Upload variables
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Add doctor modal
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', specialization: 'Cardiology', qualification: '', experience: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { 
    loadDoctors(); 
    
    // Listen for realtime updates from Supabase
    const channel = supabase.channel('realtime-doctors')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, (payload) => {
        loadDoctors(); // Refresh immediately when any user or admin edits db!
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadDoctors() {
    try {
      const { data, error } = await supabase.from('doctors').select('*').order('name');
      if (error) throw error;
      setDoctors(data || []);
      setFiltered(data || []);
    } catch (err) {
      console.error("Failed to load doctors:", err);
    } finally {
      setLoading(false);
    }
  }

  // Helper to strictly force download with extension
  function forceDownload(wb, filename) {
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function saveDoctor() {
    setSaving(true);
    const { data: hosp } = await supabase.from('hospitals').select('id').limit(1).single();
    await supabase.from('doctors').insert({
      ...form,
      hospital_id: hosp?.id || null,
      available: true
    });
    setShowAdd(false);
    setForm({ name: '', specialization: 'Cardiology', qualification: '', experience: '', phone: '', email: '' });
    loadDoctors();
    setSaving(false);
  }

  async function deleteDoctor() {
    if (!confirmDelete) return;
    const docId = confirmDelete.id;
    const { error } = await supabase.from('doctors').delete().eq('id', docId);
    if (error) {
      alert("Failed to delete: " + error.message);
      console.error(error);
    }
    setConfirmDelete(null);
    // UI will auto-refresh via realtime subscription above
  }

  async function deleteAllDoctors() {
    const { error } = await supabase.from('doctors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) alert("Failed to clear data: " + error.message);
    setConfirmDeleteAll(false);
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) { alert('Excel file is empty!'); setUploading(false); return; }

        const { data: hosp } = await supabase.from('hospitals').select('id').limit(1).single();
        const hospitalId = hosp?.id || null;

        const payload = data.map(row => {
          // Ultra flexible column mapping
          const getVal = (keywords) => {
            const foundKey = Object.keys(row).find(k => {
              const cleanHead = k.toLowerCase().replace(/[^a-z]/g, ''); // strip everything except letters
              return keywords.some(kw => cleanHead.includes(kw.toLowerCase()));
            });
            return foundKey ? row[foundKey] : undefined;
          };
          
          let experienceVal = getVal(['experience', 'exp', 'yrs', 'years']);
          if (experienceVal) { 
            experienceVal = parseInt(String(experienceVal).replace(/[^0-9]/g, ''));
          }
          
          const statusVal = String(getVal(['status', 'available', 'availability']) || '').toLowerCase();
          const isBusy = statusVal.includes('busy') || statusVal.includes('unavail') || statusVal.includes('false') || statusVal.includes('no');

          return {
            hospital_id: hospitalId,
            name: getVal(['name', 'doctor']) || 'Unknown',
            specialization: getVal(['specialization', 'specialty', 'dept', 'department']) || 'General Medicine',
            qualification: getVal(['qualification', 'degree', 'edu']) || '',
            experience: experienceVal || 0,
            phone: String(getVal(['phone', 'mobile', 'contact', 'cell']) || ''),
            email: String(getVal(['email', 'mail']) || ''),
            available: !isBusy
          };
        });

        const { error } = await supabase.from('doctors').insert(payload);
        if (error) throw error;
        
        alert(`Successfully imported ${payload.length} doctors!`);
        loadDoctors();
      } catch (err) {
        console.error(err);
        alert('Failed to upload Excel file. Make sure columns match the template.');
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  }

  useEffect(() => {
    let res = doctors;
    if (search) res = res.filter(d => d.name?.toLowerCase().includes(search.toLowerCase()) || d.specialization?.toLowerCase().includes(search.toLowerCase()));
    if (specFilter !== 'All') res = res.filter(d => d.specialization === specFilter);
    if (availFilter !== 'All') res = res.filter(d => availFilter === 'Available' ? d.available : !d.available);
    setFiltered(res);
  }, [search, specFilter, availFilter, doctors]);

  const schedule = selected?.schedule || { mon: '9AM-5PM', tue: '9AM-5PM', wed: '9AM-5PM', thu: '9AM-5PM', fri: '9AM-5PM', sat: '10AM-2PM', sun: 'Off' };

  return (
    <div className="animate-up">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Doctors</h1>
          <p>{filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input type="file" accept=".xlsx, .xls, .csv" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} />
          <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload'}
          </button>

          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Doctor
          </button>

          <button className="btn btn-danger" onClick={() => setConfirmDeleteAll(true)} title="Delete All Doctors">
            <Trash2 size={16} /> Clear All
          </button>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input placeholder="Search by name or specialization..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={specFilter} onChange={e => setSpecFilter(e.target.value)} style={{ flex: '1 1 auto', minWidth: 150 }}>
          {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={availFilter} onChange={e => setAvailFilter(e.target.value)} style={{ flex: '1 1 auto', minWidth: 120 }}>
          {['All','Available','Unavailable'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>S.No</th><th>ID</th><th>Name</th><th>Specialization</th><th>Exp (Yrs)</th><th>Phone</th><th>Email</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {[...Array(6)].map((_, i) => <tr key={i}><td colSpan="9"><div className="skeleton" style={{ height: 32, borderRadius: 'var(--radius)' }} /></td></tr>)}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Stethoscope className="empty-state-icon" size={40} />
          <h3>No doctors found</h3>
          <p>Try adjusting the search or filters.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>ID</th>
                <th>Name</th>
                <th>Specialization</th>
                <th>Exp (Yrs)</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc, index) => (
                <tr key={doc.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(doc)}>
                  <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                  <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                    {doc.id.substring(0, 8)}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name || 'Dr. Unknown'}</td>
                  <td><span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem' }}>{doc.specialization}</span></td>
                  <td>{doc.experience || 0}</td>
                  <td>{doc.phone || '—'}</td>
                  <td><div style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.email || '—'}</div></td>
                  <td>
                    <span className={`badge ${doc.available !== false ? 'badge-success' : 'badge-danger'}`}>
                      {doc.available !== false ? 'Available' : 'Busy'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-outline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelected(doc); }}>View</button>
                      <button className="btn btn-sm btn-danger" style={{ padding: '6px 8px' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDelete(doc); }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Doctor Detail Modal */}
      {selected && (
        <Modal isOpen={true} onClose={() => setSelected(null)} title="Doctor Profile" size="lg">
          <div>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)', display: 'flex', border: '1px solid var(--border)', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                <User size={36} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selected.name || 'Unknown Doctor'}</div>
                <div style={{ color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>{selected.specialization || 'General Medicine'}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4, fontWeight: 500 }}>{selected.qualification || ''}</div>
                <div style={{ marginTop: 10 }}>
                  <span className={`badge ${selected.available !== false ? 'badge-success' : 'badge-danger'}`}>
                    {selected.available !== false ? 'Available Today' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ color: 'var(--primary)', background: 'var(--primary-glow)', padding: '8px', borderRadius: 'var(--radius-sm)' }}><Phone size={16} /></div>
                <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Phone</div><div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: 2 }}>{selected.phone || '+91 98765 43210'}</div></div>
              </div>
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ color: 'var(--primary)', background: 'var(--primary-glow)', padding: '8px', borderRadius: 'var(--radius-sm)' }}><Mail size={16} /></div>
                <div style={{ overflow: 'hidden' }}><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Email</div><div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: 2, textOverflow: 'ellipsis', overflow: 'hidden' }}>{selected.email || 'doctor@lifesync.com'}</div></div>
              </div>
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', display: 'flex', alignItems: 'center', gap: 12, gridColumn: '1 / -1' }}>
                <div style={{ color: 'var(--primary)', background: 'var(--primary-glow)', padding: '8px', borderRadius: 'var(--radius-sm)' }}><Stethoscope size={16} /></div>
                <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Experience</div><div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: 2 }}>{selected.experience || 0}+ years</div></div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <Modal isOpen={true} onClose={() => setConfirmDelete(null)} title="Confirm Removal" size="sm"
          footer={<><button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button><button className="btn btn-danger" onClick={deleteDoctor}>Remove Doctor</button></>}>
          <div style={{ padding: '10px 0' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Are you perfectly sure you want to permanently remove <b>{confirmDelete.name || 'this doctor'}</b> from the database?</p>
            <p style={{ marginTop: 10, fontSize: '0.85rem', color: 'var(--danger)' }}>This action cannot be undone.</p>
          </div>
        </Modal>
      )}

      {/* Delete ALL Confirmation Modal */}
      {confirmDeleteAll && (
        <Modal isOpen={true} onClose={() => setConfirmDeleteAll(false)} title="WARNING: Clear All Data" size="sm"
          footer={<><button className="btn btn-outline" onClick={() => setConfirmDeleteAll(false)}>Cancel</button><button className="btn btn-danger" onClick={deleteAllDoctors}>Yes, Delete All Data</button></>}>
          <div style={{ padding: '10px 0' }}>
            <p style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '1.1rem' }}>CAUTION!</p>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>You are about to permanently delete <b>EVERY SINGLE DOCTOR</b> in the platform.</p>
            <p style={{ marginTop: 10, fontSize: '0.85rem', color: 'var(--danger)' }}>This action is completely irreversible.</p>
          </div>
        </Modal>
      )}

      {/* Add Doctor Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Register New Doctor" size="lg"
        footer={<><button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={saveDoctor} disabled={saving || !form.name || !form.phone}><Save size={14} /> {saving ? 'Saving...' : 'Save Doctor'}</button></>}>
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Full Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. John Doe" /></div>
          <div className="form-group"><label className="form-label">Specialization</label>
            <select value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}>
              {SPECIALIZATIONS.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Qualification</label>
            <select value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })}>
              <option value="">-- Select --</option>
              {['MBBS', 'MBBS, MD', 'MBBS, MS', 'BDS', 'MDS', 'BAMS', 'BHMS', 'DNB', 'Other'].map(q => <option key={q}>{q}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Experience (Years)</label><input type="number" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} placeholder="0" min="0" /></div>
          <div className="form-group"><label className="form-label">Phone *</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91..." /></div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="doctor@example.com" /></div>
        </div>
      </Modal>
    </div>
  );
}
