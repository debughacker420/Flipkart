-- ============================================================
-- Flipkart Clone — PostgreSQL Database Schema
-- Drop & recreate all 9 tables in dependency order
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Drop existing tables (reverse dependency order)
-- ============================================================
DROP TABLE IF EXISTS reviews         CASCADE;
DROP TABLE IF EXISTS wishlists      CASCADE;
DROP TABLE IF EXISTS order_items    CASCADE;
DROP TABLE IF EXISTS orders         CASCADE;
DROP TABLE IF EXISTS cart_items     CASCADE;
DROP TABLE IF EXISTS addresses      CASCADE;
DROP TABLE IF EXISTS product_specifications CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products       CASCADE;
DROP TABLE IF EXISTS categories     CASCADE;
DROP TABLE IF EXISTS users          CASCADE;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          VARCHAR(20)   NOT NULL DEFAULT 'customer'
                              CHECK (role IN ('customer', 'admin', 'seller')),
  avatar        TEXT,
  phone         VARCHAR(15),
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email  ON users(email);
CREATE INDEX idx_users_role   ON users(role);

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id            SERIAL        PRIMARY KEY,
  title         VARCHAR(100)  NOT NULL,
  slug          VARCHAR(100)  NOT NULL UNIQUE,
  image         TEXT,
  parent_id     INTEGER       REFERENCES categories(id) ON DELETE SET NULL,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  sort_order    INTEGER       NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug   ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ============================================================
-- 3. PRODUCTS
-- ============================================================
CREATE TABLE products (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           VARCHAR(255)  NOT NULL CHECK (CHAR_LENGTH(TRIM(title)) > 0),
  description     TEXT,
  price           NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  mrp             NUMERIC(12,2) CHECK (mrp IS NULL OR mrp >= price),
  brand           VARCHAR(100),
  category_id     INTEGER       REFERENCES categories(id) ON DELETE SET NULL,
  rating          NUMERIC(3,1)  NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count   INTEGER       NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  stock           INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku             VARCHAR(100)  UNIQUE,
  weight_grams    INTEGER       CHECK (weight_grams IS NULL OR weight_grams > 0),
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  is_featured     BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand    ON products(brand);
CREATE INDEX idx_products_price    ON products(price);
CREATE INDEX idx_products_rating   ON products(rating DESC);
CREATE INDEX idx_products_active   ON products(is_active);
CREATE INDEX idx_products_stock    ON products(stock);

-- Full-text search index
CREATE INDEX idx_products_fts ON products
  USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================================
-- 4. PRODUCT_IMAGES
-- ============================================================
CREATE TABLE product_images (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url           TEXT          NOT NULL CHECK (CHAR_LENGTH(TRIM(url)) > 0),
  alt_text      VARCHAR(255),
  is_primary    BOOLEAN       NOT NULL DEFAULT FALSE,
  sort_order    INTEGER       NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary);

-- ============================================================
-- 5. PRODUCT_SPECIFICATIONS
-- ============================================================
CREATE TABLE product_specifications (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  section       VARCHAR(100)  NOT NULL DEFAULT 'General',
  label         VARCHAR(150)  NOT NULL CHECK (CHAR_LENGTH(TRIM(label)) > 0),
  value         TEXT          NOT NULL CHECK (CHAR_LENGTH(TRIM(value)) > 0),
  sort_order    INTEGER       NOT NULL DEFAULT 0
);

CREATE INDEX idx_product_specs_product ON product_specifications(product_id);

-- ============================================================
-- 6. ADDRESSES
-- ============================================================
CREATE TABLE addresses (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(100)  NOT NULL,
  mobile        VARCHAR(15)   NOT NULL CHECK (mobile ~ '^[6-9][0-9]{9}$'),
  pincode       VARCHAR(10)   NOT NULL CHECK (pincode ~ '^[1-9][0-9]{5}$'),
  address1      TEXT          NOT NULL,
  address2      TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100)  NOT NULL,
  country       VARCHAR(60)   NOT NULL DEFAULT 'India',
  type          VARCHAR(20)   NOT NULL DEFAULT 'HOME' CHECK (type IN ('HOME', 'WORK', 'OTHER')),
  is_default    BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user    ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(user_id, is_default);

-- ============================================================
-- 7. CART_ITEMS
-- ============================================================
CREATE TABLE cart_items (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID          NOT NULL, -- REFERENCES users(id) ON DELETE CASCADE (Removed to support guest carts)
  product_id    UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity      INTEGER       NOT NULL DEFAULT 1 CHECK (quantity >= 1 AND quantity <= 10),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, product_id)
);

CREATE INDEX idx_cart_items_user    ON cart_items(user_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- ============================================================
-- 8. ORDERS
-- ============================================================
CREATE TABLE orders (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID          REFERENCES users(id) ON DELETE SET NULL,
  address_id        UUID          REFERENCES addresses(id) ON DELETE SET NULL,
  status            VARCHAR(50)   NOT NULL DEFAULT 'placed'
                                  CHECK (status IN (
                                    'placed', 'confirmed', 'processing',
                                    'shipped', 'out_for_delivery',
                                    'delivered', 'cancelled', 'returned'
                                  )),
  payment_method    VARCHAR(50)   NOT NULL DEFAULT 'COD'
                                  CHECK (payment_method IN (
                                    'COD', 'UPI', 'CREDIT_CARD',
                                    'DEBIT_CARD', 'NET_BANKING', 'WALLET'
                                  )),
  payment_status    VARCHAR(30)   NOT NULL DEFAULT 'pending'
                                  CHECK (payment_status IN (
                                    'pending', 'paid', 'failed', 'refunded'
                                  )),
  subtotal          NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  discount_amount   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  delivery_charge   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (delivery_charge >= 0),
  total_amount      NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  tracking_id       VARCHAR(100),
  notes             TEXT,
  placed_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  confirmed_at      TIMESTAMPTZ,
  shipped_at        TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user      ON orders(user_id);
CREATE INDEX idx_orders_status    ON orders(status);
CREATE INDEX idx_orders_placed_at ON orders(placed_at DESC);

-- ============================================================
-- 9. ORDER_ITEMS
-- ============================================================
CREATE TABLE order_items (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID          REFERENCES products(id) ON DELETE SET NULL,
  title           VARCHAR(255)  NOT NULL,
  image           TEXT,
  brand           VARCHAR(100),
  sku             VARCHAR(100),
  quantity        INTEGER       NOT NULL CHECK (quantity >= 1),
  unit_price      NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  unit_mrp        NUMERIC(12,2) CHECK (unit_mrp IS NULL OR unit_mrp >= unit_price),
  total_price     NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================================
-- 10. WISHLISTS
-- ============================================================
CREATE TABLE wishlists (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID          NOT NULL, -- REFERENCES users(id) ON DELETE CASCADE (Removed to support guest wishlists)
  product_id    UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX idx_wishlists_user    ON wishlists(user_id);
CREATE INDEX idx_wishlists_product ON wishlists(product_id);

-- ============================================================
-- 11. REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating        INTEGER       NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title         VARCHAR(255),
  body          TEXT,
  images        TEXT[],
  helpful_count INTEGER       NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user    ON reviews(user_id);
CREATE INDEX idx_reviews_rating  ON reviews(rating);
