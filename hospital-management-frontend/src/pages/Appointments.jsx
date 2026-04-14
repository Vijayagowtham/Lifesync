/* eslint-disable */
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import Modal from '../components/Modal';
import { Plus, Check, Clock, XCircle, CheckCircle2, Save, CalendarDays, Search, User, UserCheck } from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  async function loadData() {
    try {
      const [{ data: appts, error: err1 }, { data: pats, error: err2 }, { data: docs, error: err3 }] = await Promise.all([
        supabase.from('appointments').select('*, doctors(name, specialization), patients(full_name, phone)').order('appointment_date', { ascending: false }),
        supabase.from('patients').select('id, full_name').order('full_name'),
        supabase.from('doctors').select('id, name, specialization').order('name'),
      ]);
      if (err1) throw err1;
      if (err2) throw err2;
      if (err3) throw err3;
      setAppointments(appts || []);
      setPatients(pats || []);
      setDoctors(docs || []);
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);
  async function updateStatus(id, newStatus) {
    if (confirm(`Mark appointment as ${newStatus}?`)) {
      try {
        const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
        if (error) throw error;
        loadData();
      } catch (err) {
        alert("Failed to update appointment: " + err.message);
      }
    }
  }

  const filtered = filter === 'All' ? appointments : appointments.filter(a => a.status === filter);

  const statusIcons = {
    'Pending': <Clock size={12} />,
    'Confirmed': <CheckCircle2 size={12} />,
    'Completed': <Check size={12} />,
    'Cancelled': <XCircle size={12} />
  };
  const statusColors = { Pending: 'warning', Confirmed: 'success', Completed: 'info', Cancelled: 'danger' };

  return (
    <div className="animate-up">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Appointments</h1>
          <p>Book and manage patient appointments</p>
        </div>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: 10, marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600, border: 'none', transition: 'var(--transition)',
              background: filter === f ? 'var(--primary)' : 'var(--surface-2)',
              color: filter === f ? '#fff' : 'var(--text-secondary)'
            }}>
            {f}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor & Specialty</th>
              <th>Date & Time</th>
              <th style={{ minWidth: '150px' }}>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => <tr key={i}><td colSpan="6"><div className="skeleton" style={{ height: 40, borderRadius: 'var(--radius)' }} /></td></tr>)
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="empty-state" style={{ border: 'none' }}><CalendarDays size={32} className="empty-state-icon"/><div>No appointments found in this category.</div></td></tr>
            ) : filtered.map(a => (
              <tr key={a.id}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{a.patients?.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{a.patients?.phone}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Dr. {a.doctors?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{a.doctors?.specialization}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{a.appointment_date}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{a.appointment_time}</div>
                </td>
                <td>
                  <div style={{ 
                    maxWidth: 150, 
                    whiteSpace: 'normal', 
                    overflow: 'hidden', 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    fontSize: '0.85rem'
                  }}>
                    {a.reason || '—'}
                  </div>
                </td>
                <td>
                  <span className={`badge badge-${statusColors[a.status] || 'muted'}`} style={{ whiteSpace: 'nowrap' }}>
                    {statusIcons[a.status] || ''} <span style={{marginLeft:4}}>{a.status}</span>
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {a.status === 'Pending' && <button className="btn btn-sm btn-accent" style={{ padding: '6px 10px' }} onClick={() => updateStatus(a.id, 'Confirmed')}>Confirm</button>}
                    {a.status === 'Confirmed' && <button className="btn btn-sm btn-outline" style={{ padding: '6px 10px' }} onClick={() => updateStatus(a.id, 'Completed')}>Complete</button>}
                    {['Pending', 'Confirmed'].includes(a.status) && <button className="btn btn-sm btn-danger" style={{ padding: '6px 10px' }} onClick={() => updateStatus(a.id, 'Cancelled')}>Cancel</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
