const express = require('express');
const { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');
const prisma = require('../prisma');

const router = express.Router();

// In a real app, RP_ID should be the domain, e.g. "myjobsboard.com"
const RP_NAME = 'MyJobsBoard';
// Dynamic helpers for domain and origin detection
const getRpId = (req) => {
  const host = req.get('host') || '';
  return host.split(':')[0] || 'localhost';
};

const getOrigin = (req) => {
  const origin = req.get('origin');
  if (origin) return origin.replace(/\/$/, "");
  
  const referer = req.get('referer');
  if (referer) {
    return referer.replace(/\/$/, "");
  }
  
  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  return `${protocol}://${req.get('host')}`.replace(/\/$/, "");
};

// We need a temporary place to store challenge during registration/authentication
// In production, use Redis or DB. For simplicity here:
const userChallenges = {};

// 1. Generate Registration Options
router.post('/generate-registration', async (req, res) => {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) return res.status(400).json({ error: "Profile not found" });

    const rpId = getRpId(req);

    // Generate options
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: rpId,
      userID: profile.id,
      userName: profile.email,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred', // Triggers FaceID / TouchID
      },
    });

    userChallenges[profile.id] = options.challenge;
    res.json(options);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Verify Registration
router.post('/verify-registration', async (req, res) => {
  try {
    const profile = await prisma.profile.findFirst();
    const expectedChallenge = userChallenges[profile.id];
    
    const rpId = getRpId(req);
    const origin = getOrigin(req);

    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
    });

    if (verification.verified) {
      const { registrationInfo } = verification;
      
      // Save authenticator to DB
      await prisma.authenticator.create({
        data: {
          credentialID: Buffer.from(registrationInfo.credentialID).toString('base64url'),
          publicKey: Buffer.from(registrationInfo.credentialPublicKey).toString('base64url'),
          counter: registrationInfo.counter,
          profileId: profile.id
        }
      });
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Generate Authentication Options
router.post('/generate-authentication', async (req, res) => {
  try {
    const profile = await prisma.profile.findFirst();
    const authenticators = await prisma.authenticator.findMany({ where: { profileId: profile.id } });

    if (authenticators.length === 0) {
      return res.status(400).json({ error: "No authenticators registered." });
    }

    const rpId = getRpId(req);

    const options = await generateAuthenticationOptions({
      rpID: rpId,
      allowCredentials: authenticators.map(auth => ({
        id: Buffer.from(auth.credentialID, 'base64url'),
        type: 'public-key',
      })),
      userVerification: 'preferred',
    });

    userChallenges[profile.id] = options.challenge;
    res.json(options);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Verify Authentication
router.post('/verify-authentication', async (req, res) => {
  try {
    const profile = await prisma.profile.findFirst();
    const expectedChallenge = userChallenges[profile.id];
    
    // Find the authenticator in the DB
    const bodyCredID = req.body.id;
    const authenticator = await prisma.authenticator.findUnique({
      where: { credentialID: bodyCredID }
    });

    if (!authenticator) return res.status(400).json({ error: "Authenticator not found" });

    const rpId = getRpId(req);
    const origin = getOrigin(req);

    const verification = await verifyAuthenticationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
      authenticator: {
        credentialID: Buffer.from(authenticator.credentialID, 'base64url'),
        credentialPublicKey: Buffer.from(authenticator.publicKey, 'base64url'),
        counter: authenticator.counter,
      },
    });

    if (verification.verified) {
      // Update counter
      await prisma.authenticator.update({
        where: { id: authenticator.id },
        data: { counter: verification.authenticationInfo.newCounter }
      });
      res.json({ verified: true, profileId: profile.id });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
