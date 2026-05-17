import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Zap, ExternalLink } from 'lucide-react';
import AutoApplyModal from '../components/AutoApplyModal';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:4000/api';
const COLUMNS = ['SAVED', 'APPLYING', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'];

const Kanban = () => {
  const [applications, setApplications] = useState([]);
  const [applyJob, setApplyJob] = useState(null);

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
      <p className="page-subtitle">Gestiona y automatiza tus postulaciones de empleo de forma fluida</p>

      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
        {COLUMNS.map(column => {
          const columnApps = applications.filter(a => a.status === column);
          return (
            <div key={column} style={{ minWidth: '300px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{column}</h3>
                <span className="badge">{columnApps.length}</span>
              </div>
              
              {columnApps.map(app => (
                <div key={app.id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>{app.job?.title}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>{app.job?.company}</p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {app.job?.matchScore && (
                      <span className="badge badge-success" style={{ fontWeight: 600, fontSize: '11px' }}>
                        {app.job.matchScore}% Match
                      </span>
                    )}
                    {app.screenshotPath && (
                      <a
                        href={import.meta.env.PROD ? `/screenshots/${app.screenshotPath}` : `http://localhost:4000/screenshots/${app.screenshotPath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="badge badge-success"
                        style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      >
                        Screenshot <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  
                  {column === 'SAVED' && (
                    <button
                      onClick={() => setApplyJob(app.job)}
                      className="btn btn-primary"
                      style={{
                        width: '100%', fontSize: '12px', padding: '6px 12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-accent)'
                      }}
                    >
                      <Zap size={12} /> Auto-Postular con IA
                    </button>
                  )}

                  <select 
                    className="input-field" 
                    style={{ padding: '6px', fontSize: '12px', width: '100%', marginTop: '4px' }}
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

      {applyJob && (
        <AutoApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onApplySuccess={() => {
            fetchApplications();
          }}
        />
      )}
    </div>
  );
};

export default Kanban;
