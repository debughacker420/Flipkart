const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/connection');
const { protect } = require('../middleware/authMiddleware');
const { sendVerificationOTP } = require('../utils/emailService');

const jwtSecret = process.env.JWT_SECRET || 'secret_key_flipkart';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '30d';

const createToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  avatar: user.avatar,
  createdAt: user.created_at,
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

// ── Register ─────────────────────────────────────────────────
// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const normalizedName  = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await pool.query('SELECT id, is_verified, name FROM users WHERE email = $1', [normalizedEmail]);

    if (existing.rows.length > 0) {
      const user = existing.rows[0];
      if (!user.is_verified) {
        // Account exists but unverified — resend OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await pool.query(
          'UPDATE users SET verification_otp = $1, otp_expires_at = $2 WHERE email = $3',
          [otp, expiresAt, normalizedEmail]
        );
        await sendVerificationOTP(normalizedEmail, user.name, otp);
        return res.status(200).json({
          message: 'A new OTP has been sent to your email.',
          email: normalizedEmail,
          requiresVerification: true,
        });
      }
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp       = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, is_verified, verification_otp, otp_expires_at)
       VALUES ($1, $2, $3, $4, false, $5, $6)`,
      [normalizedName, normalizedEmail, hashedPassword, phone?.trim() || null, otp, expiresAt]
    );

    await sendVerificationOTP(normalizedEmail, normalizedName, otp);

    res.status(201).json({
      message: 'Account created! Check your email for the 6-digit OTP.',
      email: normalizedEmail,
      requiresVerification: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Verify OTP ───────────────────────────────────────────────
// @route POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Account not found' });
    }
    if (user.is_verified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    if (user.verification_otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }
    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const updated = await pool.query(
      `UPDATE users
       SET is_verified = true, verification_otp = NULL, otp_expires_at = NULL, updated_at = NOW()
       WHERE email = $1
       RETURNING id, name, email, role, phone, avatar, created_at`,
      [normalizedEmail]
    );

    const verifiedUser = updated.rows[0];
    res.json({
      user: sanitizeUser(verifiedUser),
      token: createToken(verifiedUser),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Resend OTP ───────────────────────────────────────────────
// @route POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const normalizedEmail = email?.trim().toLowerCase();
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    const user = result.rows[0];

    if (!user)           return res.status(404).json({ message: 'Account not found' });
    if (user.is_verified) return res.status(400).json({ message: 'Email is already verified' });

    const otp       = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      'UPDATE users SET verification_otp = $1, otp_expires_at = $2 WHERE email = $3',
      [otp, expiresAt, normalizedEmail]
    );
    await sendVerificationOTP(normalizedEmail, user.name, otp);

    res.json({ message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Login ────────────────────────────────────────────────────
// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    const user = result.rows[0];

    if (!user || !user.is_active || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.is_verified) {
      // Resend OTP so they can verify
      const otp       = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await pool.query(
        'UPDATE users SET verification_otp = $1, otp_expires_at = $2 WHERE email = $3',
        [otp, expiresAt, normalizedEmail]
      );
      await sendVerificationOTP(normalizedEmail, user.name, otp);
      return res.status(403).json({
        message: 'Please verify your email. A new OTP has been sent to your inbox.',
        requiresVerification: true,
        email: normalizedEmail,
      });
    }

    res.json({ user: sanitizeUser(user), token: createToken(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Profile ──────────────────────────────────────────────────
// @route GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  try {
    res.json(sanitizeUser(req.user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
