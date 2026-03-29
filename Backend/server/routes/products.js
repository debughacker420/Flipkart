const express = require('express');
const router  = express.Router();
const { query } = require('../db/connection');
const { asyncHandler } = require('../middleware/errorHandler');

// ─────────────────────────────────────────────────────────────
// Helper: fetch images + specs for one or many product ids
// ─────────────────────────────────────────────────────────────
async function attachImages(productIds) {
  if (!productIds.length) return {};
  const { rows } = await query(
    `SELECT product_id, url, alt_text, is_primary, sort_order
     FROM product_images
     WHERE product_id = ANY($1::uuid[])
     ORDER BY product_id, sort_order`,
    [productIds]
  );
  const map = {};
  for (const r of rows) {
    const key = r.product_id;
    if (!map[key]) map[key] = [];
    map[key].push({ url: r.url, alt: r.alt_text, isPrimary: r.is_primary });
  }
  return map;
}

async function attachSpecs(productId) {
  const { rows } = await query(
    `SELECT section, label, value, sort_order
     FROM product_specifications
     WHERE product_id = $1
     ORDER BY sort_order`,
    [productId]
  );
  return rows;
}

// Normalise a product row into the shape the frontend expects
function normaliseProduct(row, imageMap) {
  const imgs = imageMap[row.id] || [];
  const primaryImg = imgs.find(i => i.isPrimary) || imgs[0];
  return {
    id:           row.id,
    title:        row.title,
    description:  row.description,
    price:        Number(row.price),
    mrp:          row.mrp ? Number(row.mrp) : null,
    brand:        row.brand,
    category:     row.category_slug  || null,
    categoryName: row.category_name  || null,
    rating:       Number(row.rating),
    reviewsCount: row.reviews_count,
    stock:        row.stock,
    sku:          row.sku,
    isFeatured:   row.is_featured,
    image:        primaryImg?.url    || null,   // convenience field
    images:       imgs.map(i => i.url),          // array of URLs
  };
}

// ─────────────────────────────────────────────────────────────
// GET /api/products
// Query params: category, search, brand, minPrice, maxPrice,
//               sort, limit (default 12), skip (default 0)
// ─────────────────────────────────────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
  const {
    category, search, brand,
    minPrice, maxPrice,
    sort,
    limit = 12,
    skip  = 0,
  } = req.query;

  const conditions = ['p.is_active = true'];
  const params     = [];
  let   idx        = 1;

  if (category) {
    conditions.push(`c.slug = $${idx++}`);
    params.push(category);
  }
  if (search) {
    conditions.push(
      `to_tsvector('english', p.title || ' ' || COALESCE(p.description,'')) @@ plainto_tsquery('english', $${idx++})`
    );
    params.push(search);
  }
  if (brand) {
    conditions.push(`p.brand ILIKE $${idx++}`);
    params.push(`%${brand}%`);
  }
  if (minPrice) {
    conditions.push(`p.price >= $${idx++}`);
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    conditions.push(`p.price <= $${idx++}`);
    params.push(Number(maxPrice));
  }

  const WHERE = conditions.join(' AND ');

  const ORDER_MAP = {
    price_asc:  'p.price ASC',
    price_desc: 'p.price DESC',
    rating:     'p.rating DESC',
    newest:     'p.created_at DESC',
  };
  const ORDER = ORDER_MAP[sort] || 'p.created_at DESC';

  // Count total matching products for pagination
  const { rows: countRows } = await query(
    `SELECT COUNT(*) FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE ${WHERE}`,
    params
  );
  const totalCount = parseInt(countRows[0].count, 10);

  // Paginated product rows
  const { rows } = await query(
    `SELECT p.id, p.title, p.description, p.price, p.mrp, p.brand,
            p.rating, p.reviews_count, p.stock, p.sku, p.is_featured,
            c.slug AS category_slug, c.title AS category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE ${WHERE}
     ORDER BY ${ORDER}
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...params, Number(limit), Number(skip)]
  );

  const ids       = rows.map(r => r.id);
  const imageMap  = await attachImages(ids);
  const products  = rows.map(r => normaliseProduct(r, imageMap));

  res.json({ products, totalCount });
}));

// ─────────────────────────────────────────────────────────────
// GET /api/products/featured  — must be before /:id
// ─────────────────────────────────────────────────────────────
router.get('/featured', asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT p.id, p.title, p.description, p.price, p.mrp, p.brand,
            p.rating, p.reviews_count, p.stock, p.sku, p.is_featured,
            c.slug AS category_slug, c.title AS category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.is_active = true AND p.is_featured = true
     ORDER BY p.rating DESC
     LIMIT 10`
  );
  const imageMap = await attachImages(rows.map(r => r.id));
  res.json(rows.map(r => normaliseProduct(r, imageMap)));
}));

// ─────────────────────────────────────────────────────────────
// GET /api/products/:id
// ─────────────────────────────────────────────────────────────
router.get('/:id', asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT p.id, p.title, p.description, p.price, p.mrp, p.brand,
            p.rating, p.reviews_count, p.stock, p.sku, p.is_featured,
            c.slug AS category_slug, c.title AS category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.id = $1 AND p.is_active = true`,
    [req.params.id]
  );

  if (!rows.length) {
    res.status(404);
    throw new Error('Product not found');
  }

  const row       = rows[0];
  const imageMap  = await attachImages([row.id]);
  const specs     = await attachSpecs(row.id);
  const product   = {
    ...normaliseProduct(row, imageMap),
    specifications: specs,
  };

  res.json(product);
}));

module.exports = router;
