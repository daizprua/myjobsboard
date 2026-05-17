const express = require('express');
const prisma = require('../prisma');
const { calculateMatchScore, generateCoverLetter, optimizeLinkedIn } = require('../services/openrouter');
const { autoFillApplication } = require('../services/puppeteer');
const { sendApplicationEmail } = require('../services/mail');

const router = express.Router();

// Get Match Score for a job
router.post('/match-score', async (req, res) => {
  const { jobId } = req.body;
  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    const profile = await prisma.profile.findFirst();
    if (!job || !profile) return res.status(404).json({ error: "Job or Profile not found" });

    // In a real app, you might want to cache this in the DB to save API calls
    if (job.matchScore) {
      return res.json({ score: job.matchScore, reason: "Cached from previous check" });
    }

    const result = await calculateMatchScore(job.description, profile.skills + "\n" + profile.experience);
    
    // Save the score back to the job so we don't recalculate
    if (result && result.score) {
      await prisma.job.update({
        where: { id: job.id },
        data: { matchScore: result.score }
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate Cover Letter
router.post('/cover-letter', async (req, res) => {
  const { jobId } = req.body;
  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    const profile = await prisma.profile.findFirst();
    if (!job || !profile) return res.status(404).json({ error: "Job or Profile not found" });

    const letter = await generateCoverLetter(job, profile);
    res.json({ text: letter });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Optimize LinkedIn
router.post('/linkedin-optimize', async (req, res) => {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const recommendations = await optimizeLinkedIn(profile);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger Puppeteer Auto-Apply
router.post('/auto-apply', async (req, res) => {
  const { jobId, coverLetterText } = req.body;
  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    const profile = await prisma.profile.findFirst();
    if (!job || !profile) return res.status(404).json({ error: "Job or Profile not found" });

    // If applyUrl is an email, use Nodemailer
    if (job.applyUrl.includes('@') || job.applyUrl.startsWith('mailto:')) {
      const sent = await sendApplicationEmail(job, profile, coverLetterText);
      return res.json({ success: sent, method: 'email' });
    }

    // Otherwise, try Puppeteer
    const result = await autoFillApplication(job.applyUrl, profile, coverLetterText);
    
    if (result.success) {
      // Create or update application to "APPLYING" state
      let app = await prisma.application.findFirst({ where: { jobId } });
      if (!app) {
        await prisma.application.create({
          data: { jobId, status: 'APPLYING', screenshotPath: result.screenshot }
        });
      } else {
        await prisma.application.update({
          where: { id: app.id },
          data: { status: 'APPLYING', screenshotPath: result.screenshot }
        });
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
