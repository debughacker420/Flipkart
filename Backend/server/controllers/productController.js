const { query } = require('../db/connection');

// ─────────────────────────────────────────────────────────────
// GET /api/products
// ─────────────────────────────────────────────────────────────
const getAllProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort,
      brands,
      rating,
      page  = 1,
      limit = 20,
    } = req.query;

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset   = (pageNum - 1) * limitNum;

    // ── Build WHERE clauses dynamically ──────────────────
    const conditions = ['p.is_active = true'];
    const params     = [];
    let idx          = 1;

    if (category) {
      conditions.push(`c.slug = $${idx++}`);
      params.push(category);
    }

    if (search) {
      conditions.push(`(p.title ILIKE $${idx} OR p.description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    if (minPrice) {
      conditions.push(`p.price >= $${idx++}`);
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      conditions.push(`p.price <= $${idx++}`);
      params.push(Number(maxPrice));
    }

    // brands: can be single string or array
    if (brands) {
      const brandList = Array.isArray(brands) ? brands : [brands];
      if (brandList.length > 0) {
        const placeholders = brandList.map(() => `$${idx++}`).join(', ');
        conditions.push(`p.brand ILIKE ANY(ARRAY[${placeholders}])`);
        brandList.forEach(b => params.push(b));
      }
    }

    if (rating) {
      conditions.push(`p.rating >= $${idx++}`);
      params.push(Number(rating));
    }

    const WHERE = conditions.join(' AND ');

    // ── Sort mapping ─────────────────────────────────────
    const SORT_MAP = {
      price_asc:  'p.price ASC',
      price_desc: 'p.price DESC',
      rating:     'p.rating DESC',
      newest:     'p.created_at DESC',
    };
    const ORDER = SORT_MAP[sort] || 'p.created_at DESC';

    // ── Count total matching rows ────────────────────────
    const { rows: countRows } = await query(
      `SELECT COUNT(*)
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${WHERE}`,
      params
    );
    const totalCount = parseInt(countRows[0].count, 10);
    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    // ── Fetch paginated products with primary image ──────
    const limitIdx  = idx++;
    const offsetIdx = idx++;

    const { rows } = await query(
      `SELECT
         p.id,
         p.title,
         p.description,
         p.price,
         p.mrp,
         p.brand,
         p.rating,
         p.reviews_count,
         p.stock,
         p.sku,
         p.is_featured,
         p.created_at,
         c.id    AS category_id,
         c.title AS category_name,
         c.slug  AS category_slug,
         pi.url  AS image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN LATERAL (
         SELECT url
         FROM product_images
         WHERE product_id = p.id
         ORDER BY is_primary DESC, sort_order ASC
         LIMIT 1
       ) pi ON true
       WHERE ${WHERE}
       ORDER BY ${ORDER}
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      [...params, limitNum, offset]
    );

    // ── Format response ──────────────────────────────────
    const products = rows.map(r => ({
      id:           r.id,
      title:        r.title,
      description:  r.description,
      price:        Number(r.price),
      mrp:          r.mrp ? Number(r.mrp) : null,
      brand:        r.brand,
      rating:       Number(r.rating),
      reviewsCount: r.reviews_count,
      stock:        r.stock,
      sku:          r.sku,
      isFeatured:   r.is_featured,
      image:        r.image,
      category:     r.category_slug,
      categoryName: r.category_name,
      createdAt:    r.created_at,
    }));

    res.json({
      products,
      totalCount,
      page:       pageNum,
      totalPages,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/products/:id
// ─────────────────────────────────────────────────────────────
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ── Product + category ───────────────────────────────
    const { rows: productRows } = await query(
      `SELECT
         p.id,
         p.title,
         p.description,
         p.price,
         p.mrp,
         p.brand,
         p.rating,
         p.reviews_count,
         p.stock,
         p.sku,
         p.is_featured,
         p.created_at,
         p.updated_at,
         c.id    AS category_id,
         c.title AS category_name,
         c.slug  AS category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1 AND p.is_active = true`,
      [id]
    );

    if (!productRows.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    const r = productRows[0];

    // ── All images ordered by sort_order ─────────────────
    const { rows: imageRows } = await query(
      `SELECT id, url, alt_text, is_primary, sort_order
       FROM product_images
       WHERE product_id = $1
       ORDER BY sort_order ASC`,
      [id]
    );

    // ── All specifications ordered by sort_order ─────────
    const { rows: specRows } = await query(
      `SELECT id, section, label, value, sort_order
       FROM product_specifications
       WHERE product_id = $1
       ORDER BY sort_order ASC`,
      [id]
    );

    // ── Build response ───────────────────────────────────
    const primaryImage = imageRows.find(i => i.is_primary) || imageRows[0];

    const product = {
      id:             r.id,
      title:          r.title,
      description:    r.description,
      price:          Number(r.price),
      mrp:            r.mrp ? Number(r.mrp) : null,
      brand:          r.brand,
      rating:         Number(r.rating),
      reviewsCount:   r.reviews_count,
      stock:          r.stock,
      sku:            r.sku,
      isFeatured:     r.is_featured,
      createdAt:      r.created_at,
      updatedAt:      r.updated_at,
      category:       r.category_slug,
      categoryId:     r.category_id,
      categoryName:   r.category_name,
      image:          primaryImage?.url || null,
      images:         imageRows.map(i => i.url),
      imageDetails:   imageRows.map(i => ({
        id:        i.id,
        url:       i.url,
        alt:       i.alt_text,
        isPrimary: i.is_primary,
      })),
      specifications: specRows.map(s => ({
        id:      s.id,
        section: s.section,
        label:   s.label,
        value:   s.value,
      })),
    };

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/products/categories
// ─────────────────────────────────────────────────────────────
const getCategories = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT
         id,
         title,
         slug,
         image,
         parent_id,
         is_active,
         sort_order
       FROM categories
       WHERE is_active = true
       ORDER BY title ASC`
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/products/brands?category=X&search=Y
// Returns unique brands matching the current filter context
// ─────────────────────────────────────────────────────────────
const getBrands = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const conditions = ['p.is_active = true', 'p.brand IS NOT NULL', "p.brand != ''"];
    const params = [];
    let idx = 1;

    if (category) {
      conditions.push(`c.slug = $${idx++}`);
      params.push(category);
    }
    if (search) {
      conditions.push(`(p.title ILIKE $${idx} OR p.description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const WHERE = conditions.join(' AND ');
    const { rows } = await query(
      `SELECT DISTINCT p.brand
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${WHERE}
       ORDER BY p.brand ASC`,
      params
    );
    res.json(rows.map(r => r.brand));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getCategories,
  getBrands,
};
