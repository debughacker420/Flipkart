/**
 * Migration: Remove Foreign Key constraints for guest carts/wishlists
 * Runs the required ALTER TABLE commands without wiping existing data.
 * Usage: node server/db/fix-cart-fk.js
 */
require('dotenv').config();
const { pool } = require('./connection');

async function fixConstraints() {
  const client = await pool.connect();
  try {
    console.log('⚙️  Fixing cart and wishlist constraints...');

    // 1. Drop existing FK for cart_items
    await client.query(`
      ALTER TABLE cart_items 
      DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;
    `);

    // 2. Drop existing FK for wishlists
    await client.query(`
      ALTER TABLE wishlists 
      DROP CONSTRAINT IF EXISTS wishlists_user_id_fkey;
    `);

    console.log('✅ Success: Guest carts and wishlists are now isolated per session.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

fixConstraints();
