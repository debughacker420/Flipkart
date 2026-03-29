// Force rebuild - 2026-03-29 20:43
// FORCE REDEPLOY Backend - 2026-03-29 20:45
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

require('./db/connection'); // Test connection on startup
const { query } = require('./db/connection');
const { errorHandler } = require('./middleware/errorHandler');

// ── Self-Healing Database Fix ───────────────────────────────
// Removes FK constraints to allow unique guest carts
const fixDatabaseConstraints = async () => {
  try {
    console.log('⚙️ Checking database constraints...');
    await query('ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey');
    await query('ALTER TABLE wishlists DROP CONSTRAINT IF EXISTS wishlists_user_id_fkey');
    console.log('✅ Database constraints optimized for guest carts');
  } catch (err) {
    console.warn('⚠️ Could not auto-optimize constraints (might already be fixed):', err.message);
  }
};
fixDatabaseConstraints();

// Route modules
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require('./routes/addressRoutes');
const authRoutes = require('./routes/auth');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
// app.use(morgan('dev')); // Disabled to stop spamming API logs during deployment
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'success', message: 'API is running' })
);

// ── API Routes ──────────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ status: 'error', message: `Not Found — ${req.originalUrl}` })
);

// ── Global Error Handler ────────────────────────────────────
app.use(errorHandler);

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
