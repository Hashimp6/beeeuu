const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { uploadCategoryIcon, uploadSubcategoryImage } = require('../config/multer');

// Category group routes with icon upload
router.post('/group', uploadCategoryIcon.single('icon'), categoryController.addCategoryGroup);
router.get('/group', categoryController.getAllCategories);
router.delete('/group/:groupId', categoryController.deleteCategoryGroup);
router.put('/group/:groupId', uploadCategoryIcon.single('icon'), categoryController.updateCategoryGroup);

// Subcategory routes with image upload
router.post('/group/:groupId/sub', uploadSubcategoryImage.single('image'), categoryController.addSubCategory);
router.put('/group/:groupId/sub/:subId', uploadSubcategoryImage.single('image'), categoryController.updateSubCategory);
router.delete('/group/:groupId/sub/:subId', categoryController.deleteSubCategory);

module.exports = router;