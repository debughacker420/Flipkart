const express = require('express');
const router  = express.Router();
const { query } = require('../db/connection');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/categories
router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM categories ORDER BY title ASC');
  res.json(rows);
}));

module.exports = router;
