import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:4000/api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem('myjobsboard_auth', 'true');
        onLogin();
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const resp = await axios.post(`${API_BASE}/webauthn/generate-authentication`);
      const authOptions = resp.data;
      
      const asseResp = await startAuthentication(authOptions);
      
      const verificationResp = await axios.post(`${API_BASE}/webauthn/verify-authentication`, asseResp);
      if (verificationResp.data.verified) {
        localStorage.setItem('myjobsboard_auth', 'true');
        onLogin();
        navigate('/');
      }
    } catch (err) {
      setError('Biometric authentication failed or not registered.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>MyJobsBoard</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Sign in to your developer workspace</p>
        
        {error && <div style={{ color: 'var(--color-danger)', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleStandardLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            className="input-field" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ margin: '24px 0', borderBottom: '1px solid var(--border-light)' }}></div>

        <button 
          onClick={handleBiometricLogin} 
          className="btn btn-outline" 
          style={{ width: '100%' }}
        >
          Use Face ID / Touch ID
        </button>
      </div>
    </div>
  );
};

export default Login;
