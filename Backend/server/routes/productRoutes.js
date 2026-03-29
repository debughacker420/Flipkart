const express = require('express');
const router  = express.Router();

const {
  getAllProducts,
  getProductById,
  getCategories,
  getBrands,
} = require('../controllers/productController');

// GET /api/products/categories — must be BEFORE /:id
router.get('/categories', getCategories);

// GET /api/products/brands — must be BEFORE /:id
router.get('/brands', getBrands);

// GET /api/products
router.get('/', getAllProducts);

// GET /api/products/:id
router.get('/:id', getProductById);

module.exports = router;
