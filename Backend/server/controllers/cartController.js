const { query } = require('../db/connection');
const { getEffectiveUserId } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────────────────────
// Helper: build the full cart response object
// ─────────────────────────────────────────────────────────────
async function buildCartResponse(userId) {
  const { rows } = await query(
    `SELECT
       ci.id           AS cart_item_id,
       ci.quantity,
       ci.created_at,
       p.id            AS product_id,
       p.title,
       p.price,
       p.mrp,
       p.brand,
       p.stock,
       p.rating,
       p.reviews_count,
       pi.url          AS image
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     LEFT JOIN LATERAL (
       SELECT url
       FROM product_images
       WHERE product_id = p.id
       ORDER BY is_primary DESC, sort_order ASC
       LIMIT 1
     ) pi ON true
     WHERE ci.user_id = $1
     ORDER BY ci.created_at DESC`,
    [userId]
  );

  const items = rows.map(r => ({
    id:           r.cart_item_id,
    productId:    r.product_id,
    title:        r.title,
    image:        r.image,
    price:        Number(r.price),
    mrp:          r.mrp ? Number(r.mrp) : Number(r.price),
    brand:        r.brand,
    stock:        r.stock,
    rating:       Number(r.rating),
    reviewsCount: r.reviews_count,
    quantity:     r.quantity,
  }));

  const totalAmount   = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalMRP      = items.reduce((s, i) => s + i.mrp * i.quantity, 0);
  const totalDiscount = totalMRP - totalAmount;
  const itemCount     = items.reduce((s, i) => s + i.quantity, 0);

  return { items, totalAmount, totalMRP, totalDiscount, itemCount };
}

// ─────────────────────────────────────────────────────────────
// GET /api/cart
// ─────────────────────────────────────────────────────────────
const getCart = async (req, res, next) => {
  try {
    const cart = await buildCartResponse(getEffectiveUserId(req));
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/cart
// ─────────────────────────────────────────────────────────────
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = getEffectiveUserId(req);

    // Validate input
    if (!productId) {
      return res.status(400).json({
        status: 'error',
        message: 'productId is required',
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'quantity must be an integer >= 1',
      });
    }

    // Check product exists and is active
    const { rows: prodRows } = await query(
      'SELECT id, title, stock FROM products WHERE id = $1 AND is_active = true',
      [productId]
    );

    if (!prodRows.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found or is inactive',
      });
    }

    const product = prodRows[0];

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        status: 'error',
        message: `Insufficient stock. Only ${product.stock} units available for "${product.title}"`,
      });
    }

    // Insert or increment quantity
    await query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET
         quantity   = cart_items.quantity + $3,
         updated_at = NOW()`,
      [userId, productId, quantity]
    );

    // Verify final quantity doesn't exceed stock
    const { rows: cartRows } = await query(
      `SELECT ci.quantity, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1 AND ci.product_id = $2`,
      [userId, productId]
    );

    if (cartRows.length && cartRows[0].quantity > cartRows[0].stock) {
      // Cap at stock level
      await query(
        `UPDATE cart_items
         SET quantity = $1, updated_at = NOW()
         WHERE user_id = $2 AND product_id = $3`,
        [cartRows[0].stock, userId, productId]
      );
    }

    // Return full updated cart
    const cart = await buildCartResponse(userId);
    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/cart/:id   (id = cart_item_id)
// ─────────────────────────────────────────────────────────────
const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = getEffectiveUserId(req);

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'quantity must be an integer >= 1',
      });
    }

    // Verify item exists and belongs to default user
    const { rows: itemRows } = await query(
      `SELECT ci.id, ci.product_id, p.stock, p.title
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = $1 AND ci.user_id = $2`,
      [id, userId]
    );

    if (!itemRows.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart item not found',
      });
    }

    const item = itemRows[0];

    // Check stock for new quantity
    if (quantity > item.stock) {
      return res.status(400).json({
        status: 'error',
        message: `Insufficient stock. Only ${item.stock} units available for "${item.title}"`,
      });
    }

    // Update
    await query(
      `UPDATE cart_items
       SET quantity = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3`,
      [quantity, id, userId]
    );

    // Return full updated cart
    const cart = await buildCartResponse(userId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/cart/:id   (id = cart_item_id)
// ─────────────────────────────────────────────────────────────
const removeCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = getEffectiveUserId(req);

    // Verify item belongs to default user
    const { rows } = await query(
      'SELECT id FROM cart_items WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart item not found',
      });
    }

    await query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({
      status: 'success',
      message: 'Item removed from cart',
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/cart   (clear entire cart)
// ─────────────────────────────────────────────────────────────
const clearCart = async (req, res, next) => {
  try {
    const userId = getEffectiveUserId(req);
    await query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [userId]
    );

    res.json({
      status: 'success',
      message: 'Cart cleared successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
