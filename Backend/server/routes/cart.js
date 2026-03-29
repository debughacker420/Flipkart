const express = require('express');
const router  = express.Router();
const { query } = require('../db/connection');
const { asyncHandler } = require('../middleware/errorHandler');

// Guest-session identity (replace with JWT middleware when auth is added)
const getGuestId = (req) => req.headers['x-guest-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// Helper: build the full cart response for a user
async function buildCart(userId) {
  const { rows } = await query(
    `SELECT
       ci.id        AS cart_item_id,
       ci.quantity,
       p.id         AS product_id,
       p.title,
       p.price,
       p.mrp,
       p.brand,
       p.stock,
       pi_img.url   AS image
     FROM cart_items ci
     JOIN products   p     ON ci.product_id = p.id
     LEFT JOIN LATERAL (
       SELECT url FROM product_images
       WHERE product_id = p.id
       ORDER BY is_primary DESC, sort_order ASC
       LIMIT 1
     ) pi_img ON true
     WHERE ci.user_id = $1`,
    [userId]
  );

  const items = rows.map(r => ({
    id:         r.product_id,
    cartItemId: r.cart_item_id,
    title:      r.title,
    image:      r.image,
    price:      Number(r.price),
    mrp:        r.mrp ? Number(r.mrp) : null,
    brand:      r.brand,
    stock:      r.stock,
    qty:        r.quantity,
  }));

  const totalQuantity = items.reduce((s, i) => s + i.qty, 0);
  const totalAmount   = items.reduce((s, i) => s + i.price * i.qty, 0);

  return { items, totalQuantity, totalAmount };
}

// GET /api/cart
router.get('/', asyncHandler(async (req, res) => {
  const userId = getGuestId(req);
  res.json(await buildCart(userId));
}));

// POST /api/cart  — add / increment item
router.post('/', asyncHandler(async (req, res) => {
  const userId = getGuestId(req);
  const { productId, qty = 1 } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('productId is required');
  }

  // Verify product exists and has stock
  const { rows: prodRows } = await query(
    'SELECT id, stock FROM products WHERE id = $1 AND is_active = true',
    [productId]
  );
  if (!prodRows.length) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (prodRows[0].stock < 1) {
    res.status(400);
    throw new Error('Product is out of stock');
  }

  await query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, product_id)
     DO UPDATE SET
       quantity   = LEAST(cart_items.quantity + $3, 10),
       updated_at = NOW()`,
    [userId, productId, qty]
  );

  res.json(await buildCart(userId));
}));

// PUT /api/cart/:productId  — set absolute quantity
router.put('/:productId', asyncHandler(async (req, res) => {
  const userId = getGuestId(req);
  const { qty } = req.body;

  if (!qty || qty < 1) {
    res.status(400);
    throw new Error('qty must be >= 1. Use DELETE to remove an item.');
  }

  await query(
    `UPDATE cart_items
     SET quantity = LEAST($1, 10), updated_at = NOW()
     WHERE user_id = $2 AND product_id = $3`,
    [qty, userId, req.params.productId]
  );

  res.json(await buildCart(userId));
}));

// DELETE /api/cart/:productId
router.delete('/:productId', asyncHandler(async (req, res) => {
  const userId = getGuestId(req);
  await query(
    'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
    [userId, req.params.productId]
  );
  res.json(await buildCart(userId));
}));

// DELETE /api/cart  — clear entire cart
router.delete('/', asyncHandler(async (req, res) => {
  const userId = getGuestId(req);
  await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
  res.json({ items: [], totalQuantity: 0, totalAmount: 0 });
}));

module.exports = router;
