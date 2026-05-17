const express = require('express');
const prisma = require('../prisma');
const { runScraper } = require('../services/scraper');
const router = express.Router();

// Get all scraped jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { datePosted: 'desc' },
      take: 200 // Limit to avoid massive payload
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger scraper manually
router.post('/scrape', async (req, res) => {
  try {
    runScraper(); // Run asynchronously without blocking
    res.json({ success: true, message: "Scraper started in background" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kanban Applications
router.get('/applications', async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      include: { job: true },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/applications', async (req, res) => {
  const { jobId, status } = req.body;
  try {
    const existing = await prisma.application.findFirst({ where: { jobId } });
    if (existing) return res.status(400).json({ error: "Application already exists for this job" });

    const application = await prisma.application.create({
      data: { jobId, status: status || 'SAVED' },
      include: { job: true }
    });
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/applications/:id', async (req, res) => {
  try {
    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: req.body,
      include: { job: true }
    });
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/applications/:id', async (req, res) => {
  try {
    await prisma.application.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
