const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

const connectToDatabase = require('./db');

// Connect to MongoDB eagerly if URI is available
connectToDatabase().catch((err) => console.error('Initial DB connection error:', err));

// Middleware
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});
app.use(cors());
app.use(express.json());

// Routes (Mount on both paths for flexibility)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

// Test route
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Start listener for Render and local development (omit on Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;