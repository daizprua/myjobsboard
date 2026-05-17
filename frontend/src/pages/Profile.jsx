import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Fingerprint, Globe, User, Copy, Check, FileDown, Upload, Camera, Trash2 } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:4000/api';

// ─── Professional Profile Templates (Enriched with n8n & Top DBs) ─────────────────
const PROFILE_EN = {
  fullName: 'Darinel Aizprua',
  email: 'darinelaizprua@gmail.com',
  phone: '+507 6000-0000',
  github: 'github.com/daizprua',
  linkedin: 'linkedin.com/in/darinelaizprua',
  portfolio: 'darinel.dev',
  skills: 'React, Next.js, Node.js, Express, TypeScript, JavaScript, Python, FastAPI, PostgreSQL, SQLite, Turso (libSQL), Prisma ORM, Redis, Docker, Docker Compose, Nginx, Linux, n8n Automation, Workflow Automation, AI Integration, OpenAI API, LangChain, RAG Pipelines, Vector Databases, Prompt Engineering, AI Agents, GitHub Actions, AWS, Azure, VPS Deployment, WebAuthn, Passkeys, WebSockets, REST APIs',
  experience: `Senior Full Stack & AI Automation Engineer | 5+ Years Experience

PROFESSIONAL SUMMARY
Highly accomplished Senior Full Stack Developer specializing in building high-performance web systems, AI-powered automation pipelines, and scalable cloud architectures. Expert in JavaScript/TypeScript ecosystems and Python, with a proven track record of integrating LLMs (GPT-4o, Claude 3.5 Sonnet) and building autonomous, automated workflows using n8n and self-hosted microservices. Strong experience deploying secure containerized applications on self-hosted VPS and Cloud environments (AWS/Azure) with Docker.

KEY COMPETENCIES
• Frontend: React 18, Next.js 14 (App Router), Vite, TypeScript, Tailwind CSS, Responsive Design
• Backend: Node.js, Express, FastAPI, Python, REST APIs, WebSockets, SSE, Event-Driven Architecture
• Databases: PostgreSQL, Turso (libSQL), SQLite, Prisma ORM, Drizzle ORM, Redis Caching
• AI & Automation: n8n, OpenAI API, LangChain, RAG (Retrieval-Augmented Generation), Prompt Engineering, Automated Agents, Custom Webhooks
• DevOps & Security: Docker, Docker Compose, Nginx Reverse Proxy, VPS management, AWS, Azure, CI/CD with GitHub Actions, WebAuthn/Passkeys, JWT, SSL/TLS

EXPERIENCE HIGHLIGHTS
• Designed and developed a production-ready Job Board SaaS integrated with n8n automated application pipelines, AI candidate-matching algorithms, and automated email notifications via SMTP.
• Created complex custom n8n automation workflows that automate lead generation, platform syncing, and customer support, reducing operational times by 65%.
• Led database migration to Turso and self-hosted PostgreSQL in Cloud/VPS environments, reducing overall infrastructure and licensing costs by 80% while enhancing query response rates.
• Built secure, passwordless authentication architectures incorporating biometric sign-in (WebAuthn/Passkeys) for commercial customer portals.
• Formulated and executed continuous delivery (CI/CD) practices utilizing GitHub Actions to deliver zero-downtime Dockerized rolling updates to cloud nodes.

CERTIFICATIONS & EDUCATION
• Self-taught & project-based learning (10,000+ hours)
• Udemy: Complete React Developer, Node.js Bootcamp, Python & ML
• freeCodeCamp: Responsive Web Design, JavaScript Algorithms`,
  publicSlug: 'darinel-fullstack-ai',
};

