import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sparkles, Send, Zap, ExternalLink } from 'lucide-react';
import AutoApplyModal from '../components/AutoApplyModal';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:4000/api';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applyJob, setApplyJob] = useState(null);

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
      alert('¡Trabajo guardado en tu Kanban!');
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo guardar el trabajo');
    }
  };

  const triggerScraper = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/jobs/scrape`);
      alert("Scraper iniciado en segundo plano. Recarga en un minuto.");
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
          {loading ? 'Iniciando...' : 'Iniciar Scraper'}
        </button>
      </div>
      <p className="page-subtitle">Descubre y postúlate de forma automática a los mejores empleos tech</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {jobs.map(job => (
          <div key={job.id} className="card job-card" style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <div className="job-card-info" style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{job.title}</h3>
                {job.matchScore && (
                  <span className="badge badge-success" style={{ fontWeight: 600 }}>{job.matchScore}% Match</span>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '14px' }}>{job.company} • {job.location}</p>
              <p style={{ fontSize: '14px', marginBottom: '16px', lineHeight: 1.5 }}>{job.description.substring(0, 180)}...</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {job.tags.split(',').slice(0, 4).map(tag => (
                  tag.trim() && <span key={tag} className="badge">{tag.trim()}</span>
                ))}
              </div>
            </div>
            
            <div className="job-card-actions" style={{ minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
              <button onClick={() => calculateMatch(job.id)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                <Sparkles size={14} /> Analizar Match IA
              </button>
              <button onClick={() => setApplyJob(job)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', backgroundColor: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}>
                <Zap size={14} /> Auto-Postular con IA
              </button>
              <button onClick={() => saveJob(job.id)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                <Send size={14} /> Guardar a Kanban
              </button>
              <a href={job.applyUrl} target="_blank" rel="noreferrer" style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                Ver Oferta Original <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {applyJob && (
        <AutoApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onApplySuccess={() => {
            fetchJobs();
          }}
        />
      )}
    </div>
  );
};

export default JobsList;
