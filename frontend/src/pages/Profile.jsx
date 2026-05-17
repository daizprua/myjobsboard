import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sparkles } from 'lucide-react';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:4000/api';

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [linkedinRecs, setLinkedinRecs] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/profile`).then(res => setProfile(res.data));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/profile`, profile);
      alert('Profile updated');
    } catch (err) {
      console.error(err);
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/ai/linkedin-optimize`);
      setLinkedinRecs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/profile/linkedin/import`);
      alert(res.data.message || 'Profile imported from LinkedIn!');
      // Reload profile
      const profRes = await axios.get(`${API_BASE}/profile`);
      setProfile(profRes.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to import. Check your li_at cookie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Profile & Settings</h1>
      <p className="page-subtitle">Manage your CV data and AI preferences</p>

      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 600 }}>Master Profile</h3>
            <button onClick={handleImport} className="btn btn-outline" style={{ display: 'flex', gap: '8px', padding: '6px 12px', fontSize: '13px' }} disabled={loading}>
              <Sparkles size={14} /> {loading ? 'Importing...' : 'Import from LinkedIn'}
            </button>
          </div>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              className="input-field" 
              placeholder="Full Name" 
              value={profile.fullName || ''} 
              onChange={e => setProfile({...profile, fullName: e.target.value})} 
            />
            <input 
              className="input-field" 
              placeholder="Email" 
              value={profile.email || ''} 
              onChange={e => setProfile({...profile, email: e.target.value})} 
            />
            <input 
              className="input-field" 
              placeholder="Skills (comma separated)" 
              value={profile.skills || ''} 
              onChange={e => setProfile({...profile, skills: e.target.value})} 
            />
            <textarea 
              className="input-field" 
              placeholder="Experience / Resume Text" 
              rows={5}
              value={profile.experience || ''} 
              onChange={e => setProfile({...profile, experience: e.target.value})} 
            />
            <input 
              className="input-field" 
              placeholder="Public Slug (e.g. developer)" 
              value={profile.publicSlug || ''} 
              onChange={e => setProfile({...profile, publicSlug: e.target.value})} 
            />
            <div style={{ marginTop: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>LinkedIn Session Cookie ('li_at')</label>
              <input 
                type="password"
                className="input-field" 
                placeholder="Paste your 'li_at' cookie here for direct sync..." 
                value={profile.linkedinCookie || ''} 
                onChange={e => setProfile({...profile, linkedinCookie: e.target.value})} 
              />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Get this from your Browser DevTools &rarr; Application &rarr; Cookies &rarr; linkedin.com &rarr; 'li_at'</p>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Save Profile</button>
          </form>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 600 }}>LinkedIn Optimizer</h3>
            <button onClick={handleOptimize} className="btn btn-outline" style={{ display: 'flex', gap: '8px', padding: '6px 12px', fontSize: '13px' }} disabled={loading}>
              <Sparkles size={14} /> {loading ? 'Generating...' : 'Optimize Profile'}
            </button>
          </div>
          
          <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', borderRadius: '8px', padding: '20px', fontFamily: 'monospace', fontSize: '13px', overflowY: 'auto', marginBottom: '16px' }}>
            {!linkedinRecs ? (
              <p style={{ color: 'var(--text-muted)' }}>Click 'Optimize Profile' to generate high-impact AI recommendations for your LinkedIn based on your master profile data.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <strong style={{ color: 'var(--color-accent)' }}>// HEADLINE</strong>
                  <p style={{ marginTop: '8px' }}>{linkedinRecs.headline}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--color-accent)' }}>// ABOUT SUMMARY</strong>
                  <p style={{ marginTop: '8px' }}>{linkedinRecs.summary}</p>
                </div>
                <div>
                  <strong style={{ color: 'var(--color-accent)' }}>// EXPERIENCE BULLETS</strong>
                  <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                    {linkedinRecs.experienceBullets?.map((b, i) => (
                      <li key={i} style={{ marginBottom: '8px' }}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {linkedinRecs && (
            <button 
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await axios.post(`${API_BASE}/profile/linkedin/sync`, {
                    headline: linkedinRecs.headline,
                    summary: linkedinRecs.summary
                  });
                  alert(res.data.message || 'LinkedIn synced successfully!');
                } catch (err) {
                  alert(err.response?.data?.error || 'Failed to sync. Make sure your li_at cookie is correct.');
                } finally {
                  setLoading(false);
                }
              }}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', gap: '8px' }}
              disabled={loading}
            >
              <Sparkles size={16} /> {loading ? 'Syncing with LinkedIn...' : 'Sync Live to LinkedIn Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
