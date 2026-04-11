import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { RefreshCcw, Bed, Activity, Pill, Microscope, Stethoscope, Droplets, Truck, Zap, Eye, BatteryCharging, Users, Flame } from 'lucide-react';

function GaugeCard({ title, icon, total, occupied, color = 'green', suffix = '' }) {
  const tot = total || 1; 
  const occ = occupied || 0;
  const pct = Math.min(100, Math.round((occ / tot) * 100));
  
  let barColor = 'var(--success)';
  if (color === 'red') barColor = 'var(--danger)';
  else if (color === 'yellow') barColor = 'var(--warning)';
  else {
    if (pct > 90) barColor = 'var(--danger)'; 
    else if (pct > 75) barColor = 'var(--warning)'; 
  }

  return (
    <div className="avail-card">
      <div className="avail-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
          {icon} <span className="avail-label">{title}</span>
        </div>
        <div className="avail-count">{tot - occ} <span style={{fontSize:'0.7rem', color:'var(--text-dim)', fontWeight:500}}>free</span></div>
      </div>
      <div className="avail-bar-wrap">
        <div className="avail-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="avail-sub">{occ} in use</div>
        <div className="avail-sub">{tot} total{suffix}</div>
      </div>
    </div>
  );
}

function BoolCard({ title, status, icon }) {
  const isOn = status === true;
  return (
    <div className={`bool-card ${isOn ? 'on' : 'off'}`}>
      <div style={{ width: 32, height: 32, borderRadius: 'var(--radius)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isOn ? 'var(--success)' : 'var(--text-muted)' }}>
        {icon}
      </div>
      <div>
        <div className="bool-name">{title}</div>
        <div className={`bool-status ${isOn ? 'on' : 'off'}`}>{isOn ? 'Available' : 'Unavailable'}</div>
      </div>
    </div>
  );
}

export default function Availability() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  async function loadData() {
    setLoading(true);
    // Single hospital fetch
    const { data: hosp } = await supabase.from('hospitals').select('id').order('id').limit(1).single();
    if (hosp) {
      const { data: avail } = await supabase.from('hospital_availability').select('*').eq('hospital_id', hosp.id).maybeSingle();
      setData(avail || {});
    }
    setLastRefreshed(new Date());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading availability metrics...</div>
  );

  if (!data) return (
    <div className="empty-state">
      <Activity size={40} className="empty-state-icon" />
      <h3>No Resource Data Found</h3>
      <p>System could not load resource availability.</p>
    </div>
  );

  return (
    <div className="animate-up">
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-text">
          <h1>Availability Status</h1>
          <p>Real-time resource tracking across the hospital</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated: {lastRefreshed.toLocaleTimeString()}</div>
          <button className="btn btn-outline" onClick={loadData} title="Refresh Data">
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="avail-section">
        <h3 className="avail-section-title"><Bed size={20} /> Wards & Beds</h3>
        <div className="avail-grid">
          <GaugeCard title="General Beds" icon={<Bed size={16} />} total={data.beds_total} occupied={data.beds_occupied} />
          <GaugeCard title="ICU Beds" icon={<Activity size={16} />} total={data.icu_total} occupied={data.icu_occupied} />
          <GaugeCard title="Emergency Beds" icon={<Stethoscope size={16} />} total={data.emergency_total} occupied={data.emergency_occupied} />
        </div>
      </div>

      <div className="avail-section">
        <h3 className="avail-section-title"><Flame size={20} /> Critical Resources</h3>
        <div className="avail-grid">
          <GaugeCard title="Operating Theaters" icon={<Zap size={16} />} total={data.ot_total} occupied={data.ot_in_use} />
          <GaugeCard title="Ventilators" icon={<Activity size={16} />} total={data.ventilators_total} occupied={data.ventilators_in_use} />
          <GaugeCard title="Dialysis Units" icon={<Droplets size={16} />} total={data.dialysis_units_total} occupied={data.dialysis_units_in_use} />
          <GaugeCard title="Ambulances" icon={<Truck size={16} />} total={data.ambulances_total} occupied={data.ambulances_total - data.ambulances_available} color="green" />
        </div>
      </div>

      <div className="avail-section">
        <h3 className="avail-section-title"><Pill size={20} /> Pharmacy & Diagnostics</h3>
        <div className="bool-grid">
          <BoolCard title="Pharmacy Base" icon={<Pill size={16}/>} status={data.pharmacy_open} />
          <BoolCard title="24Hr Pharmacy" icon={<Pill size={16}/>} status={data.pharmacy_24hr} />
          <BoolCard title="Main Lab" icon={<Microscope size={16}/>} status={data.lab_open} />
          <BoolCard title="24Hr Lab" icon={<Microscope size={16}/>} status={data.lab_24hr} />
          <BoolCard title="X-Ray" icon={<Eye size={16}/>} status={data.xray_available} />
          <BoolCard title="CT Scan" icon={<Activity size={16}/>} status={data.ct_scan_available} />
          <BoolCard title="MRI Scanner" icon={<Activity size={16}/>} status={data.mri_available} />
          <BoolCard title="Ultrasound" icon={<Eye size={16}/>} status={data.ultrasound_available} />
        </div>
      </div>

      <div className="avail-section">
        <h3 className="avail-section-title"><Droplets size={20} /> Blood Bank Inventory</h3>
        <div className="blood-grid">
          {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => {
            const key = `blood_${type.replace('+','_pos').replace('-','_neg').toLowerCase()}`;
            const units = data[key] || 0;
            return (
              <div key={type} className="blood-badge">
                <div className="blood-type">{type}</div>
                <div className="blood-units">{units}</div>
                <div className="blood-label">Units</div>
                <div style={{ marginTop: 8, height: 4, background: 'var(--surface-2)', borderRadius: 2 }}>
                  <div style={{ height: '100%', background: units > 10 ? 'var(--success)' : units > 0 ? 'var(--warning)' : 'var(--danger)', width: `${Math.min(100, Math.max(5, units * 2))}%`, borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="avail-section">
        <h3 className="avail-section-title"><Users size={20} /> Support & Equipment</h3>
        <div className="avail-grid">
          <GaugeCard title="Working Nurses" icon={<Users size={16} />} total={100} occupied={data.nurses_on_duty} color="green" suffix=" total staff" />
          <GaugeCard title="Support Staff" icon={<Users size={16} />} total={50} occupied={data.support_staff_count} color="green" suffix=" total staff" />
          <GaugeCard title="Oxygen (O₂)" icon={<BatteryCharging size={16} />} total={50} occupied={50 - (data.oxygen_cylinders||0)} suffix=" capacity" />
          <GaugeCard title="Wheelchairs" icon={<Activity size={16} />} total={30} occupied={30 - (data.wheelchair_available||0)} suffix=" capacity" />
        </div>
      </div>
    </div>
  );
}
