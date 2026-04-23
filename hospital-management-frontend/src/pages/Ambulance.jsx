/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Modal from '../components/Modal';
import { Search, Plus, Save, Phone, Ambulance as AmbulanceIcon, User, Trash2, ShieldCheck, Activity } from 'lucide-react';

export default function Ambulance() {
  const [ambulances, setAmbulances] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ id: '', vehicle_no: '', model: '', driver_name: '', driver_phone: '', status: 'Available' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAmbulances();
    
    // Listen for realtime updates
    const channel = supabase.channel('realtime-ambulances')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ambulances' }, () => {
        loadAmbulances();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadAmbulances() {
    try {
      const { data, error } = await supabase.from('ambulances').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAmbulances(data || []);
    } catch (err) {
      console.error("Failed to load ambulances:", err);
    } finally {
      setLoading(false);
    }
  }

  async function saveAmbulance() {
    setSaving(true);
    try {
      const { data: hosp, error: hospError } = await supabase.from('hospitals').select('id').limit(1).single();
      if (hospError) throw hospError;
      
      if (!form.id) throw new Error('Vehicle ID is required (e.g. AMB-101)');
      const { error } = await supabase.from('ambulances').insert({ ...form, hospital_id: hosp?.id || null });
      if (error) throw error;
      
      setShowAdd(false);
      setForm({ id: '', vehicle_no: '', model: '', driver_name: '', driver_phone: '', status: 'Available' });
    } catch (err) {
      alert("Error: " + (err.message || "Failed to save ambulance record."));
    } finally {
      setSaving(false);
    }
  }

  async function deleteData() {
    if (!confirmDelete) return;
    const { error } = await supabase.from('ambulances').delete().eq('id', confirmDelete.id);
    if (error) alert("Failed to remove: " + error.message);
    setConfirmDelete(null);
  }

  async function updateStatus(id, newStatus) {
    try {
      const { error } = await supabase.from('ambulances').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
    } catch (err) {
      alert("Failed to update status: " + err.message);
      loadAmbulances(); // Revert UI
    }
  }

  const filtered = ambulances.filter(a => 
    a.vehicle_no?.toLowerCase().includes(search.toLowerCase()) || 
    a.driver_name?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    'Available': 'success',
    'On Call': 'warning',
    'Maintenance': 'danger'
  };

  return (
    <div className="animate-up">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Ambulance Fleet</h1>
          <p>Track live ambulance units and driver availability</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      <div className="search-bar" style={{ marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ maxWidth: 400 }}>
          <Search size={16} className="search-icon" />
          <input placeholder="Search by vehicle no. or driver name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{ambulances.filter(a => a.status === 'Available').length}</span> Units Available
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Vehicle Details</th>
              <th>Assigned Driver</th>
              <th>Contact Node</th>
              <th>Current Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}><td colSpan="5"><div className="skeleton" style={{ height: 40, borderRadius: 'var(--radius)' }} /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan="5" className="empty-state" style={{ border: 'none' }}><AmbulanceIcon size={32} className="empty-state-icon" /><div>No ambulance records found.</div></td></tr>
            ) : filtered.map(a => (
              <tr key={a.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid var(--border)' }}>
                      <AmbulanceIcon size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{a.vehicle_no}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.model || 'Standard Life Support'}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                    <User size={14} /> {a.driver_name || 'Unassigned'}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                    <Phone size={14} /> {a.driver_phone || '—'}
                  </div>
                </td>
                <td>
                  <select 
                    value={a.status} 
                    onChange={(e) => updateStatus(a.id, e.target.value)}
                    className={`badge badge-${statusColors[a.status] || 'muted'}`}
                    style={{ border: 'none', outline: 'none', cursor: 'pointer', appearance: 'none', paddingRight: 8 }}
                  >
                    <option value="Available">Available</option>
                    <option value="On Call">On Call</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </td>
                <td>
                  <button className="btn btn-sm btn-danger" style={{ padding: '6px 8px' }} onClick={() => setConfirmDelete(a)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <Modal isOpen={true} onClose={() => setConfirmDelete(null)} title="Confirm Removal" size="sm"
          footer={<><button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button><button className="btn btn-danger" onClick={deleteData}>Remove</button></>}>
          <div style={{ padding: '10px 0' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Permanently remove vehicle <b>{confirmDelete.vehicle_no}</b> from the fleet registry?</p>
          </div>
        </Modal>
      )}

      {/* Add Ambulance Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Register Emergency Vehicle" size="lg"
        footer={<><button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={saveAmbulance} disabled={saving || !form.id || !form.vehicle_no || !form.driver_name}><Save size={14} /> {saving ? 'Adding...' : 'Register Vehicle'}</button></>}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Unit ID * (e.g. AMB-101)</label>
            <input value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} placeholder="AMB-101" />
          </div>
          <div className="form-group">
            <label className="form-label">Vehicle Registration No. *</label>
            <input value={form.vehicle_no} onChange={e => setForm({ ...form, vehicle_no: e.target.value })} placeholder="e.g. TN 01 AB 1234" />
          </div>
          <div className="form-group">
            <label className="form-label">Vehicle Model / Type</label>
            <input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="e.g. Force Traveler (ALS)" />
          </div>
          <div className="form-group">
            <label className="form-label">Assigned Driver Name *</label>
            <input value={form.driver_name} onChange={e => setForm({ ...form, driver_name: e.target.value })} placeholder="Full Name" />
          </div>
          <div className="form-group">
            <label className="form-label">Driver Contact Number *</label>
            <input value={form.driver_phone} onChange={e => setForm({ ...form, driver_phone: e.target.value })} placeholder="+91..." />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Initial Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="Available">Available (Ready for Dispatch)</option>
              <option value="Maintenance">Under Maintenance</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
