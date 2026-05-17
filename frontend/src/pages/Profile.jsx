import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Fingerprint, Globe, User, Copy, Check } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:4000/api';

// ─── Professional Profile Templates ─────────────────────────────────────────
const PROFILE_EN = {
  fullName: 'Darinel Aizprua',
  email: 'darinelaizprua@gmail.com',
  skills: 'React, Next.js, Node.js, Express, TypeScript, JavaScript, Python, FastAPI, PostgreSQL, SQLite, Prisma, Docker, Docker Compose, Nginx, Linux, Git, REST APIs, GraphQL, WebSockets, OpenAI API, LangChain, Prompt Engineering, AI Integration, Machine Learning Basics, Tailwind CSS, CSS3, HTML5, Vite, CI/CD, GitHub Actions, Dokploy, VPS Deployment, WebAuthn, Passkeys, Redis',
  experience: `Senior Full Stack & AI Developer | 5+ Years Experience

PROFESSIONAL SUMMARY
Results-driven Full Stack Developer specializing in building scalable, production-grade web applications and AI-powered systems. Expert in modern JavaScript/TypeScript ecosystems and Python backends, with deep experience integrating LLMs (OpenAI, Claude, local models) into real-world SaaS products. Proven track record deploying containerized microservices on self-hosted VPS infrastructure using Docker and Dokploy.

KEY COMPETENCIES
• Frontend: React 18, Next.js 14 (App Router), Vite, TypeScript, Tailwind CSS, Responsive Design, PWA
• Backend: Node.js, Express, FastAPI, Python, REST APIs, GraphQL, WebSocket, Server-Sent Events
• Databases: PostgreSQL, SQLite, Turso (libSQL), Prisma ORM, Redis, Drizzle ORM
• AI & ML: OpenAI GPT-4/4o, Claude Sonnet, LangChain, RAG pipelines, Embeddings, Vector databases, Prompt Engineering, AI Agents
• DevOps: Docker, Docker Compose, Nginx, VPS management, Dokploy, GitHub Actions, CI/CD pipelines
• Security: WebAuthn/Passkeys, JWT, PBKDF2 password hashing, HTTPS/TLS, CORS, Rate limiting
• Architecture: Microservices, Monorepo, MVC, Repository Pattern, Event-Driven Design

EXPERIENCE HIGHLIGHTS
• Built and deployed a full-stack AI job board SaaS with LinkedIn data sync, Kanban pipeline, and AI-powered job match scoring
• Integrated OpenAI and Anthropic LLMs into customer-facing products, reducing manual workload by 60%
• Architected multi-tenant SaaS applications with secure authentication (passkeys, biometrics, 2FA)
• Led migration from Firebase to self-hosted Dokploy + PostgreSQL infrastructure, cutting costs by 80%
• Designed real-time dashboards with WebSocket and SSE for live financial and market data
• Implemented CI/CD pipelines with GitHub Actions and automated Docker deployments

CERTIFICATIONS & EDUCATION
• Self-taught & project-based learning (10,000+ hours)
• Udemy: Complete React Developer, Node.js Bootcamp, Python & ML
• freeCodeCamp: Responsive Web Design, JavaScript Algorithms`,
  publicSlug: 'darinel-fullstack-ai',
};

