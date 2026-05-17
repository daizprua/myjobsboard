import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:4000/api';
const COLUMNS = ['SAVED', 'APPLYING', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'];

const Kanban = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE}/jobs/applications`);
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const moveApplication = async (appId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/jobs/applications/${appId}`, { status: newStatus });
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="page-title">Application Kanban</h1>
      <p className="page-subtitle">Track your job applications seamlessly</p>

      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
        {COLUMNS.map(column => {
          const columnApps = applications.filter(a => a.status === column);
          return (
            <div key={column} style={{ minWidth: '300px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>{column}</h3>
                <span className="badge">{columnApps.length}</span>
              </div>
              
              {columnApps.map(app => (
                <div key={app.id} className="card" style={{ padding: '16px', cursor: 'grab' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{app.job?.title}</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>{app.job?.company}</p>
                  
                  {app.job?.matchScore && (
                    <span className="badge badge-success" style={{ marginBottom: '12px' }}>
                      {app.job.matchScore}% Match
                    </span>
                  )}
                  
                  <select 
                    className="input-field" 
                    style={{ padding: '8px', fontSize: '13px' }}
                    value={app.status}
                    onChange={(e) => moveApplication(app.id, e.target.value)}
                  >
                    {COLUMNS.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Kanban;
