const jwt = require('jsonwebtoken');
const { query } = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_flipkart';

const extractToken = (authorizationHeader = '') => {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.split(' ')[1];
};

const loadUserFromToken = async (token) => {
  const decoded = jwt.verify(token, JWT_SECRET);

  const { rows } = await query(
    `SELECT id, name, email, role, phone, avatar, is_active, created_at
     FROM users
     WHERE id = $1`,
    [decoded.id]
  );

  const user = rows[0];

  if (!user || !user.is_active) {
    throw new Error('User account is unavailable');
  }

  return user;
};

const optionalAuth = async (req, _res, next) => {
  const token = extractToken(req.headers.authorization || '');

  if (!token) {
    return next();
  }

  try {
    req.user = await loadUserFromToken(token);
    return next();
  } catch (error) {
    console.error(error);
    req.user = null;
    return next();
  }
};

const protect = async (req, res, next) => {
  const token = extractToken(req.headers.authorization || '');

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    req.user = await loadUserFromToken(token);
    return next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const getEffectiveUserId = (req) => req.user?.id || process.env.DEFAULT_USER_ID;

module.exports = { protect, optionalAuth, getEffectiveUserId };
