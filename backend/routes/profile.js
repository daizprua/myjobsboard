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

// Sync to LinkedIn directly using Puppeteer
const { updateLinkedInProfile, importLinkedInProfile } = require('../services/linkedin');

router.post('/linkedin/sync', async (req, res) => {
  const { headline, summary } = req.body;
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile || !profile.linkedinCookie) {
      return res.status(400).json({ error: "Por favor guarda tu cookie de sesión 'li_at' primero en tu perfil." });
    }

    const result = await updateLinkedInProfile(profile.linkedinCookie, headline, summary);
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/linkedin/import', async (req, res) => {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile || !profile.linkedinCookie) {
      return res.status(400).json({ error: "Por favor guarda tu cookie de sesión 'li_at' primero." });
    }

    const result = await importLinkedInProfile(profile.linkedinCookie);
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // Update database directly with what we imported if we want, or just return to UI
    if (result.data.fullName) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { 
          fullName: result.data.fullName,
          experience: result.data.summary ? result.data.summary : profile.experience
        }
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
