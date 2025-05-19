const express = require('express');
const router = express.Router();
const {
  addProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { uploadProductImage } = require('../config/multer');

// Add Product
router.post('/add',uploadProductImage.single("image"), addProduct);

// Update Product
router.put('/:productId', updateProduct);

// Delete Product
router.delete('/:productId', deleteProduct);

module.exports = router;
