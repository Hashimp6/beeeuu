const Product = require('../models/ProductModel');

// Add Product
const addProduct = async (req, res) => {
    try {
      let image = "";
      if (req.file && req.file.path) {
        image = req.file.path;  
      }
  
      const { store, name, description,category, price } = req.body;
  
      if (!store || !name || !price) {
        return res.status(400).json({ message: "Store, Name and Price are required" });
      }
  
      const newProduct = new Product({ store, name, description,category, image, price });
      const savedProduct = await newProduct.save();

  
      res.status(201).json({ message: "Product added successfully", product: savedProduct });
    } catch (error) {
      res.status(500).json({ message: "Error adding product", error: error.message });
    }
  };
  

// Update Product
const updateProduct = async (req, res) => {
  try {
    let image = "";
    if (req.file && req.file.path) {
      image = req.file.path;  
    }
    const { productId } = req.params;
console.log("dtsss",req.body);
const updateData = {
  ...req.body,
};

if (image) {
  updateData.image = image;
}

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
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
    console.log("sdd");
    const { storeId } = req.params;
    console.log("sdd",storeId );
    
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
  getAllProducts,
  getProductsByStore,
  getProductsByCategory,
  getProductsByName,
  getProductById
};
