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

// Add Product
router.post('/add',uploadProductImage.single("image"), addProduct);

// Update Product
router.put('/:productId',uploadProductImage.single("image"), updateProduct);
router.get("/all", getAllProducts);
router.get("/store/:storeId", getProductsByStore);
router.get("/category/:category", getProductsByCategory);
router.get("/search", getProductsByName); // ?name=milk
router.get("/:productId", getProductById);

// Delete Product
router.delete('/:productId', deleteProduct);

module.exports = router;
