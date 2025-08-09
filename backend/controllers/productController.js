const fs = require('fs');
const path = require('path');
const Product= require('../models/ProductModel');
// Helper function to delete image files
const deleteImageFiles = (imagePaths) => {
  if (imagePaths && imagePaths.length > 0) {
    imagePaths.forEach(imagePath => {
      if (imagePath && fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.error(`Error deleting image ${imagePath}:`, error);
        }
      }
    });
  }
};

// Add Product
const addProduct = async (req, res) => {
  try {
    
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    }
    
    const { store, name, description, details, category, type, price, quantity } = req.body;
    
    if (!store || !name || !price) {
      // Clean up uploaded images if validation fails
      deleteImageFiles(images);
      return res.status(400).json({ message: "Store, Name and Price are required" });
    }
    
    
    // Create product object with conditional quantity
    const productData = {
      store,
      name,
      description,
      details,
      category,
      images,
      type,
      price
    };
    
    // Only add quantity if it exists and type is 'product'
    if (type === 'product' && quantity !== undefined && quantity !== null && quantity !== '') {
      productData.quantity = quantity;
    }
    
    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();
    
    res.status(201).json({ message: "Product added successfully", product: savedProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    
    // Clean up uploaded images if save fails
    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => file.path);
      deleteImageFiles(images);
    }
    
    res.status(500).json({ message: "Error adding product", error: error.message });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find existing product to get current images
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      // Clean up uploaded images if product not found
      if (req.files && req.files.length > 0) {
        const images = req.files.map(file => file.path);
        deleteImageFiles(images);
      }
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const updateData = {
      ...req.body,
    };
    
    // Handle image updates
    if (req.files && req.files.length > 0) {
      // Delete old images
      deleteImageFiles(existingProduct.images);
      
      // Add new images
      updateData.images = req.files.map(file => file.path);
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });
    
    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    // Clean up uploaded images if update fails
    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => file.path);
      deleteImageFiles(images);
    }
    
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const productToDelete = await Product.findById(productId);
    
    if (!productToDelete) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete all associated image files
    deleteImageFiles(productToDelete.images);
    
    // Delete the product from database
    await Product.findByIdAndDelete(productId);
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("store");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};
const getProductsByStore = async (req, res) => {
  try {
        const { storeId } = req.params;

    
    const products = await Product.find({ store: storeId });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products by store", error: error.message });
  }
};
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category: { $regex: new RegExp(category, 'i') } });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products by category", error: error.message });
  }
};
const getProductsByName = async (req, res) => {
  try {
    const { name } = req.query;
    const products = await Product.find({ name: { $regex: new RegExp(name, 'i') } });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products by name", error: error.message });
  }
};
const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate("store");
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};


const toggleProductStatus = async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { active },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product status updated', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};


module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductsByStore,
  getProductsByCategory,
  getProductsByName,
  getProductById,
  toggleProductStatus
};
