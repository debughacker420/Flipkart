const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const { getReviews, addReview } = require('../controllers/reviewController');

router.get('/:productId', getReviews);
router.post('/:productId', optionalAuth, addReview);

module.exports = router;
