const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');

router.get('/', optionalAuth, getWishlist);
router.post('/', optionalAuth, addToWishlist);
router.delete('/:productId', optionalAuth, removeFromWishlist);

module.exports = router;
