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
  AlertCircle,
  Image,
  X
} from 'lucide-react';
import { SERVER_URL } from '../../Config';
import { useAuth } from '../../context/UserContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import ProductCard from './ProductCard';
import ProductDetailsModal from './ProductDetails';
import { showErrorToast, showSuccessToast } from '../user/Tost';


const AddProductForm = ({ 
  isVisible, 
  onClose, 
  onSubmit, 
  storeId,
  storeCategory,
  editingProduct = null,
  loading = false,
  fetchProducts = () => {}
}) => {

  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState({
    name: '',
    description: '',
    category: '',
    type: 'product',
    price: '',
    quantity: '',
    imageUris: [], // Changed to array
    imageFiles: [] // Changed to array
  });

  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setProduct({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        category: editingProduct.category || '',
        type: editingProduct.type || 'product',
        price: editingProduct.price?.toString() || '',
        quantity: editingProduct.quantity?.toString() || '',
        imageUris: editingProduct.images || [], // Changed to use images array
        imageFiles: []
      });
    } else {
      setProduct({
        name: '',
        description: '',
        category: '',
        type: 'product',
        price: '',
        quantity: '',
        imageUris: [],
        imageFiles: []
      });
    }
    setErrors({});
  }, [editingProduct, isVisible]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!product.name.trim()) newErrors.name = 'Product name is required';
    if (!product.category) newErrors.category = 'Category is required';
    if (!product.price.trim()) newErrors.price = 'Price is required';
    else if (isNaN(parseFloat(product.price)) || parseFloat(product.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    
    // Only validate quantity if type is 'product'
    // if (product.type === 'product') {
    //   if (!product.quantity.trim()) newErrors.quantity = 'Quantity is required';
    //   else if (isNaN(parseInt(product.quantity)) || parseInt(product.quantity) < 0) {
    //     newErrors.quantity = 'Please enter a valid quantity';
    //   }
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMultipleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        showErrorToast(`${file.name} is not a valid image file`);
        return false;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast(`${file.name} is too large. Max size is 5MB`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    // Check if adding these files would exceed the limit
    const currentTotal = product.imageUris.length + product.imageFiles.length;
    const remainingSlots = 5 - currentTotal;
    
    if (validFiles.length > remainingSlots) {
      showErrorToast(`You can only add ${remainingSlots} more images. Maximum 5 images allowed.`);
      return;
    }

    // Process each file
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProduct(prev => ({
          ...prev,
          imageUris: [...prev.imageUris, e.target.result],
          imageFiles: [...prev.imageFiles, file]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeImage = (index) => {
    setProduct(prev => ({
      ...prev,
      imageUris: prev.imageUris.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitProduct = async (productData) => {
    // Frontend validation
    if (
      !productData.name.trim() ||
      !productData.price.trim() ||
      !productData.type ||
      !productData.category
    ) {
      showErrorToast('Please fill in all required fields');
      return;
    }

    // Validate price
    if (isNaN(productData.price) || parseFloat(productData.price) <= 0) {
      showErrorToast('Please enter a valid price');
      return;
    }

    // Only validate quantity if type is 'product'
    // if (productData.type === 'product') {
    //   if (!productData.quantity || isNaN(productData.quantity) || parseInt(productData.quantity) < 0) {
    //     toast.error('Please enter a valid quantity for products');
    //     return;
    //   }
    // }
  
    setIsLoading(true);
  
    try {
      const formData = new FormData();
      formData.append('store', storeId);
      formData.append('name', productData.name.trim());
      formData.append('description', productData.description.trim());
      formData.append('category', productData.category);
      formData.append('type', productData.type);
      formData.append('price', parseFloat(productData.price).toString());
      
      // Only append quantity if type is 'product'
      // if (productData.type === 'product') {
      //   formData.append('quantity', parseInt(productData.quantity).toString());
      // }
  
      // Handle multiple images
      if (productData.imageFiles && productData.imageFiles.length > 0) {
        productData.imageFiles.forEach((file, index) => {
          formData.append('images', file); // Changed from 'image' to 'images'
        });
      }
  
      const productId = editingProduct?._id;
      const url = editingProduct
        ? `${SERVER_URL}/products/${productId}`
        : `${SERVER_URL}/products/add`;
  
      const method = editingProduct ? 'put' : 'post';
      
    for (let [key, value] of formData.entries()) {
        if (key === "images" && value instanceof File) {
          console.log(`${key}:`, value.name, value.type, value.size);
        } else {
          console.log(`${key}:`, value);
        }
      }
  
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
    
      showSuccessToast(`Product ${editingProduct ? 'updated' : 'added'} successfully!`);
  
      // Refresh the product list
      if (fetchProducts) fetchProducts(); 

      // Reset & close form
      handleClose();

      if (onSubmit) onSubmit(response.data);
    } catch (err) {
      console.error('Error saving product:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save product. Please try again.';
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      handleSubmitProduct(product);
    }
  };

  const handleClose = () => {
    setProduct({
      name: '',
      description: '',
      category: '',
      type: '',
      price: '',
      quantity: '',
      imageUris: [],
      imageFiles: []
    });
    setErrors({});
    onClose();
  };

  // Clear quantity when type changes from product to service
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setProduct(prev => ({ 
      ...prev, 
      type: newType,
      quantity: newType === 'service' ? '' : prev.quantity
    }));
    // Clear quantity error when switching to service
    if (newType === 'service') {
      setErrors(prev => ({ ...prev, quantity: undefined }));
    }
  };

  if (!isVisible) return null;

  const totalImages = product.imageUris.length;
  const canAddMore = totalImages < 5;

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
              rows="2"
              placeholder="Enter brief description"
            />
          </div>

       

          {/* Type */}
        {storeCategory !== "restaurant" && storeCategory !== "Restaurant" && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Type *
    </label>
    <select
      value={product.type}
      onChange={handleTypeChange}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
        errors.type ? 'border-red-500' : 'border-gray-300'
      }`}
    >
      <option value="">Select Type</option>
      <option value="product">Product</option>
      <option value="service">Service</option>
    </select>
    {errors.type && (
      <p className="text-red-500 text-xs mt-1">{errors.type}</p>
    )}
  </div>
)}


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

  {/* Render restaurant/hotel options if storeCategory is "Hotel" or "Restaurant" */}
  {['Hotel', 'restaurant','Restaurent' , 'Restaurant', 'Hotel / Restaurant'].includes(storeCategory) && (
    <>
      <option value="signature">signature</option>
      <option value="starter">Starter</option>
      <option value="main-course">Main Course</option>
      <option value="drinks">Drinks</option>
      <option value="desserts">Desserts</option>
      <option value="combo-meal">Combo Meal</option>
      <option value="today-special">Today Special</option>
    </>
  )}

  {/* Otherwise show general categories */}
  {!['Hotel', 'Restaurant', 'Hotel / Restaurant'].includes(storeCategory) && (
    <>
              <option value="beauty-cosmetics">Beauty & Cosmetics</option>
              <option value="games">Games</option>
              <option value="bakery">Bakery</option>
              <option value="food-products">Food Products</option>
              <option value="gifts-crafts">Gifts & Crafts</option>
              <option value="wedding-services">Wedding Services</option>
              <option value="groceries">Groceries</option>
              <option value="laundry">Laundry Services</option>
              <option value="photography">Photography</option>
              <option value="event-management">Event Management</option>
              <option value="vegetables-fruits">Vegetables & Fruits</option>
              <option value="snacks-beverages">Snacks & Beverages</option>
              <option value="dairy-eggs">Dairy & Eggs</option>
              <option value="beauty-services">Beauty Services</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="home-repair">Home Repair</option>
              <option value="ac-repair">AC Repair</option>
              <option value="personal-care">Personal Care</option>
              <option value="home-cleaning">Home Cleaning</option>
              <option value="baby-products">Baby Products</option>
              <option value="pet-supplies">Pet Supplies</option>
              <option value="electronics">Electronics</option>
              <option value="mobiles-accessories">Mobiles & Accessories</option>
              <option value="fashion-men">Fashion - Men</option>
              <option value="fashion-women">Fashion - Women</option>
              <option value="fashion-kids">Fashion - Kids</option>
              <option value="footwear">Footwear</option>
              <option value="watches-jewelry">Watches & Jewelry</option>
              <option value="home-appliances">Home Appliances</option>
              <option value="furniture">Furniture</option>
              <option value="kitchenware">Kitchenware</option>
              <option value="stationary">Stationary</option>
              <option value="books">Books</option>
              <option value="sports-fitness">Sports & Fitness</option>
              <option value="toys">Toys</option>
              <option value="automotive">Automotive</option>
              <option value="gardening">Gardening</option>
              <option value="hardware-tools">Hardware & Tools</option>
              <option value="seasonal-items">Seasonal Items</option>
              <option value="carpenter">Carpenter</option>
              <option value="delivery-service">Delivery Service</option>
              <option value="tailoring">Tailoring</option>
              <option value="tutor-coaching">Tutor / Coaching</option>
              <option value="other">Other</option>
    </>
  )}
</select>

      
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Multiple Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Images ({totalImages}/5)
            </label>
            
            {/* Image Preview Grid */}
            {totalImages > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {product.imageUris.map((uri, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={uri} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            {canAddMore && (
              <div 
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('imageInput').click()}
                className={`w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-teal-300 hover:border-teal-500 hover:bg-teal-50'
                }`}
              >
                <div className="text-teal-600">
                  <Image size={32} className="mx-auto mb-2" />
                  <p className="font-medium">Click to select images</p>
                  <p className="text-xs text-gray-500 mt-1">or drag and drop here</p>
                  <p className="text-xs text-gray-400 mt-1">Max 5 images, 5MB each</p>
                </div>
              </div>
            )}
            
            <input
              type="file"
              id="imageInput"
              accept="image/*"
              multiple
              onChange={handleMultipleImageSelect}
              style={{ display: 'none' }}
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) *
            </label>
            <input
              type="text"
              value={product.price}
              onChange={(e) => setProduct(prev => ({ ...prev, price: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter price"
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>

          {/* Quantity (only show if type is product) */}
          {product.type === 'product' &&storeCategory !== "restaurant" && storeCategory !== "Restaurant"&& (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="text"
                value={product.quantity}
                onChange={(e) => setProduct(prev => ({ ...prev, quantity: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter quantity"
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading || loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || loading}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {(isLoading || loading) ? (
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
const ProductManagement = ({ store}) => {
const storeId=store._id
      const { user, token } = useAuth() || {};
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };
  
  const handleCloseModal = () => {
    setShowDetails(false);
    setSelectedProduct(null);
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
      setProducts(response.data)

    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add this function inside your ProductManagement component
const handleToggleActive = async (productId, newActiveStatus) => {
  try {
    setLoading(true);
    
    const response = await axios.patch(
      `${SERVER_URL}/products/${productId}/status`,
      { active: newActiveStatus },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    // Update the product in your local state
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product._id === productId 
          ? { ...product, active: newActiveStatus }
          : product
      )
    );

    // Show success message using toast (since you're already using it)
    showSuccessToast(response.data.message || 'Product status updated successfully!');
    
  } catch (error) {
    console.error('Error toggling product status:', error);
    const errorMessage = error.response?.data?.message || 'Failed to update product status. Please try again.';
    showErrorToast(errorMessage);
  } finally {
    setLoading(false);
  }
};


  const handleSubmitProduct = async (productData) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowAddForm(false);
      setEditingProduct(null);
      
      setShowAddForm(false);
      setEditingProduct(null);
    } catch (err) {
      setError('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (productId) => {
    toast((t) => (
      <div className="flex flex-col space-y-2 relative">
        {/* ❌ Close (X) Button */}
        <button
          onClick={() => toast.dismiss(t.id)}
          className="absolute top-1 right-1 text-gray-500 hover:text-gray-800"
        >
          <X size={14} />
        </button>
    
        <p className="text-sm font-medium">
          Are you sure you want to delete this product?
        </p>
    
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Cancel
          </button>
    
          <button
            onClick={async () => {
              toast.dismiss(t.id); // Close toast
              try {
                setLoading(true);
    
                await axios.delete(`${SERVER_URL}/products/${productId}`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
    
                toast.success("Product deleted successfully!");
                setProducts((prev) => prev.filter((p) => p._id !== productId));
              } catch (err) {
                console.error("Error deleting product:", err);
                const errorMessage =
                  err.response?.data?.message ||
                  "Failed to delete product. Please try again.";
                toast.error(errorMessage);
              } finally {
                setLoading(false);
              }
            }}
            className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: 5000,   // ✅ Auto close after 2 seconds
      position: "top-center",
    });
  };
  

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const filteredProducts = products.filter(({ name = '', category = '' }) =>
    name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
  <ProductCard
    key={product._id}
    product={product}
    onEdit={handleEditProduct}
    onDelete={handleDeleteProduct}
    onView={handleViewProduct}
    onToggleActive={handleToggleActive}
  />
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
  storeId={storeId} 
  storeCategory={store?.category}
  fetchProducts={fetchProducts} 
/>
<ProductDetailsModal
  product={selectedProduct}
  isOpen={showDetails}
  onClose={handleCloseModal}
/>

    </div>
  );
};

export default ProductManagement;