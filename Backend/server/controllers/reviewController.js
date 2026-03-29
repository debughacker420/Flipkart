const { query } = require('../db/connection');
const { getEffectiveUserId } = require('../middleware/authMiddleware');

// GET /api/reviews/:productId
const getReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rows } = await query(
      `SELECT
         r.id,
         r.rating,
         r.title,
         r.body,
         r.images,
         r.helpful_count,
         r.created_at,
         u.name  AS user_name,
         u.avatar AS user_avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );
    res.json(rows.map(r => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      images: r.images || [],
      helpfulCount: r.helpful_count,
      createdAt: r.created_at,
      userName: r.user_name,
      userAvatar: r.user_avatar,
    })));
  } catch (err) {
    next(err);
  }
};

// POST /api/reviews/:productId
const addReview = async (req, res, next) => {
  try {
    const userId = getEffectiveUserId(req);
    const { productId } = req.params;
    const { rating, title, body, images = [] } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Limit images array to 3 items and each image to ~2MB base64
    const safeImages = images.slice(0, 3).map(img => {
      if (typeof img === 'string' && img.length > 2_000_000) return null;
      return img;
    }).filter(Boolean);

    const { rows } = await query(
      `INSERT INTO reviews (product_id, user_id, rating, title, body, images)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (product_id, user_id)
       DO UPDATE SET rating = $3, title = $4, body = $5, images = $6, updated_at = NOW()
       RETURNING id`,
      [productId, userId, rating, title || null, body || null, safeImages]
    );

    // Update product average rating
    await query(
      `UPDATE products SET
         rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE product_id = $1),
         reviews_count = (SELECT COUNT(*) FROM reviews WHERE product_id = $1)
       WHERE id = $1`,
      [productId]
    );

    res.status(201).json({ id: rows[0].id, message: 'Review submitted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getReviews, addReview };
