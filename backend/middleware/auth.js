const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'kirana_smart_khaata_secure_jwt_secret_key_2026';

const authMiddleware = (req, res, next) => {
  let token = req.header('Authorization') || req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Handle 'Bearer <token>' or raw token cleanly
  if (token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains userId / id
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
