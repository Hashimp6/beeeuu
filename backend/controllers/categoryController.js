const Category = require('../models/categoryModel');

// Create main category group
const addCategoryGroup = async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      icon: req.file ? req.file.path : null // Cloudinary URL
    };
    const newGroup = await Category.create(categoryData);
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update category group
const updateCategoryGroup = async (req, res) => {
  const { groupId } = req.params;
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.icon = req.file.path; // Update icon if new file uploaded
    }
    
    const updatedGroup = await Category.findByIdAndUpdate(
      groupId,
      updateData,
      { new: true }
    );
    
    if (!updatedGroup) {
      return res.status(404).json({ error: 'Category group not found' });
    }
    
    res.status(200).json(updatedGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add subcategory to a group
const addSubCategory = async (req, res) => {
  const { groupId } = req.params;
  const { name, apiEndpoint } = req.body;
  
  try {
    const group = await Category.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Category group not found' });
    }
    
    const subcategoryData = {
      name,
      apiEndpoint,
      image: req.file ? req.file.path : null // Cloudinary URL
    };
    
    group.categories.push(subcategoryData);
    await group.save();
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update subcategory
const updateSubCategory = async (req, res) => {
  const { groupId, subId } = req.params;
  
  try {
    const group = await Category.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Category group not found' });
    }
    
    const category = group.categories.id(subId);
    if (!category) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    
    // Update fields from request body
    Object.assign(category, req.body);
    
    // Update image if new file uploaded
    if (req.file) {
      category.image = req.file.path;
    }
    
    await group.save();
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete subcategory
const deleteSubCategory = async (req, res) => {
  const { groupId, subId } = req.params;
  
  try {
    const group = await Category.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Category group not found' });
    }
    
    const subcategory = group.categories.id(subId);
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    
    subcategory.remove();
    await group.save();
    res.status(200).json({ message: 'Subcategory deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete entire group
const deleteCategoryGroup = async (req, res) => {
  try {
    const deletedGroup = await Category.findByIdAndDelete(req.params.groupId);
    if (!deletedGroup) {
      return res.status(404).json({ error: 'Category group not found' });
    }
    res.status(200).json({ message: 'Category group deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all category groups
const getAllCategories = async (req, res) => {
  try {
    const groups = await Category.find();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addCategoryGroup,
  updateCategoryGroup,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
  deleteCategoryGroup,
  getAllCategories
};