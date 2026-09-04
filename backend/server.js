const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (Mount on both paths to guarantee matching via Vercel rewrites)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

// Test route
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Start listener for local development only
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

module.exports = app;