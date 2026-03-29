const express = require('express');
const router  = express.Router();
const { pool, query } = require('../db/connection');
const { asyncHandler } = require('../middleware/errorHandler');

const getGuestId = (req) => req.headers['x-guest-id'] || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// GET /api/orders
router.get('/', asyncHandler(async (req, res) => {
  const userId = getGuestId(req);

  const { rows: orders } = await query(
    `SELECT o.id, o.status, o.payment_method, o.payment_status,
            o.total_amount, o.placed_at, o.delivered_at,
            a.name, a.address1, a.state, a.pincode
     FROM orders o
     LEFT JOIN addresses a ON o.address_id = a.id
     WHERE o.user_id = $1
     ORDER BY o.placed_at DESC`,
    [userId]
  );

  // Attach first item image for listing thumbnail
  const orderIds = orders.map(o => o.id);
  let itemsMap = {};
  if (orderIds.length) {
    const { rows: items } = await query(
      `SELECT order_id, title, image, quantity, unit_price
       FROM order_items WHERE order_id = ANY($1::uuid[])`,
      [orderIds]
    );
    for (const item of items) {
      if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
      itemsMap[item.order_id].push(item);
    }
  }

  res.json(orders.map(o => ({ ...o, items: itemsMap[o.id] || [] })));
}));

// GET /api/orders/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const { rows: orderRows } = await query(
    `SELECT o.*,
            a.name, a.mobile, a.address1, a.address2,
            a.city, a.state, a.pincode, a.type AS address_type
     FROM orders o
     LEFT JOIN addresses a ON o.address_id = a.id
     WHERE o.id = $1`,
    [req.params.id]
  );

  if (!orderRows.length) {
    res.status(404);
    throw new Error('Order not found');
  }

  const { rows: items } = await query(
    'SELECT * FROM order_items WHERE order_id = $1',
    [req.params.id]
  );

  res.json({ ...orderRows[0], items });
}));

// POST /api/orders  — place order (transactional)
router.post('/', asyncHandler(async (req, res) => {
  const userId = getGuestId(req);
  const { addressId, paymentMethod = 'COD' } = req.body;

  if (!addressId) {
    res.status(400);
    throw new Error('addressId is required');
  }

  // Fetch cart with primary image via LATERAL join
  const { rows: cartRows } = await query(
    `SELECT
       ci.quantity,
       p.id    AS product_id,
       p.title,
       p.brand,
       p.sku,
       p.price,
       p.mrp,
       p.stock,
       pi_img.url AS image
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     LEFT JOIN LATERAL (
       SELECT url FROM product_images
       WHERE product_id = p.id
       ORDER BY is_primary DESC, sort_order ASC
       LIMIT 1
     ) pi_img ON true
     WHERE ci.user_id = $1`,
    [userId]
  );

  if (!cartRows.length) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  // Check stock availability for all items
  for (const item of cartRows) {
    if (item.stock < item.quantity) {
      res.status(400);
      throw new Error(`"${item.title}" only has ${item.stock} units in stock`);
    }
  }

  const subtotal     = cartRows.reduce((s, r) => s + Number(r.price) * r.quantity, 0);
  const deliveryCharge = subtotal >= 499 ? 0 : 40;
  const totalAmount  = subtotal + deliveryCharge;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create the order
    const { rows: [order] } = await client.query(
      `INSERT INTO orders
         (user_id, address_id, status, payment_method, payment_status,
          subtotal, delivery_charge, total_amount)
       VALUES ($1,$2,'placed',$3,'pending',$4,$5,$6)
       RETURNING *`,
      [userId, addressId, paymentMethod, subtotal, deliveryCharge, totalAmount]
    );

    // Snapshot each item into order_items
    for (const item of cartRows) {
      await client.query(
        `INSERT INTO order_items
           (order_id, product_id, title, image, brand, sku,
            quantity, unit_price, unit_mrp)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          order.id, item.product_id, item.title, item.image,
          item.brand, item.sku, item.quantity,
          Number(item.price), item.mrp ? Number(item.mrp) : null,
        ]
      );

      // Decrement stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Clear the cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    await client.query('COMMIT');

    // Return order + items
    const { rows: orderItems } = await client.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );
    res.status(201).json({ ...order, items: orderItems });

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

module.exports = router;
