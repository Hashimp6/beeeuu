const express = require('express');
const router = express.Router();
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductsByStore,
  getProductsByCategory,
  getProductsByName,
  getProductById,
} = require('../controllers/productController');
const { uploadProductImage } = require('../config/multer');
// Add Product - Changed to handle multiple images
router.post('/add', uploadProductImage.array('images', 5), addProduct); // Allow up to 5 images

// Update Product - Changed to handle multiple images
router.put('/:productId', uploadProductImage.array('images', 5), updateProduct);

router.get("/all", getAllProducts);
router.get("/store/:storeId", getProductsByStore);
router.get("/category/:category", getProductsByCategory);
router.get("/search", getProductsByName); // ?name=milk
router.get("/:productId", getProductById);

// Delete Product
router.delete('/:productId', deleteProduct);

module.exports = router;
