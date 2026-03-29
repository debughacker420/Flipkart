const express = require('express');
const router  = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');

// GET    /api/cart       → full cart with totals (optional auth — returns empty cart for guests)
router.get('/', optionalAuth, getCart);

// POST   /api/cart       → add item to cart (requires login)
router.post('/', protect, addToCart);

// PUT    /api/cart/:id   → update item quantity (requires login)
router.put('/:id', protect, updateCartItem);

// DELETE /api/cart/:id   → remove single item (requires login)
router.delete('/:id', protect, removeCartItem);

// DELETE /api/cart       → clear entire cart (requires login)
router.delete('/', protect, clearCart);

module.exports = router;
