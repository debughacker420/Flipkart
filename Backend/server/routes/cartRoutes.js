const express = require('express');
const router  = express.Router();
const { optionalAuth } = require('../middleware/authMiddleware');

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');

router.use(optionalAuth);

// GET    /api/cart       → full cart with totals
router.get('/', getCart);

// POST   /api/cart       → add item to cart
router.post('/', addToCart);

// PUT    /api/cart/:id   → update item quantity
router.put('/:id', updateCartItem);

// DELETE /api/cart/:id   → remove single item
router.delete('/:id', removeCartItem);

// DELETE /api/cart       → clear entire cart
router.delete('/', clearCart);

module.exports = router;
