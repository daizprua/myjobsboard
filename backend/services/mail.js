const nodemailer = require('nodemailer');
const prisma = require('../prisma');
const { generatePDF } = require('./pdfGenerator');

async function getTransporter() {
  const profile = await prisma.profile.findFirst();
  if (!profile || !profile.smtpHost || !profile.smtpUser || !profile.smtpPass) {
    throw new Error('La configuración SMTP del perfil está incompleta.');
  }

  return nodemailer.createTransport({
    host: profile.smtpHost,
    port: profile.smtpPort || 587,
    secure: profile.smtpPort === 465, 
    auth: {
      user: profile.smtpUser,
      pass: profile.smtpPass,
    },
  });
}

/**
 * Sends a job application via email
 */
async function sendApplicationEmail(job, profile, coverLetterText) {
  try {
    const transporter = await getTransporter();
    
    // Fallback email if no specific applyUrl email is found
    const targetEmail = job.applyUrl.includes('@') ? job.applyUrl.replace('mailto:', '') : profile.email;

    // Generate beautifully styled PDF resume to attach automatically
    let pdfBuffer = null;
    try {
      // Default to Spanish for email applications unless profile target is English
      pdfBuffer = await generatePDF(profile, 'es');
    } catch (pdfErr) {
      console.error('Failed to generate PDF attachment:', pdfErr);
    }

    const mailOptions = {
      from: `"${profile.fullName}" <${profile.smtpUser}>`,
      to: targetEmail,
      subject: `Postulación para ${job.title} - ${profile.fullName}`,
      text: coverLetterText,
      attachments: pdfBuffer ? [
        {
          filename: `${profile.fullName.replace(/\s+/g, '_')}_CV.pdf`,
          content: pdfBuffer
        }
      ] : []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending application email:', error.message);
    return false;
  }
}

/**
 * Sends a summary notification to the user
 */
async function sendNotificationEmail(subject, text) {
  try {
    const transporter = await getTransporter();
    const profile = await prisma.profile.findFirst();

    const mailOptions = {
      from: `"MyJobsBoard System" <${profile.smtpUser}>`,
      to: profile.email,
      subject: subject,
      text: text,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending notification email:', error.message);
    return false;
  }
}

module.exports = {
  sendApplicationEmail,
  sendNotificationEmail
};
