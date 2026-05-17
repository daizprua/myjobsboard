import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sparkles, Send } from 'lucide-react';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:4000/api';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/jobs`);
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateMatch = async (jobId) => {
    try {
      const res = await axios.post(`${API_BASE}/ai/match-score`, { jobId });
      setJobs(jobs.map(j => j.id === jobId ? { ...j, matchScore: res.data.score } : j));
    } catch (err) {
      console.error(err);
    }
  };

  const saveJob = async (jobId) => {
    try {
      await axios.post(`${API_BASE}/jobs/applications`, { jobId, status: 'SAVED' });
      alert('Job Saved to Kanban!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save job');
    }
  };

  const triggerScraper = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/jobs/scrape`);
      alert("Scraper started in background. Refresh in a minute.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Job Explorer</h1>
        <button onClick={triggerScraper} className="btn btn-outline" disabled={loading}>
          {loading ? 'Starting...' : 'Run Scraper'}
        </button>
      </div>
      <p className="page-subtitle">Discover and auto-apply to top tech roles</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {jobs.map(job => (
          <div key={job.id} className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, paddingRight: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{job.title}</h3>
                {job.matchScore && (
                  <span className="badge badge-success">{job.matchScore}% Match</span>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>{job.company} • {job.location}</p>
              <p style={{ fontSize: '14px', marginBottom: '16px' }}>{job.description.substring(0, 150)}...</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {job.tags.split(',').slice(0, 3).map(tag => (
                  tag.trim() && <span key={tag} className="badge">{tag.trim()}</span>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '160px' }}>
              <button onClick={() => calculateMatch(job.id)} className="btn btn-outline" style={{ display: 'flex', gap: '8px' }}>
                <Sparkles size={16} /> Analyze Match
              </button>
              <button onClick={() => saveJob(job.id)} className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
                <Send size={16} /> Save to Kanban
              </button>
              <a href={job.applyUrl} target="_blank" rel="noreferrer" style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                View Original
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsList;
