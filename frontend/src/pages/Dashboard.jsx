import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Briefcase, CheckCircle, Clock, XCircle } from 'lucide-react';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:4000/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ saved: 0, applied: 0, interviewing: 0, rejected: 0 });

  useEffect(() => {
    // In a real app, you'd fetch stats from a specific endpoint
    // For now we'll fetch all apps and calculate
    axios.get(`${API_BASE}/jobs/applications`).then(res => {
      const apps = res.data;
      setStats({
        saved: apps.filter(a => a.status === 'SAVED').length,
        applied: apps.filter(a => a.status === 'APPLIED').length,
        interviewing: apps.filter(a => a.status === 'INTERVIEW').length,
        rejected: apps.filter(a => a.status === 'REJECTED').length,
      });
    });
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ backgroundColor: `${color}1A`, color: color, padding: '16px', borderRadius: '12px' }}>
        <Icon size={32} />
      </div>
      <div>
        <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>{title}</h3>
        <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{value}</p>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Your productivity and application metrics</p>

      <div className="grid-3" style={{ marginBottom: '40px' }}>
        <StatCard title="Total Saved" value={stats.saved} icon={Briefcase} color="var(--color-accent)" />
        <StatCard title="Total Applied" value={stats.applied} icon={Clock} color="var(--color-warning)" />
        <StatCard title="Interviews" value={stats.interviewing} icon={CheckCircle} color="var(--color-success)" />
      </div>

      <div className="card" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Interactive Activity Chart will appear here</p>
      </div>
    </div>
  );
};

export default Dashboard;