const PROFILE_ES = {
  fullName: 'Darinel Aizprua',
  email: 'darinelaizprua@gmail.com',
  skills: 'React, Next.js, Node.js, Express, TypeScript, JavaScript, Python, FastAPI, PostgreSQL, SQLite, Prisma, Docker, Docker Compose, Nginx, Linux, Git, REST APIs, GraphQL, WebSockets, OpenAI API, LangChain, Ingeniería de Prompts, Integración de IA, Machine Learning, Tailwind CSS, CSS3, HTML5, Vite, CI/CD, GitHub Actions, Dokploy, Despliegue en VPS, WebAuthn, Passkeys, Redis',
  experience: `Desarrollador Full Stack & IA Senior | +5 Años de Experiencia

RESUMEN PROFESIONAL
Desarrollador Full Stack orientado a resultados, especializado en construir aplicaciones web escalables y sistemas potenciados por Inteligencia Artificial. Experto en ecosistemas modernos de JavaScript/TypeScript y backends en Python, con amplia experiencia integrando LLMs (OpenAI, Claude, modelos locales) en productos SaaS reales. Historial comprobado desplegando microservicios en contenedores sobre infraestructura VPS propia con Docker y Dokploy.

COMPETENCIAS CLAVE
• Frontend: React 18, Next.js 14 (App Router), Vite, TypeScript, Tailwind CSS, Diseño Responsivo, PWA
• Backend: Node.js, Express, FastAPI, Python, APIs REST, GraphQL, WebSocket, Server-Sent Events
• Bases de datos: PostgreSQL, SQLite, Turso (libSQL), Prisma ORM, Redis, Drizzle ORM
• IA y ML: OpenAI GPT-4/4o, Claude Sonnet, LangChain, pipelines RAG, Embeddings, bases de datos vectoriales, Ingeniería de Prompts, Agentes de IA
• DevOps: Docker, Docker Compose, Nginx, gestión de VPS, Dokploy, GitHub Actions, pipelines CI/CD
• Seguridad: WebAuthn/Passkeys, JWT, hashing PBKDF2, HTTPS/TLS, CORS, limitación de tasa
• Arquitectura: Microservicios, Monorepo, MVC, Patrón Repositorio, Diseño orientado a eventos

LOGROS DESTACADOS
• Construí y desplegué un SaaS de tablero de empleos con IA, sincronización LinkedIn, pipeline Kanban y puntuación de coincidencia de empleos con IA
• Integré LLMs de OpenAI y Anthropic en productos de cara al cliente, reduciendo el trabajo manual en un 60%
• Arquitecté aplicaciones SaaS multi-tenant con autenticación segura (passkeys, biométricos, 2FA)
• Lideré la migración de Firebase a infraestructura Dokploy + PostgreSQL autoalojada, reduciendo costos un 80%
• Diseñé dashboards en tiempo real con WebSocket y SSE para datos financieros y de mercado en vivo
• Implementé pipelines CI/CD con GitHub Actions y despliegues Docker automatizados

CERTIFICACIONES Y FORMACIÓN
• Aprendizaje autodidacta y basado en proyectos (+10,000 horas)
• Udemy: React Completo, Node.js Bootcamp, Python y ML
• freeCodeCamp: Diseño Web Responsivo, Algoritmos JavaScript`,
  publicSlug: 'darinel-fullstack-ia',
};

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatNewPassword, setRepeatNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('en');
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/profile`).then(res => setProfile(res.data));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/profile`, profile);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadTemplate = async (lang) => {
    const template = lang === 'en' ? PROFILE_EN : PROFILE_ES;
    const merged = { ...profile, ...template };
    setProfile(merged);
    try {
      await axios.put(`${API_BASE}/profile`, merged);
      alert(lang === 'en' ? 'English profile loaded and saved!' : '¡Perfil en español cargado y guardado!');
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== repeatNewPassword) {
      alert('New passwords do not match!');
      return;
    }
    setPwdLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/change-password`, { currentPassword, newPassword });
      alert(res.data.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setRepeatNewPassword('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleRegisterBiometrics = async () => {
    setBioLoading(true);
    try {
      const resp = await axios.post(`${API_BASE}/webauthn/generate-registration`);
      const attResp = await startRegistration(resp.data);
      const verificationResp = await axios.post(`${API_BASE}/webauthn/verify-registration`, attResp);
      if (verificationResp.data.verified) {
        alert('Biometric device registered! You can now sign in with Face ID / Touch ID.');
      } else {
        alert('Biometric registration could not be verified.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Biometric registration failed. Ensure you are on HTTPS and your browser supports passkeys.');
    } finally {
      setBioLoading(false);
    }
  };

  const CopyButton = ({ text, field }) => (
    <button
      type="button"
      onClick={() => copyToClipboard(text, field)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: copiedField === field ? 'var(--color-success)' : 'var(--text-muted)',
        padding: '4px', display: 'flex', alignItems: 'center', gap: '4px',
        fontSize: '12px', transition: 'color 0.2s',
      }}
    >
      {copiedField === field ? <Check size={14} /> : <Copy size={14} />}
      {copiedField === field ? 'Copied!' : 'Copy'}
    </button>
  );

  const tpl = activeTab === 'en' ? PROFILE_EN : PROFILE_ES;

  return (
    <div>
      <h1 className="page-title">Profile & Settings</h1>
      <p className="page-subtitle">Manage your CV data, professional profiles, and security</p>

      <div className="grid-2">
        {/* ── LEFT COLUMN ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Master Profile Form */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 600, margin: 0 }}>Master Profile</h3>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                className="input-field"
                placeholder="Full Name"
                value={profile.fullName || ''}
                onChange={e => setProfile({ ...profile, fullName: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Email"
                value={profile.email || ''}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Skills (comma separated)"
                value={profile.skills || ''}
                onChange={e => setProfile({ ...profile, skills: e.target.value })}
              />
              <textarea
                className="input-field"
                placeholder="Experience / Resume Text"
                rows={6}
                value={profile.experience || ''}
                onChange={e => setProfile({ ...profile, experience: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Public Slug (e.g. darinel-dev)"
                value={profile.publicSlug || ''}
                onChange={e => setProfile({ ...profile, publicSlug: e.target.value })}
              />
              <button type="submit" className="btn btn-primary" style={{ marginTop: '4px' }}>
                Save Profile
              </button>
            </form>
          </div>

          {/* Security & Credentials */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <ShieldCheck size={18} style={{ color: 'var(--color-accent)' }} />
              <h3 style={{ fontWeight: 600, margin: 0 }}>Security & Credentials</h3>
            </div>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="password" className="input-field" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
              <input type="password" className="input-field" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              <input type="password" className="input-field" placeholder="Repeat New Password" value={repeatNewPassword} onChange={e => setRepeatNewPassword(e.target.value)} required />
              <button type="submit" className="btn btn-primary" disabled={pwdLoading}>
                {pwdLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>

            <div style={{ margin: '24px 0', borderBottom: '1px solid var(--border-light)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>Biometric Sign-In (Passkey)</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '4px 0 12px 0' }}>
                Register your fingerprint or Face ID to sign in instantly — no password needed.
              </p>
              <button
                onClick={handleRegisterBiometrics}
                className="btn btn-outline"
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', width: '100%' }}
                disabled={bioLoading}
              >
                <Fingerprint size={16} />
                {bioLoading ? 'Registering Device...' : 'Register Face ID / Touch ID'}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Professional Profile Generator */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Globe size={18} style={{ color: 'var(--color-accent)' }} />
              <h3 style={{ fontWeight: 600, margin: 0 }}>Professional Profile Templates</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              Pre-built profiles for a Senior Full Stack & AI Developer. Click a language to preview, then load it directly into your Master Profile.
            </p>

            {/* Language tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                onClick={() => setActiveTab('en')}
                className={activeTab === 'en' ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ flex: 1 }}
              >
                🇺🇸 English
              </button>
              <button
                onClick={() => setActiveTab('es')}
                className={activeTab === 'es' ? 'btn btn-primary' : 'btn btn-outline'}
                style={{ flex: 1 }}
              >
                🇪🇸 Español
              </button>
            </div>

            {/* Skills Preview */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Skills
                </label>
                <CopyButton text={tpl.skills} field="skills" />
              </div>
              <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: '8px', padding: '12px', fontSize: '13px', lineHeight: 1.6 }}>
                {tpl.skills.split(', ').map(skill => (
                  <span key={skill} style={{
                    display: 'inline-block', margin: '2px 4px 2px 0',
                    backgroundColor: 'var(--color-accent-glow)', color: 'var(--color-accent)',
                    borderRadius: '4px', padding: '2px 8px', fontSize: '12px', fontWeight: 500
                  }}>{skill}</span>
                ))}
              </div>
            </div>

            {/* Experience Preview */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {activeTab === 'en' ? 'Full Profile / CV Content' : 'Perfil Completo / Contenido CV'}
                </label>
                <CopyButton text={tpl.experience} field="experience" />
              </div>
              <div style={{
                backgroundColor: 'var(--bg-main)', borderRadius: '8px', padding: '16px',
                fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.7, maxHeight: '320px',
                overflowY: 'auto', whiteSpace: 'pre-wrap', color: 'var(--text-main)'
              }}>
                {tpl.experience}
              </div>
            </div>

            {/* Load Button */}
            <button
              onClick={() => handleLoadTemplate(activeTab)}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <User size={16} />
              {activeTab === 'en' ? 'Load English Profile into Master' : 'Cargar Perfil Español al Master'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
