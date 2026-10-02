const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const connectToDatabase = require('./db');

// Connect to MongoDB eagerly on startup
connectToDatabase().catch((err) => console.error('Initial DB connection error:', err));

// CORS configuration (allow requests from Vercel frontend or any origin)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Body parsers with 10mb limit for receipts, invoices, or OCR data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root health check route (Critical for Render deployment verification)
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Kirana Smart Khaata Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API status route
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'connecting/disconnected'
  });
});

// Ensure Database connection for data routes
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Database connection error during request:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes (Mount on both /api/* and root paths for maximum flexibility)
const authRoutes = require('./routes/auth');
const borrowerRoutes = require('./routes/borrowers');
const supplierRoutes = require('./routes/suppliers');

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/borrowers', borrowerRoutes);
app.use('/borrowers', borrowerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/suppliers', supplierRoutes);

// Start listener for Render and local development (omit in Vercel serverless context)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;