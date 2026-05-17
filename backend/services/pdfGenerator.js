const puppeteer = require('puppeteer');

/**
 * Generates a beautifully styled, A4, print-ready PDF resume.
 * 
 * @param {object} profile - The database profile object.
 * @param {string} lang - Language code ('en' or 'es').
 * @returns {Promise<Buffer>} - Resolves with the PDF file buffer.
 */
async function generatePDF(profile, lang = 'es') {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Curriculum Vitae - ${profile.fullName}</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Outfit', sans-serif;
          color: #1e293b;
          line-height: 1.6;
          background-color: #ffffff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .resume-container {
          padding: 30px;
          max-width: 850px;
          margin: 0 auto;
        }
        /* Header design with photo */
        .header {
          display: flex;
          align-items: center;
          gap: 28px;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 24px;
          margin-bottom: 24px;
        }
        .avatar-container {
          flex-shrink: 0;
        }
        .avatar {
          width: 110px;
          height: 110px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        .header-info {
          flex: 1;
        }
        .name {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin-bottom: 2px;
        }
        .title {
          font-size: 16px;
          font-weight: 600;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 12px;
        }
        .contacts {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 16px;
          font-size: 13px;
          color: #475569;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 5px;
          background-color: #f8fafc;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid #f1f5f9;
        }
        /* Sections */
        .section {
          margin-bottom: 24px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-title::after {
          content: '';
          flex: 1;
          height: 2px;
          background-color: #e2e8f0;
        }
        .section-title-icon {
          color: #2563eb;
        }
        .summary {
          font-size: 13.5px;
          color: #334155;
          text-align: justify;
          margin-bottom: 16px;
          white-space: pre-wrap;
        }
        /* Skills listing as premium badges */
        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }
        .skill-badge {
          background-color: #eff6ff;
          color: #1e3a8a;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid #dbeafe;
        }
        /* Experience description */
        .experience-content {
          font-size: 13px;
          color: #334155;
          white-space: pre-wrap;
          line-height: 1.7;
        }
        /* Footer brand */
        .footer {
          margin-top: 36px;
          border-top: 1px solid #e2e8f0;
          padding-top: 16px;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
        }
        @media print {
          body {
            background-color: #ffffff;
          }
          .resume-container {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="resume-container">
        <div class="header">
          ${profile.avatarUrl 
            ? `<div class="avatar-container"><img class="avatar" src="http://localhost:4000${profile.avatarUrl}" alt="Avatar"></div>` 
            : ''
          }
          <div class="header-info">
            <h1 class="name">${profile.fullName}</h1>
            <div class="title">
              ${lang === 'en' 
                ? 'Senior Full Stack & AI Developer' 
                : 'Desarrollador Full Stack & IA Senior'
              }
            </div>
            <div class="contacts">
              <div class="contact-item">✉️ ${profile.email}</div>
              ${profile.phone ? `<div class="contact-item">📞 ${profile.phone}</div>` : ''}
              ${profile.github ? `<div class="contact-item">💻 GitHub: ${profile.github}</div>` : ''}
              ${profile.linkedin ? `<div class="contact-item">🔗 LinkedIn: ${profile.linkedin}</div>` : ''}
              <div class="contact-item">🌐 CV: https://my-jobs-board-3af2f1-187.124.239.214.sslip.io/cv/${profile.publicSlug}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">
            <span class="section-title-icon">👤</span>
            ${lang === 'en' ? 'Professional Profile' : 'Perfil Profesional'}
          </h2>
          <div class="summary">
            ${lang === 'en'
              ? 'Senior Full Stack Developer specializing in building high-performance web systems and AI-powered automation applications. Highly skilled in TypeScript, React, Node.js, and containerized Docker environments.'
              : 'Desarrollador Full Stack Senior especializado en la creación de sistemas web de alto rendimiento y aplicaciones de automatización potenciadas por Inteligencia Artificial. Altamente capacitado en TypeScript, React, Node.js y entornos de Docker en contenedores.'
            }
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">
            <span class="section-title-icon">⚡</span>
            ${lang === 'en' ? 'Core Technologies & Skills' : 'Tecnologías y Habilidades Clave'}
          </h2>
          <div class="skills-grid">
            ${profile.skills.split(',').map(s => `<span class="skill-badge">${s.trim()}</span>`).join('')}
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">
            <span class="section-title-icon">💼</span>
            ${lang === 'en' ? 'Professional Experience' : 'Experiencia Profesional'}
          </h2>
          <div class="experience-content">${profile.experience || ''}</div>
        </div>

        <div class="footer">
          Generado automáticamente por MyJobsBoard — Workspace Personal.
        </div>
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '18mm',
      right: '18mm',
      bottom: '18mm',
      left: '18mm'
    }
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = {
  generatePDF
};
