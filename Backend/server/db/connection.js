const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Add email verification columns if they don't exist yet
const migrateVerification = async () => {
  try {
    await pool.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS is_verified    BOOLEAN      NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS verification_otp VARCHAR(10),
        ADD COLUMN IF NOT EXISTS otp_expires_at  TIMESTAMPTZ
    `);
    console.log('✅ Verification columns ready');
  } catch (err) {
    console.error('⚠️  Verification migration warning:', err.message);
  }
};

testConnection().then(migrateVerification);

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
