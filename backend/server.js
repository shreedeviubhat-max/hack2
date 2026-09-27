const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
}

// Middleware
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

// Start listener for Render and local development
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;