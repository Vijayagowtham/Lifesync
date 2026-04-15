import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { supabase } from '../supabase';
import { TrendingUp, Users, Activity, Droplets, Download, Filter } from 'lucide-react';

const COLORS = ['#dc2626', '#ef4444', '#f87171', '#fecaca', '#fee2e2'];

export default function Analytics() {
  const [data, setData] = useState({
    occupancy: [],
    resources: [],
    bloodBank: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Generate MOCK historical data for stunning demo (as per plan)
    const generateMockData = () => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const occupancy = days.map(day => ({
        name: day,
        beds: Math.floor(Math.random() * 40) + 180,
        icu: Math.floor(Math.random() * 15) + 30,
        emergency: Math.floor(Math.random() * 20) + 10
      }));

      const resources = [
        { name: 'Ventilators', total: 50, inUse: 42 },
        { name: 'OT Units', total: 10, inUse: 7 },
        { name: 'Ambulances', total: 20, inUse: 14 },
        { name: 'Oxygen', total: 100, inUse: 85 }
      ];

      const bloodBank = [
        { name: 'O+', value: 45 },
        { name: 'A+', value: 30 },
        { name: 'B+', value: 25 },
        { name: 'AB+', value: 10 },
        { name: 'Others', value: 15 }
      ];

      setData({ occupancy, resources, bloodBank });
      setLoading(false);
    };

    setTimeout(generateMockData, 1000);
  }, []);

  return (
    <div className="animate-up">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Occupancy & Resource Analytics</h1>
          <p>Real-time trend analysis and predictive load metrics</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline" style={{ background: '#fff' }}>
            <Filter size={16} /> Filter Date
          </button>
          <button className="btn btn-primary">
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card" style={{ padding: '24px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div className="badge badge-success" style={{ padding: '4px 8px' }}>+12% vs last week</div>
            <TrendingUp size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>84%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Current Load Factor</div>
        </div>
        <div className="card" style={{ padding: '24px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div className="badge badge-warning" style={{ padding: '4px 8px' }}>Critical Peak</div>
            <Activity size={20} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>42</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Avg Wait Time (Min)</div>
        </div>
        <div className="card" style={{ padding: '24px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div className="badge badge-info" style={{ padding: '4px 8px' }}>Normal Flow</div>
            <Users size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>128</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Active Patients</div>
        </div>
        <div className="card" style={{ padding: '24px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div className="badge badge-danger" style={{ padding: '4px 8px' }}>Low Stock</div>
            <Droplets size={20} color="var(--danger)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>12%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Emergency Blood Reserve</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Load Trend (Primary Chart) */}
        <div className="card lg:col-span-2" style={{ padding: '24px' }}>
          <h3 className="section-title">Weekly Occupancy Trend</h3>
          <div style={{ height: 350, width: '100%', marginTop: 24 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.occupancy} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBeds" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#64748b', fontSize:12, fontWeight:600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill:'#64748b', fontSize:12, fontWeight:600}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                />
                <Area type="monotone" dataKey="beds" name="General Beds" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorBeds)" />
                <Area type="monotone" dataKey="icu" name="ICU Units" stroke="#fbbf24" strokeWidth={3} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Bank Pie Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 className="section-title">Blood Inventory Distribution</h3>
          <div style={{ height: 350, width: '100%', marginTop: 24 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.bloodBank}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data.bloodBank.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Resource Allocation Bar Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 className="section-title">Critical Resource Utilization</h3>
          <div style={{ height: 300, width: '100%', marginTop: 24 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data.resources} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontWeight:700, fill:'#0f172a'}} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                <Bar dataKey="inUse" name="In Use" fill="#dc2626" radius={[0, 4, 4, 0]} barSize={24} />
                <Bar dataKey="total" name="Total Capacity" fill="#f1f5f9" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
