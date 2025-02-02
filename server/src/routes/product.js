const express = require('express');
const { 
  createProduct, 
  updateProduct, 
  getProducts, 
  getProduct,
  updateThreatStatus,
  getProductChat,
  getProductStatus,
  getAllProductsStatus
} = require('../controllers/productController');
const auth = require('../middleware/auth');

const router = express.Router();

// Status routes (must come before /:id routes)
router.get('/status', auth, getAllProductsStatus);

// Basic CRUD routes
router.post('/', auth, createProduct);
router.get('/', auth, getProducts);
router.get('/:id', auth, getProduct);
router.put('/:id', auth, updateProduct);
router.get('/:id/status', auth, getProductStatus);

// Threat management routes
router.put('/:id/threat/:threatId', auth, updateThreatStatus);
router.post('/:id/chat', auth, getProductChat);

module.exports = router; 