const { pool, query } = require('../db/connection');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

// ─────────────────────────────────────────────────────────────
// POST /api/orders — place order (full transaction)
// ─────────────────────────────────────────────────────────────
const placeOrder = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;
    const { addressId, paymentMethod = 'COD' } = req.body;

    await client.query('BEGIN');

    // ── STEP 1: Fetch cart items ─────────────────────────
    const { rows: cartItems } = await client.query(
      `SELECT
         ci.id          AS cart_item_id,
         ci.quantity,
         ci.product_id,
         p.title,
         p.price,
         p.mrp,
         p.brand,
         p.sku,
         p.stock,
         pi.url         AS image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN LATERAL (
         SELECT url FROM product_images
         WHERE product_id = p.id
         ORDER BY is_primary DESC, sort_order ASC
         LIMIT 1
       ) pi ON true
       WHERE ci.user_id = $1`,
      [userId]
    );

    if (!cartItems.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'error',
        message: 'Your cart is empty. Add items before placing an order.',
      });
    }

    // ── STEP 2: Validate stock for every item ────────────
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          status: 'error',
          message: `Insufficient stock for "${item.title}". Only ${item.stock} units available but ${item.quantity} requested.`,
          productId: item.product_id,
        });
      }
    }

    // ── STEP 3: Calculate totals ─────────────────────────
    const subtotal       = cartItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
    const totalMRP       = cartItems.reduce((s, i) => s + (i.mrp ? Number(i.mrp) : Number(i.price)) * i.quantity, 0);
    const discountAmount = totalMRP - subtotal;
    const deliveryCharge = subtotal >= 499 ? 0 : 40;
    const totalAmount    = subtotal + deliveryCharge;

    // ── STEP 4: Verify address belongs to user ───────────
    if (!addressId) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'error',
        message: 'addressId is required',
      });
    }

    const { rows: addrRows } = await client.query(
      'SELECT id FROM addresses WHERE id = $1 AND user_id = $2',
      [addressId, userId]
    );

    if (!addrRows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: 'error',
        message: 'Address not found or does not belong to your account',
      });
    }

    // ── STEP 5: Insert order ─────────────────────────────
    const { rows: [order] } = await client.query(
      `INSERT INTO orders
         (user_id, address_id, status, payment_method, payment_status,
          subtotal, discount_amount, delivery_charge, total_amount)
       VALUES ($1, $2, 'placed', $3, 'pending', $4, $5, $6, $7)
       RETURNING *`,
      [userId, addressId, paymentMethod, subtotal, discountAmount, deliveryCharge, totalAmount]
    );

    // ── STEP 6: Insert order items (snapshot) ────────────
    for (const item of cartItems) {
      await client.query(
        `INSERT INTO order_items
           (order_id, product_id, title, image, brand, sku,
            quantity, unit_price, unit_mrp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          order.id,
          item.product_id,
          item.title,
          item.image,
          item.brand,
          item.sku,
          item.quantity,
          Number(item.price),
          item.mrp ? Number(item.mrp) : null,
        ]
      );
    }

    // ── STEP 7: Reduce stock ─────────────────────────────
    for (const item of cartItems) {
      await client.query(
        'UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // ── STEP 8: Clear cart ───────────────────────────────
    await client.query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [userId]
    );

    // ── STEP 9: Commit ───────────────────────────────────
    await client.query('COMMIT');

    // ── Build response with items + address ──────────────
    const { rows: orderItems } = await query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );

    const { rows: [address] } = await query(
      `SELECT name, mobile, pincode, address1, address2,
              city, state, country, type
       FROM addresses WHERE id = $1`,
      [addressId]
    );

    const responseData = {
      id:              order.id,
      status:          order.status,
      paymentMethod:   order.payment_method,
      paymentStatus:   order.payment_status,
      subtotal:        Number(order.subtotal),
      discountAmount:  Number(order.discount_amount),
      deliveryCharge:  Number(order.delivery_charge),
      totalAmount:     Number(order.total_amount),
      placedAt:        order.placed_at,
      items: orderItems.map(i => ({
        id:         i.id,
        productId:  i.product_id,
        title:      i.title,
        image:      i.image,
        brand:      i.brand,
        quantity:   i.quantity,
        unitPrice:  Number(i.unit_price),
        unitMrp:    i.unit_mrp ? Number(i.unit_mrp) : null,
        totalPrice: Number(i.total_price),
      })),
      address,
    };

    res.status(201).json(responseData);

    // ── STEP 10: Send confirmation email (async, non-blocking) ──
    try {
      const { rows: [user] } = await query(
        'SELECT name, email FROM users WHERE id = $1',
        [userId]
      );

      if (user && user.email) {
        const emailOrder = {
          id:             order.id,
          created_at:     order.placed_at || order.created_at,
          total_amount:   Number(order.total_amount),
          payment_method: order.payment_method,
          status:         order.status,
          items: orderItems.map(i => ({
            name:     i.title,
            quantity: i.quantity,
            price:    Number(i.unit_price),
            total:    Number(i.total_price),
            image:    i.image || '',
          })),
          address: {
            full_name: address?.name || user.name,
            phone:     address?.mobile || '',
            address1:  address?.address1 || '',
            address2:  address?.address2 || '',
            city:      address?.city || '',
            state:     address?.state || '',
            pincode:   address?.pincode || '',
            type:      (address?.type || 'HOME').toUpperCase(),
          },
        };

        sendOrderConfirmationEmail(user.email, user.name, emailOrder)
          .then(result => {
            if (result.success) {
              console.log(`📧 Confirmation email sent for order ${order.id}`);
            }
          })
          .catch(err => {
            console.error('📧 Email send error (non-blocking):', err.message);
          });
      }
    } catch (emailErr) {
      console.error('📧 Email prep error (non-blocking):', emailErr.message);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/orders — all orders for user (newest first)
// ─────────────────────────────────────────────────────────────
const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { rows } = await query(
      `SELECT
         o.id,
         o.status,
         o.payment_method,
         o.payment_status,
         o.subtotal,
         o.discount_amount,
         o.delivery_charge,
         o.total_amount,
         o.placed_at,
         o.delivered_at,
         a.city          AS address_city,
         a.state         AS address_state,
         (
           SELECT COUNT(*)::int
           FROM order_items oi
           WHERE oi.order_id = o.id
         ) AS item_count,
         (
           SELECT json_agg(
             json_build_object(
               'title',     oi.title,
               'quantity',  oi.quantity,
               'unitPrice', oi.unit_price,
               'image',     oi.image
             ) ORDER BY oi.title
           )
           FROM order_items oi
           WHERE oi.order_id = o.id
         ) AS items
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.user_id = $1
       ORDER BY o.placed_at DESC`,
      [userId]
    );

    const orders = rows.map(r => ({
      id:             r.id,
      status:         r.status,
      paymentMethod:  r.payment_method,
      paymentStatus:  r.payment_status,
      subtotal:       Number(r.subtotal),
      discountAmount: Number(r.discount_amount),
      deliveryCharge: Number(r.delivery_charge),
      totalAmount:    Number(r.total_amount),
      placedAt:       r.placed_at,
      deliveredAt:    r.delivered_at,
      addressCity:    r.address_city,
      addressState:   r.address_state,
      itemCount:      r.item_count,
      items:          r.items || [],
    }));

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/orders/:id — single order with full details
// ─────────────────────────────────────────────────────────────
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // ── Order + address ──────────────────────────────────
    const { rows: orderRows } = await query(
      `SELECT
         o.*,
         a.name     AS address_name,
         a.mobile   AS address_mobile,
         a.pincode  AS address_pincode,
         a.address1 AS address_line1,
         a.address2 AS address_line2,
         a.city     AS address_city,
         a.state    AS address_state,
         a.country  AS address_country,
         a.type     AS address_type
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.id = $1 AND o.user_id = $2`,
      [id, userId]
    );

    if (!orderRows.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found',
      });
    }

    const r = orderRows[0];

    // ── Order items ──────────────────────────────────────
    const { rows: itemRows } = await query(
      `SELECT id, product_id, title, image, brand, sku,
              quantity, unit_price, unit_mrp, total_price
       FROM order_items
       WHERE order_id = $1`,
      [id]
    );

    res.json({
      id:              r.id,
      status:          r.status,
      paymentMethod:   r.payment_method,
      paymentStatus:   r.payment_status,
      subtotal:        Number(r.subtotal),
      discountAmount:  Number(r.discount_amount),
      deliveryCharge:  Number(r.delivery_charge),
      totalAmount:     Number(r.total_amount),
      trackingId:      r.tracking_id,
      notes:           r.notes,
      placedAt:        r.placed_at,
      confirmedAt:     r.confirmed_at,
      shippedAt:       r.shipped_at,
      deliveredAt:     r.delivered_at,
      cancelledAt:     r.cancelled_at,
      address: {
        name:     r.address_name,
        mobile:   r.address_mobile,
        pincode:  r.address_pincode,
        line1:    r.address_line1,
        line2:    r.address_line2,
        city:     r.address_city,
        state:    r.address_state,
        country:  r.address_country,
        type:     r.address_type,
      },
      items: itemRows.map(i => ({
        id:         i.id,
        productId:  i.product_id,
        title:      i.title,
        image:      i.image,
        brand:      i.brand,
        sku:        i.sku,
        quantity:   i.quantity,
        unitPrice:  Number(i.unit_price),
        unitMrp:    i.unit_mrp ? Number(i.unit_mrp) : null,
        totalPrice: Number(i.total_price),
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  placeOrder,
  getOrders,
  getOrderById,
};
