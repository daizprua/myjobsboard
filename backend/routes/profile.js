const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

// Get Profile
router.get('/', async (req, res) => {
  try {
    const profile = await prisma.profile.findFirst();
    res.json(profile || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile
router.put('/', async (req, res) => {
  try {
    let profile = await prisma.profile.findFirst();
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get public profile by slug (for public CV)
router.get('/public/:slug', async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { publicSlug: req.params.slug },
      include: { projects: true }
    });
    if (!profile || !profile.publicActive) return res.status(404).json({ error: "Not found" });
    
    // Remove sensitive data
    delete profile.smtpHost;
    delete profile.smtpPort;
    delete profile.smtpUser;
    delete profile.smtpPass;
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Projects CRUD
router.get('/projects', async (req, res) => {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return res.json([]);
    const projects = await prisma.project.findMany({ where: { profileId: profile.id }});
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const profile = await prisma.profile.findFirst();
    const project = await prisma.project.create({
      data: { ...req.body, profileId: profile.id }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Photo Upload & PDF Resume Generation
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Endpoint to upload profile photo
router.post('/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }
    const profile = await prisma.profile.findFirst();
    if (!profile) {
      return res.status(404).json({ error: 'Perfil no encontrado.' });
    }
    
    // Save relative URL path
    const avatarUrl = `/uploads/${req.file.filename}`;
    const updated = await prisma.profile.update({
      where: { id: profile.id },
      data: { avatarUrl }
    });
    
    res.json({ success: true, avatarUrl: updated.avatarUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { generatePDF } = require('../services/pdfGenerator');

// Endpoint to generate beautiful styled PDF resume
router.get('/pdf', async (req, res) => {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) {
      return res.status(404).send('Perfil no encontrado. Por favor crea uno primero.');
    }

    const lang = req.query.lang || 'es';
    const pdfBuffer = await generatePDF(profile, lang);

    res.contentType("application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${profile.fullName.replace(/\s+/g, '_')}_CV.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Error al generar PDF:", error);
    res.status(500).send("Error interno al generar el PDF: " + error.message);
  }
});

module.exports = router;
