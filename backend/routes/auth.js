const express = require('express');
const prisma = require('../prisma');
const { hashPassword, verifyPassword } = require('../utils/hash');
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
            passwordHash: hashPassword(password || "admin123"),
            bio: "Welcome to MyJobsBoard",
            skills: "React, Node.js, TypeScript",
            publicSlug: "developer"
          }
        });
        return res.json({ success: true, profile: newProfile });
      }
      return res.status(401).json({ error: "Invalid credentials." });
    }
    
    // Verify hashed password securely
    if (profile.passwordHash) {
      const isValid = verifyPassword(password || '', profile.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials." });
      }
    } else {
      // Automatic migration: if legacy user without password hash, store this password
      await prisma.profile.update({
        where: { id: profile.id },
        data: { passwordHash: hashPassword(password || "admin123") }
      });
    }
    
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change password endpoint
router.post('/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return res.status(404).json({ error: "Profile not found." });

    if (profile.passwordHash) {
      const isValid = verifyPassword(currentPassword || '', profile.passwordHash);
      if (!isValid) {
        return res.status(400).json({ error: "Incorrect current password." });
      }
    }

    await prisma.profile.update({
      where: { id: profile.id },
      data: { passwordHash: hashPassword(newPassword) }
    });

    res.json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
