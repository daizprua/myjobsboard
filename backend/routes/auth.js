const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

// For local single-user system, we create a generic login mechanism
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const profile = await prisma.profile.findFirst({ where: { email } });
    if (!profile) {
      // Create initial admin profile if db is totally empty
      const totalProfiles = await prisma.profile.count();
      if (totalProfiles === 0) {
        const newProfile = await prisma.profile.create({
          data: {
            fullName: "Fullstack Developer",
            email: email,
            bio: "Welcome to MyJobsBoard",
            skills: "React, Node.js, TypeScript",
            publicSlug: "developer"
          }
        });
        return res.json({ success: true, profile: newProfile });
      }
      return res.status(401).json({ error: "Invalid credentials." });
    }
    
    // In a production local app for a single user, you might want to check a hashed password.
    // For this local deploy, if the email matches the primary profile, we let them in.
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
