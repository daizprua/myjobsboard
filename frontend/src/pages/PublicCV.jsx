import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Mail, Briefcase, ChevronRight } from 'lucide-react';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:4000/api';

const PublicCV = () => {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/profile/public/${slug}`)
      .then(res => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Profile Not Found</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', padding: '60px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div className="card" style={{ marginBottom: '24px', padding: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>{profile.fullName}</h1>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '24px' }}>Software Engineer</p>
          <p style={{ fontSize: '16px', lineHeight: 1.6, marginBottom: '32px' }}>{profile.bio || profile.experience}</p>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {profile.skills?.split(',').map(skill => (
              <span key={skill} className="badge badge-accent" style={{ fontSize: '14px', padding: '6px 12px' }}>
                {skill.trim()}
              </span>
            ))}
          </div>
          
          <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
            <a href={`mailto:${profile.email}`} className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', gap: '8px' }}>
              <Mail size={18} /> Contact Me
            </a>
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                LinkedIn
              </a>
            )}
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                GitHub
              </a>
            )}
          </div>
        </div>

        {/* Projects Timeline Section */}
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', marginLeft: '8px' }}>Featured Projects</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {profile.projects?.length > 0 ? profile.projects.map(project => (
            <div key={project.id} className="card" style={{ display: 'flex', gap: '20px' }}>
              <div style={{ color: 'var(--color-accent)', paddingTop: '4px' }}>
                <Briefcase size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{project.title}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{project.description}</p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {project.technologies.split(',').map(t => (
                    <span key={t} className="badge">{t.trim()}</span>
                  ))}
                </div>
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    View Project <ChevronRight size={16} />
                  </a>
                )}
              </div>
            </div>
          )) : (
            <p style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>No projects showcased yet.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default PublicCV;