const PROFILE_ES = {
  fullName: 'Darinel Aizprua',
  email: 'darinelaizprua@gmail.com',
  phone: '+507 6000-0000',
  github: 'github.com/daizprua',
  linkedin: 'linkedin.com/in/darinelaizprua',
  portfolio: 'darinel.dev',
  skills: 'React, Next.js, Node.js, Express, TypeScript, JavaScript, Python, FastAPI, PostgreSQL, SQLite, Turso (libSQL), Prisma ORM, Redis, Docker, Docker Compose, Nginx, Linux, Automatización con n8n, Automatización de Workflows, Integración de IA, OpenAI API, LangChain, Pipelines RAG, Bases de Datos Vectoriales, Ingeniería de Prompts, Agentes de IA, GitHub Actions, AWS, Azure, Despliegue en VPS, WebAuthn, Passkeys, WebSockets, APIs REST',
  experience: `Desarrollador Full Stack & Ingeniero de Automatización IA Senior | +5 Años de Experiencia

RESUMEN PROFESIONAL
Desarrollador Full Stack Senior de alto rendimiento, especializado en la creación de sistemas web de excelente rendimiento, flujos de trabajo automatizados con IA y arquitecturas en la nube escalables. Experto en los ecosistemas modernos de JavaScript/TypeScript y Python, con un historial comprobado integrando LLMs (GPT-4o, Claude 3.5 Sonnet) y construyendo flujos autónomos y automatizados utilizando n8n y microservicios autoalojados. Sólida experiencia en el despliegue seguro de aplicaciones contenerizadas en entornos VPS propios y en la nube (AWS/Azure) mediante Docker.

COMPETENCIAS CLAVE
• Frontend: React 18, Next.js 14 (App Router), Vite, TypeScript, Tailwind CSS, Diseño Responsivo
• Backend: Node.js, Express, FastAPI, Python, APIs REST, WebSockets, SSE, Arquitectura Orientada a Eventos
• Bases de Datos: PostgreSQL, Turso (libSQL), SQLite, Prisma ORM, Drizzle ORM, Caché en Redis
• IA y Automatización: n8n, OpenAI API, LangChain, RAG (Generación Aumentada por Recuperación), Ingeniería de Prompts, Agentes Autónomos, Webhooks Personalizados
• DevOps y Seguridad: Docker, Docker Compose, Proxy Inverso Nginx, Gestión de VPS, AWS, Azure, CI/CD con GitHub Actions, WebAuthn/Passkeys, JWT, SSL/TLS

LOGROS DESTACADOS
• Diseñé y desarrollé una plataforma SaaS de Tablero de Empleos integrada con flujos automatizados de n8n para postulaciones, algoritmos de coincidencia con IA y notificaciones automáticas por correo electrónico.
• Creé flujos de automatización complejos en n8n para automatizar la generación de leads, sincronización de plataformas y soporte al cliente, reduciendo los tiempos operativos en un 65%.
• Lideré la migración de bases de datos a Turso y PostgreSQL autoalojado en VPS / Nube, reduciendo costos de infraestructura en un 80% y optimizando los tiempos de respuesta.
• Diseñé e implementé arquitecturas de autenticación seguras sin contraseña incorporando inicio de sesión biométrico (WebAuthn/Passkeys) para portales de clientes.
• Formulado y ejecutado prácticas de integración y despliegue continuo (CI/CD) con GitHub Actions para entregar actualizaciones progresivas sin tiempo de inactividad.

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
  const [uploading, setUploading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('en');
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    axios.get(`${API_BASE}/profile`).then(res => setProfile(res.data));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/profile`, profile);
      alert('¡Perfil actualizado con éxito!');
    } catch (err) {
      console.error(err);
      alert('Error al guardar el perfil.');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    try {
      const res = await axios.post(`${API_BASE}/profile/upload-photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setProfile(prev => ({ ...prev, avatarUrl: res.data.avatarUrl }));
        alert('¡Foto de perfil actualizada con éxito!');
      }
    } catch (err) {
      console.error(err);
      alert('Error al subir la foto de perfil.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const updated = { ...profile, avatarUrl: null };
      setProfile(updated);
      await axios.put(`${API_BASE}/profile`, updated);
      alert('Foto eliminada.');
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
      alert('Error al cargar la plantilla.');
    }
  };

  const handleDownloadPDF = (lang) => {
    setPdfLoading(true);
    const url = `${API_BASE}/profile/pdf?lang=${lang}`;
    window.open(url, '_blank');
    setTimeout(() => setPdfLoading(false), 2000);
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
      alert('¡Las nuevas contraseñas no coinciden!');
      return;
    }
    setPwdLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/change-password`, { currentPassword, newPassword });
      alert(res.data.message || 'Contraseña cambiada con éxito!');
      setCurrentPassword('');
      setNewPassword('');
      setRepeatNewPassword('');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar la contraseña');
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
        alert('¡Dispositivo biométrico registrado! Ya puedes iniciar sesión con Face ID / Touch ID.');
      } else {
        alert('La verificación del registro biométrico falló.');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'El registro biométrico falló. Asegúrate de usar HTTPS y que tu navegador admita Passkeys.');
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <h1 className="page-title">Profile & Settings</h1>
      <p className="page-subtitle">Manage your CV data, upload a persistent photo, and export standard PDF resumes</p>

      <div className="grid-2">
        {/* ── LEFT COLUMN ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Master Profile Form */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 600, margin: 0 }}>Master Profile</h3>
            </div>

            {/* Photo Upload Container */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '20px',
              backgroundColor: 'var(--bg-main)', borderRadius: '12px', padding: '16px',
              marginBottom: '20px', border: '1px dashed var(--border-light)'
            }}>
              <div style={{ position: 'relative' }}>
                {profile.avatarUrl ? (
                  <img
                    src={`${API_BASE.replace('/api', '')}${profile.avatarUrl}`}
                    alt="Profile Avatar"
                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-accent)' }}
                  />
                ) : (
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    backgroundColor: 'var(--border-light)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
                  }}>
                    <Camera size={32} />
                  </div>
                )}
                {uploading && (
                  <div style={{
                    position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '11px', fontWeight: 600
                  }}>
                    ...
                  </div>
                )}
              </div>
              <div>
                <h4 style={{ fontWeight: 600, margin: '0 0 4px 0', fontSize: '14px' }}>Foto de Perfil</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 10px 0' }}>
                  Sube una foto profesional para incluir en tu CV PDF.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <Upload size={14} />
                    Seleccionar Foto
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </label>
                  {profile.avatarUrl && (
                    <button onClick={handleRemovePhoto} className="btn btn-outline" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)', padding: '6px 12px' }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  className="input-field"
                  placeholder="Full Name"
                  value={profile.fullName || ''}
                  onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                  required
                />
                <input
                  className="input-field"
                  placeholder="Email"
                  value={profile.email || ''}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  className="input-field"
                  placeholder="Phone Number (e.g. +507 6000-0000)"
                  value={profile.phone || ''}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                />
                <input
                  className="input-field"
                  placeholder="GitHub URL (e.g. github.com/user)"
                  value={profile.github || ''}
                  onChange={e => setProfile({ ...profile, github: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  className="input-field"
                  placeholder="LinkedIn URL (e.g. linkedin.com/in/user)"
                  value={profile.linkedin || ''}
                  onChange={e => setProfile({ ...profile, linkedin: e.target.value })}
                />
                <input
                  className="input-field"
                  placeholder="Portfolio / Website"
                  value={profile.portfolio || ''}
                  onChange={e => setProfile({ ...profile, portfolio: e.target.value })}
                />
              </div>

              <input
                className="input-field"
                placeholder="Skills (comma separated)"
                value={profile.skills || ''}
                onChange={e => setProfile({ ...profile, skills: e.target.value })}
              />

              <textarea
                className="input-field"
                placeholder="Experience / Resume Text"
                rows={7}
                value={profile.experience || ''}
                onChange={e => setProfile({ ...profile, experience: e.target.value })}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px', alignItems: 'center' }}>
                <input
                  className="input-field"
                  placeholder="Public Slug (e.g. darinel-dev)"
                  value={profile.publicSlug || ''}
                  onChange={e => setProfile({ ...profile, publicSlug: e.target.value })}
                />
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Save Profile
                </button>
              </div>
            </form>
          </div>

          {/* Export to PDF Section */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FileDown size={18} style={{ color: 'var(--color-accent)' }} />
              <h3 style={{ fontWeight: 600, margin: 0 }}>Export to Premium PDF</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              Generate a beautifully styled, print-ready A4 resume in English or Spanish.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => handleDownloadPDF('en')}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                disabled={pdfLoading}
              >
                <FileDown size={16} />
                English PDF
              </button>
              <button
                onClick={() => handleDownloadPDF('es')}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                disabled={pdfLoading}
              >
                <FileDown size={16} />
                Español PDF
              </button>
            </div>
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
              Pre-built templates optimized for a Senior Full Stack & AI Automation Developer (with top DBs & n8n workflows). Click a language to preview, then load it directly into your Master Profile.
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
