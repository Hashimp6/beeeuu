import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Package, 
  DollarSign, 
  Tag, 
  ImageIcon,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { SERVER_URL } from '../../Config';
import { useAuth } from '../../context/UserContext';
import axios from 'axios';

// Add Product Form Component
const AddProductForm = ({ 
  isVisible, 
  onClose, 
  onSubmit, 
  editingProduct = null,
  loading = false 
}) => {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    category: '',
    type: '',
    price: '',
    imageUri: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingProduct) {
      setProduct({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        category: editingProduct.category || '',
        type: editingProduct.type || '',
        price: editingProduct.price?.toString() || '',
        imageUri: editingProduct.image || ''
      });
    } else {
      setProduct({
        name: '',
        description: '',
        category: '',
        type: '',
        price: '',
        imageUri: ''
      });
    }
    setErrors({});
  }, [editingProduct, isVisible]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!product.name.trim()) newErrors.name = 'Product name is required';
    if (!product.type) newErrors.type = 'Product type is required';
    if (!product.category) newErrors.category = 'Category is required';
    if (!product.price.trim()) newErrors.price = 'Price is required';
    else if (isNaN(parseFloat(product.price)) || parseFloat(product.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(product);
    }
  };

  const handleImagePick = () => {
    // Simulate image picker - in real app, you'd use expo-image-picker
    const mockImageUri = `https://picsum.photos/400/300?random=${Date.now()}`;
    setProduct(prev => ({ ...prev, imageUri: mockImageUri }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-teal-600 text-white p-6 rounded-t-xl">
          <h2 className="text-xl font-bold">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={product.description}
              onChange={(e) => setProduct(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows="3"
              placeholder="Enter product description"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={product.type}
              onChange={(e) => setProduct(prev => ({ ...prev, type: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Type</option>
              <option value="product">Product</option>
              <option value="service">Service</option>
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={product.category}
              onChange={(e) => setProduct(prev => ({ ...prev, category: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Category</option>
              <option value="face">Face</option>
              <option value="hand">Hand</option>
              <option value="hair">Hair</option>
              <option value="nail">Nail</option>
              <option value="body">Body</option>
              <option value="food">Food</option>
              <option value="stationary">Stationary</option>
              <option value="bakery">Bakery</option>
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <div 
              onClick={handleImagePick}
              className="w-full border-2 border-dashed border-teal-300 rounded-lg p-4 text-center cursor-pointer hover:border-teal-500 transition-colors"
            >
              {product.imageUri ? (
                <div className="relative">
                  <img 
                    src={product.imageUri} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProduct(prev => ({ ...prev, imageUri: '' }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="text-teal-600">
                  <ImageIcon size={32} className="mx-auto mb-2" />
                  <p>Click to select image</p>
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) *
            </label>
            <input
              type="number"
              value={product.price}
              onChange={(e) => setProduct(prev => ({ ...prev, price: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter price"
              min="0"
              step="0.01"
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                editingProduct ? 'Update Product' : 'Add Product'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Store Product Screen Component
const ProductManagement = ({ storeId }) => {

      const { user, token } = useAuth() || {};
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Mock store data - replace with actual store data
  const storeData = {
    name: "My Store",
    id: "store123"
  };

  // Mock API calls - replace with actual API calls
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if storeDetails exists
      if (!storeId) {
        throw new Error('Store details not available');
      }
      
 

      const response = await axios.get(`${SERVER_URL}/products/store/${storeId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = response.data;
      console.log('Fetched products:', data);
      setProducts(response.data)

    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProduct = async (productData) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingProduct) {
        // Update existing product
        setProducts(prev => prev.map(p => 
          p._id === editingProduct._id 
            ? { ...p, ...productData, price: parseFloat(productData.price) }
            : p
        ));
      } else {
        // Add new product
        const newProduct = {
          _id: Date.now().toString(),
          ...productData,
          price: parseFloat(productData.price)
        };
        setProducts(prev => [...prev, newProduct]);
      }
      
      setShowAddForm(false);
      setEditingProduct(null);
    } catch (err) {
      setError('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setProducts(prev => prev.filter(p => p._id !== productId));
      } catch (err) {
        setError('Failed to delete product. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-teal-600 text-white p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Products</h1>
            <p className="text-teal-100">({products.length} products)</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-teal-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>


      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading && products.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={32} className="animate-spin text-teal-600" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'No products match your search' : 'Add your first product to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-12">
                  <img
                    src={product.image || 'https://picsum.photos/400/300?random=default'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-medium">
                      {product.category}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                      {product.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <DollarSign size={16} className="text-teal-600" />
                      <span className="font-bold text-teal-600">₹{product.price}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Product Form */}
      <AddProductForm
        isVisible={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmitProduct}
        editingProduct={editingProduct}
        loading={loading}
      />
    </div>
  );
};

export default ProductManagement;