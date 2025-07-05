import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
  X,
  Camera,
  Eye
} from 'lucide-react';
import { SERVER_URL } from '../../Config';
import { useAuth } from '../../context/UserContext';
import axios from 'axios';

// Add/Edit Image Form Component
const AddImageForm = ({ 
  isVisible, 
  onClose, 
  onSubmit, 
  editingImage = null,
  loading = false 
}) => {
  const [imageData, setImageData] = useState({
    caption: '',
    imageUri: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingImage) {
      setImageData({
        caption: editingImage.caption || '',
        imageUri: editingImage.image || ''
      });
    } else {
      setImageData({
        caption: '',
        imageUri: ''
      });
    }
    setErrors({});
  }, [editingImage, isVisible]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!imageData.caption.trim()) newErrors.caption = 'Caption is required';
    if (!imageData.imageUri) newErrors.imageUri = 'Image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(imageData);
    }
  };

  const handleImagePick = () => {
    // Simulate image picker - in real app, you'd use expo-image-picker or file input
    const mockImageUri = `https://picsum.photos/600/400?random=${Date.now()}`;
    setImageData(prev => ({ ...prev, imageUri: mockImageUri }));
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageData(prev => ({ ...prev, imageUri: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="bg-teal-600 text-white p-6 rounded-t-xl">
          <h2 className="text-xl font-bold">
            {editingImage ? 'Edit Image' : 'Add New Image'}
          </h2>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image *
            </label>
            <div className="space-y-2">
              {/* File Input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                id="imageFileInput"
              />
              <label
                htmlFor="imageFileInput"
                className="w-full border-2 border-dashed border-teal-300 rounded-lg p-4 text-center cursor-pointer hover:border-teal-500 transition-colors block"
              >
                {imageData.imageUri ? (
                  <div className="relative">
                    <img 
                      src={imageData.imageUri} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setImageData(prev => ({ ...prev, imageUri: '' }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="text-teal-600">
                    <Camera size={32} className="mx-auto mb-2" />
                    <p>Click to select image</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 10MB</p>
                  </div>
                )}
              </label>
              
              {/* Or Mock Image Button */}
              <button
                type="button"
                onClick={handleImagePick}
                className="w-full px-4 py-2 border border-teal-300 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
              >
                Use Demo Image
              </button>
            </div>
            {errors.imageUri && <p className="text-red-500 text-xs mt-1">{errors.imageUri}</p>}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caption *
            </label>
            <textarea
              value={imageData.caption}
              onChange={(e) => setImageData(prev => ({ ...prev, caption: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none ${
                errors.caption ? 'border-red-500' : 'border-gray-300'
              }`}
              rows="3"
              placeholder="Enter image caption or description"
            />
            {errors.caption && <p className="text-red-500 text-xs mt-1">{errors.caption}</p>}
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
                editingImage ? 'Update Image' : 'Add Image'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Image View Modal Component
const ImageViewModal = ({ image, isVisible, onClose }) => {
  if (!isVisible || !image) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-colors z-10"
        >
          <X size={16} />
        </button>
        
        <img
          src={image.image}
          alt={image.caption}
          className="w-full h-auto max-h-[70vh] object-contain"
        />
        
        <div className="p-4 bg-white">
          <h3 className="font-semibold text-gray-900 mb-2">{image.caption}</h3>
          <p className="text-sm text-gray-500">
            Uploaded on {new Date(image.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Gallery Management Component
const GalleryManagement = ({ storeId }) => {
  const { user, token } = useAuth() || {};
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);

  // Fetch gallery images
  const fetchGallery = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!storeId) {
        throw new Error('Store details not available');
      }

     
      console.log("seller ID:", storeId, token);

      const response = await axios.get(`${SERVER_URL}/gallery/${storeId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Fetched gallery:', response.data.data.images);
      setGallery(response.data.data.images);

    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError('Failed to load gallery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle submit (add/edit image)
  const handleSubmitImage = async (imageData) => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('seller', storeId);
      formData.append('caption', imageData.caption || 'New upload');
      
      if (imageData.imageUri) {
        // For web implementation, you'd handle file upload differently
        // This is a simplified version
        const fileExtension = 'jpg'; // Default extension
        formData.append('image', {
          uri: imageData.imageUri,
          type: `image/${fileExtension}`,
          name: `gallery_image_${Date.now()}.${fileExtension}`,
        });
      }

      console.log("gallery data", formData);

      const imageId = editingImage?._id;
      const url = editingImage 
        ? `${SERVER_URL}/gallery/${storeId}/image/${imageId}`
        : `${SERVER_URL}/gallery`;

      const method = editingImage ? 'put' : 'post';
      console.log("gallery request", url, method);

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Image saved:', response.data);
      
      // Refresh gallery after successful upload
      await fetchGallery();
      
      setShowAddForm(false);
      setEditingImage(null);
      
    } catch (err) {
      console.error('Error saving image:', err);
      setError('Failed to save image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete image
  const handleDeleteImage = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      setLoading(true);
      
      try {
        const response = await axios.delete(`${SERVER_URL}/gallery/${storeId}/image/${imageId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Image deleted:', response.data);
        
        // Remove from local state
        setGallery(prev => prev.filter(img => img._id !== imageId));
        
      } catch (err) {
        console.error('Error deleting image:', err);
        setError('Failed to delete image. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle edit image
  const handleEditImage = (image) => {
    setEditingImage(image);
    setShowAddForm(true);
  };

  // Handle view image
  const handleViewImage = (image) => {
    setViewingImage(image);
  };

  // Filter gallery based on search term
  const filteredGallery = gallery.filter(image =>
    image.caption?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchGallery();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-teal-600 text-white p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gallery</h1>
            <p className="text-teal-100">({gallery.length} images)</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-teal-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Image
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

        {loading && gallery.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={32} className="animate-spin text-teal-600" />
          </div>
        ) : filteredGallery.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'No images match your search' : 'Add your first image to get started'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Add Image
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredGallery.map((image) => (
              <div key={image._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square">
                  <img
                    src={image.image}
                    alt={image.caption}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handleViewImage(image)}
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{image.caption}</h3>
                  
                  <p className="text-xs text-gray-500 mb-3">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleViewImage(image)}
                      className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditImage(image)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(image._id)}
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

      {/* Add/Edit Image Form */}
      <AddImageForm
        isVisible={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setEditingImage(null);
        }}
        onSubmit={handleSubmitImage}
        editingImage={editingImage}
        loading={loading}
      />

      {/* Image View Modal */}
      <ImageViewModal
        image={viewingImage}
        isVisible={!!viewingImage}
        onClose={() => setViewingImage(null)}
      />
    </div>
  );
};

export default GalleryManagement;