const { query } = require('../db/connection');
const { getEffectiveUserId } = require('../middleware/authMiddleware');

// GET /api/wishlist
const getWishlist = async (req, res, next) => {
  try {
    const userId = getEffectiveUserId(req);
    const { rows } = await query(
      `SELECT
         w.id,
         w.product_id,
         w.created_at,
         p.title,
         p.price,
         p.mrp,
         p.brand,
         p.rating,
         p.reviews_count,
         p.stock,
         pi.url AS image
       FROM wishlists w
       JOIN products p ON w.product_id = p.id AND p.is_active = true
       LEFT JOIN LATERAL (
         SELECT url FROM product_images
         WHERE product_id = p.id
         ORDER BY is_primary DESC, sort_order ASC
         LIMIT 1
       ) pi ON true
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );
    res.json(rows.map(r => ({
      id: r.id,
      productId: r.product_id,
      addedAt: r.created_at,
      title: r.title,
      price: Number(r.price),
      mrp: r.mrp ? Number(r.mrp) : null,
      brand: r.brand,
      rating: Number(r.rating),
      reviewsCount: r.reviews_count,
      stock: r.stock,
      image: r.image,
    })));
  } catch (err) {
    next(err);
  }
};

// POST /api/wishlist
const addToWishlist = async (req, res, next) => {
  try {
    const userId = getEffectiveUserId(req);
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required' });

    await query(
      `INSERT INTO wishlists (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [userId, productId]
    );
    res.status(201).json({ message: 'Added to wishlist' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/wishlist/:productId
const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = getEffectiveUserId(req);
    const { productId } = req.params;
    await query(
      `DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2`,
      [userId, productId]
    );
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
