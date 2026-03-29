const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  getAddresses,
  addAddress,
} = require('../controllers/addressController');

router.use(protect);

// GET  /api/addresses  → list all addresses
router.get('/', getAddresses);

// POST /api/addresses  → create new address
router.post('/', addAddress);

module.exports = router;
