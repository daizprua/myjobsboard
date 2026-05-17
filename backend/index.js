const express = require('express');
const cors = require('cors');
const prisma = require('./prisma');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const jobsRoutes = require('./routes/jobs');
const aiRoutes = require('./routes/ai');
const webauthnRoutes = require('./routes/webauthn');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/webauthn', webauthnRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MyJobsBoard API is running' });
});

const path = require('path');

// Serve static uploads (for profile photo and generated PDFs if needed)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static screenshots for automated job applications
app.use('/screenshots', express.static(path.join(__dirname, '../screenshots')));

// Serve frontend static files in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
