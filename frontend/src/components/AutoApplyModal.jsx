import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Sparkles, Send, CheckCircle2, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:4000/api';

const AutoApplyModal = ({ job, onClose, onApplySuccess }) => {
  const [step, setStep] = useState('generating'); // generating, review, applying, success, error
  const [coverLetter, setCoverLetter] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [applyMethod, setApplyMethod] = useState('browser'); // email, browser

  useEffect(() => {
    // Detect application method
    if (job.applyUrl.includes('@') || job.applyUrl.startsWith('mailto:')) {
      setApplyMethod('email');
    } else {
      setApplyMethod('browser');
    }

    // Generate Cover Letter automatically
    generateAIContent();
  }, [job]);

  const generateAIContent = async () => {
    setStep('generating');
    try {
      const res = await axios.post(`${API_BASE}/ai/cover-letter`, { jobId: job.id });
      setCoverLetter(res.data.text);
      setStep('review');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'No se pudo generar la carta de presentación con IA.');
      setStep('error');
    }
  };

  const handleLaunchApply = async () => {
    setStep('applying');
    try {
      const res = await axios.post(`${API_BASE}/ai/auto-apply`, {
        jobId: job.id,
        coverLetterText: coverLetter
      });

      if (res.data.success) {
        if (res.data.screenshot) {
          const imgUrl = import.meta.env.PROD 
            ? `/screenshots/${res.data.screenshot}` 
            : `http://localhost:4000/screenshots/${res.data.screenshot}`;
          setScreenshotUrl(imgUrl);
        }
        setStep('success');
        if (onApplySuccess) onApplySuccess();
      } else {
        setErrorMsg(res.data.error || 'La postulación automática no pudo completarse.');
        setStep('error');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Ocurrió un error al procesar la postulación automática.');
      setStep('error');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div className="card" style={{
        width: '100%', maxWidth: '600px', padding: '24px', position: 'relative',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)', border: '1px solid var(--border-light)'
      }}>
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none',
          color: 'var(--text-muted)', cursor: 'pointer', padding: '4px'
        }}>
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Sparkles size={20} style={{ color: 'var(--color-accent)' }} />
          <h3 style={{ fontWeight: 700, margin: 0, fontSize: '18px' }}>Postulación Automática con IA</h3>
        </div>

        <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
          <h4 style={{ fontWeight: 600, margin: '0 0 4px 0', fontSize: '15px' }}>{job.title}</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>{job.company} • {job.location}</p>
        </div>

        {/* STEP 1: Generating Cover Letter */}
        {step === 'generating' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: '16px' }}>
            <Loader2 className="animate-spin" size={36} style={{ color: 'var(--color-accent)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>Redactando Carta de Presentación...</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                Analizando tu experiencia, habilidades clave y la descripción del empleo para crear un texto personalizado.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Review Content */}
        {step === 'review' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Carta de Presentación Generada por IA
              </label>
              <textarea
                className="input-field"
                rows={10}
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                style={{ fontFamily: 'sans-serif', fontSize: '13px', lineHeight: 1.6 }}
              />
            </div>

            {/* Application Pipeline Info */}
            <div style={{
              backgroundColor: 'var(--bg-main)', borderRadius: '8px', padding: '12px',
              borderLeft: '4px solid var(--color-accent)', marginBottom: '20px'
            }}>
              <h5 style={{ fontWeight: 600, margin: '0 0 4px 0', fontSize: '13px' }}>
                {applyMethod === 'email' ? '📬 Postulación Vía Email' : '🌐 Automatización de Navegador'}
              </h5>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
                {applyMethod === 'email' 
                  ? `Se enviará un correo personalizado a ${job.applyUrl.replace('mailto:', '')} adjuntando automáticamente tu currículum PDF generado con foto.` 
                  : `Se abrirá un navegador automatizado Puppeteer, se rellenarán tus datos (Nombre, Email, GitHub, LinkedIn) y se capturará una captura del formulario completado.`
                }
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
                Cancelar
              </button>
              <button onClick={handleLaunchApply} className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Send size={16} />
                Confirmar y Postular con IA
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Applying */}
        {step === 'applying' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: '16px' }}>
            <Loader2 className="animate-spin" size={36} style={{ color: 'var(--color-accent)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>Procesando Postulación Automática...</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                {applyMethod === 'email' 
                  ? 'Estableciendo conexión SMTP segura y adjuntando currículum PDF...' 
                  : 'Navegando al portal de empleo, buscando campos e insertando información...'
                }
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: '16px' }}>
            <CheckCircle2 size={48} style={{ color: 'var(--color-success)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, fontSize: '18px', margin: '0 0 4px 0' }}>¡Postulación Exitosa!</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                {applyMethod === 'email' 
                  ? 'El correo con tu carta de presentación y CV PDF adjunto se ha enviado correctamente.' 
                  : 'El agente automatizado ha completado el formulario de postulación de forma exitosa.'
                }
              </p>
            </div>

            {screenshotUrl && (
              <a
                href={screenshotUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', textDecoration: 'none' }}
              >
                <ImageIcon size={16} />
                Ver Captura del Formulario
              </a>
            )}

            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
              Entendido
            </button>
          </div>
        )}

        {/* STEP 5: Error */}
        {step === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: '16px' }}>
            <AlertCircle size={48} style={{ color: 'var(--color-danger)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, fontSize: '16px', margin: '0 0 4px 0' }}>Error en la Postulación</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                {errorMsg}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '16px' }}>
              <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
                Cerrar
              </button>
              <button onClick={generateAIContent} className="btn btn-primary" style={{ flex: 1 }}>
                Reintentar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AutoApplyModal;
