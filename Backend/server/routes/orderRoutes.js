const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  placeOrder,
  getOrders,
  getOrderById,
} = require('../controllers/orderController');

router.use(protect);

// POST /api/orders      → place a new order
router.post('/', placeOrder);

// GET  /api/orders      → list all orders
router.get('/', getOrders);

// GET  /api/orders/:id  → single order detail
router.get('/:id', getOrderById);

module.exports = router;
