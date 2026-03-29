const express = require('express');
const router  = express.Router();
const { query } = require('../db/connection');
const { asyncHandler } = require('../middleware/errorHandler');

const getGuestId = (req) => req.headers['x-guest-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// GET /api/addresses
router.get('/', asyncHandler(async (req, res) => {
  const userId = getGuestId(req);
  const { rows } = await query(
    'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
    [userId]
  );
  res.json(rows);
}));

// POST /api/addresses
router.post('/', asyncHandler(async (req, res) => {
  const userId = getGuestId(req);
  const { name, mobile, pincode, address1, address2, state, type = 'HOME' } = req.body;

  const { rows } = await query(
    `INSERT INTO addresses (user_id, name, mobile, pincode, address1, address2, state, type)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [userId, name, mobile, pincode, address1, address2 || '', state, type]
  );
  res.status(201).json(rows[0]);
}));

// DELETE /api/addresses/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const userId = getGuestId(req);
  await query('DELETE FROM addresses WHERE id=$1 AND user_id=$2', [req.params.id, userId]);
  res.json({ success: true });
}));

module.exports = router;
