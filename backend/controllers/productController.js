const Product = require('../models/ProductModel');

// Add Product
const addProduct = async (req, res) => {
    try {
      let image = "";
      if (req.file && req.file.path) {
        image = req.file.path;  
      }
  
      const { store, name, description, price } = req.body;
  
      if (!store || !name || !price) {
        return res.status(400).json({ message: "Store, Name and Price are required" });
      }
  
      const newProduct = new Product({ store, name, description, image, price });
      const savedProduct = await newProduct.save();
  
      res.status(201).json({ message: "Product added successfully", product: savedProduct });
    } catch (error) {
      res.status(500).json({ message: "Error adding product", error: error.message });
    }
  };
  

// Update Product
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const deleted = await Product.findByIdAndDelete(productId);

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
};
