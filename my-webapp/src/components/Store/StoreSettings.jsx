import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LogOut, Store, Eye, EyeOff, Edit, Trash2, Plus } from 'lucide-react';
import { SERVER_URL } from '../../Config';
import { useAuth } from '../../context/UserContext';

const PAYMENT_OPTIONS = ['Cash on Delivery', 'UPI', 'Card', 'Net Banking', 'Razorpay'];
const SERVICE_OPTIONS = ['Eat In', 'Take Away / Parcel', 'Collection', 'Delivery'];
const PAGE_OPTIONS = ['overview', 'offers', 'appointments', 'orders', 'product', 'gallery', 'settings'];

const StoreSettings = ({ store, logout }) => {
  const { user, login } = useAuth();
  
  // State management
  const [otherStores, setOtherStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [switchingStore, setSwitchingStore] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    upi: store.upi || '',
    gst: store.gst || '',
    paymentTypes: store.paymentType || [],
    serviceTypes: store.serviceType || [],
    securedPages: store.security?.pages || [],
    razorpayKeyId: '',
    razorpayKeySecret: ''
  });
  
  // UI states
  const [loading, setLoading] = useState({
    payments: false,
    services: false,
    upi: false,
    gst: false,
    razorpay: false,
    securedPages: false
  });
  
  const [showKeys, setShowKeys] = useState(false);
  const [deliveryCharges, setDeliveryCharges] = useState([]);
  const [newCharge, setNewCharge] = useState({ minDistance: '', maxDistance: '', charge: '' });
  const [editingCharge, setEditingCharge] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchOtherStores();
    if (formData.serviceTypes.includes('Delivery')) {
      fetchDeliveryCharges();
    }
  }, [formData.serviceTypes]);

  // API calls
  const fetchOtherStores = async () => {
    if (!user?._id) return;
    
    setLoadingStores(true);
    try {
      const response = await axios.get(`${SERVER_URL}/users/other/${user._id}`);
      setOtherStores(response.data);
    } catch (error) {
      console.error('Failed to fetch other stores:', error);
    } finally {
      setLoadingStores(false);
    }
  };

  const fetchDeliveryCharges = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/stores/${store._id}/deliveryCharges`);
      setDeliveryCharges(response.data || []);
    } catch (error) {
      console.error('Failed to fetch delivery charges:', error);
    }
  };

  const fetchRazorpayCredentials = async () => {
    if (showKeys) {
      setShowKeys(false);
      setFormData(prev => ({ ...prev, razorpayKeyId: '', razorpayKeySecret: '' }));
      return;
    }

    setLoading(prev => ({ ...prev, razorpay: true }));
    try {
      const response = await axios.get(`${SERVER_URL}/stores/${store._id}/razorpay`);
      setFormData(prev => ({
        ...prev,
        razorpayKeyId: response.data.key_id || '',
        razorpayKeySecret: response.data.key_secret || ''
      }));
      setShowKeys(true);
    } catch (error) {
      console.error('Failed to fetch Razorpay credentials:', error);
      alert('Could not retrieve Razorpay credentials');
    } finally {
      setLoading(prev => ({ ...prev, razorpay: false }));
    }
  };

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  // Update handlers
  const handleUpdateUpi = async () => {
    if (!formData.upi.trim()) return;
    
    setLoading(prev => ({ ...prev, upi: true }));
    try {
      await axios.put(`${SERVER_URL}/stores/${store._id}`, { upi: formData.upi });
      alert('UPI updated successfully!');
    } catch (error) {
      console.error('UPI update failed:', error);
      alert('Failed to update UPI');
    } finally {
      setLoading(prev => ({ ...prev, upi: false }));
    }
  };

  const handleUpdateGst = async () => {
    if (!formData.gst.trim()) return;
    
    setLoading(prev => ({ ...prev, gst: true }));
    try {
      await axios.put(`${SERVER_URL}/stores/${store._id}/gst`, { gst: formData.gst });
      alert('GST updated successfully!');
    } catch (error) {
      console.error('GST update failed:', error);
      alert('Failed to update GST');
    } finally {
      setLoading(prev => ({ ...prev, gst: false }));
    }
  };

  const handleUpdatePaymentTypes = async () => {
    setLoading(prev => ({ ...prev, payments: true }));
    try {
      await axios.put(`${SERVER_URL}/stores/${store._id}/payment-type`, {
        paymentType: formData.paymentTypes
      });
      alert('Payment types updated successfully!');
    } catch (error) {
      console.error('Payment type update failed:', error);
      alert('Failed to update payment types');
    } finally {
      setLoading(prev => ({ ...prev, payments: false }));
    }
  };

  const handleUpdateServiceTypes = async () => {
    setLoading(prev => ({ ...prev, services: true }));
    try {
      await axios.put(`${SERVER_URL}/stores/${store._id}/service-type`, {
        serviceType: formData.serviceTypes
      });
      alert('Service types updated successfully!');
    } catch (error) {
      console.error('Service type update failed:', error);
      alert('Failed to update service types');
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  };

  const handleUpdateSecuredPages = async () => {
    setLoading(prev => ({ ...prev, securedPages: true }));
    try {
      await axios.put(`${SERVER_URL}/stores/${store._id}/security`, {
        pages: formData.securedPages
      });
      alert('Protected pages updated successfully!');
    } catch (error) {
      console.error('Failed to update protected pages:', error);
      alert('Failed to update protected pages');
    } finally {
      setLoading(prev => ({ ...prev, securedPages: false }));
    }
  };

  const handleUpdateRazorpayCredentials = async () => {
    if (!formData.razorpayKeyId.trim() || !formData.razorpayKeySecret.trim()) {
      alert('Both Key ID and Secret are required.');
      return;
    }

    setLoading(prev => ({ ...prev, razorpay: true }));
    try {
      await axios.put(`${SERVER_URL}/stores/${store._id}/razorpay`, {
        key_id: formData.razorpayKeyId,
        key_secret: formData.razorpayKeySecret
      });
      alert('Razorpay credentials saved securely!');
    } catch (error) {
      console.error('Error saving Razorpay credentials:', error);
      alert('Failed to save Razorpay credentials');
    } finally {
      setLoading(prev => ({ ...prev, razorpay: false }));
    }
  };

  // Delivery charge handlers
  const handleAddDeliveryCharge = async () => {
    const { minDistance, maxDistance, charge } = newCharge;
    if (!minDistance || !maxDistance || !charge) {
      alert('Please fill all fields');
      return;
    }

    try {
      await axios.post(`${SERVER_URL}/stores/${store._id}/deliveryCharges`, newCharge);
      fetchDeliveryCharges();
      setNewCharge({ minDistance: '', maxDistance: '', charge: '' });
      alert('Delivery charge added successfully!');
    } catch (error) {
      console.error('Add charge failed:', error);
      alert('Failed to add delivery charge');
    }
  };

  const handleEditDeliveryCharge = async (index, updatedCharge) => {
    try {
      await axios.put(`${SERVER_URL}/stores/${store._id}/deliveryCharges/${index}`, updatedCharge);
      fetchDeliveryCharges();
      setEditingCharge(null);
      alert('Delivery charge updated successfully!');
    } catch (error) {
      console.error('Edit charge failed:', error);
      alert('Failed to update delivery charge');
    }
  };

  const handleDeleteDeliveryCharge = async (index) => {
    try {
      await axios.delete(`${SERVER_URL}/stores/${store._id}/deliveryCharges/${index}`);
      fetchDeliveryCharges();
      setConfirmDelete(null);
      alert('Delivery charge deleted successfully!');
    } catch (error) {
      console.error('Delete charge failed:', error);
      alert('Failed to delete delivery charge');
    }
  };

  const handleStoreSwitch = async (email, password, storeName) => {
    setSwitchingStore(storeName);
    try {
      const result = await login(email, password);
      if (result) {
        alert(`Successfully switched to ${storeName}`);
      } else {
        alert('Failed to switch store. Please try again.');
      }
    } catch (error) {
      console.error('Store switch failed:', error);
      alert('Failed to switch store. Please try again.');
    } finally {
      setSwitchingStore(null);
    }
  };

  // Component sections
  const renderUpiSection = () => {
    if (!formData.paymentTypes.includes('UPI')) return null;

    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">UPI Configuration</h4>
        {store.upi && (
          <p className="text-sm text-gray-600 mb-3">
            Current UPI: <span className="font-medium">{store.upi}</span>
          </p>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter UPI ID"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={formData.upi}
            onChange={(e) => handleInputChange('upi', e.target.value)}
          />
          <button
            onClick={handleUpdateUpi}
            disabled={loading.upi}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {loading.upi ? 'Saving...' : 'Update'}
          </button>
        </div>
      </div>
    );
  };

  const renderRazorpaySection = () => {
    if (!formData.paymentTypes.includes('Razorpay')) return null;

    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Razorpay Configuration</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key ID</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter Razorpay Key ID"
              value={showKeys || !store.razorpay?.key_id ? formData.razorpayKeyId : '••••••••'}
              onChange={(e) => handleInputChange('razorpayKeyId', e.target.value)}
              disabled={!showKeys && store.razorpay?.key_id}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Secret</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter Razorpay Secret"
              value={showKeys || !store.razorpay?.key_secret ? formData.razorpayKeySecret : '••••••••'}
              onChange={(e) => handleInputChange('razorpayKeySecret', e.target.value)}
              disabled={!showKeys && store.razorpay?.key_secret}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleUpdateRazorpayCredentials}
              disabled={loading.razorpay}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {loading.razorpay ? 'Saving...' : store.razorpay?.key_id ? 'Update' : 'Save'} Credentials
            </button>
            {store.razorpay?.key_id && (
              <button
                onClick={fetchRazorpayCredentials}
                disabled={loading.razorpay}
                className="flex items-center gap-2 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {loading.razorpay ? 'Loading...' : showKeys ? 'Hide' : 'View'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDeliveryCharges = () => {
    if (!formData.serviceTypes.includes('Delivery')) return null;

    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Delivery Charges</h4>
        
        {/* Add new charge form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <input
            type="number"
            placeholder="Min Distance (km)"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={newCharge.minDistance}
            onChange={(e) => setNewCharge(prev => ({ ...prev, minDistance: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Max Distance (km)"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={newCharge.maxDistance}
            onChange={(e) => setNewCharge(prev => ({ ...prev, maxDistance: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Charge (₹)"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            value={newCharge.charge}
            onChange={(e) => setNewCharge(prev => ({ ...prev, charge: e.target.value }))}
          />
          <button
            onClick={handleAddDeliveryCharge}
            className="flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Existing charges list */}
        {deliveryCharges.length > 0 ? (
          <div className="space-y-3">
            {deliveryCharges.map((charge, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                {editingCharge === index ? (
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="number"
                      className="w-20 border border-gray-300 rounded px-2 py-1"
                      defaultValue={charge.minDistance}
                      onChange={(e) => charge.minDistance = e.target.value}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      className="w-20 border border-gray-300 rounded px-2 py-1"
                      defaultValue={charge.maxDistance}
                      onChange={(e) => charge.maxDistance = e.target.value}
                    />
                    <span>km : ₹</span>
                    <input
                      type="number"
                      className="w-20 border border-gray-300 rounded px-2 py-1"
                      defaultValue={charge.charge}
                      onChange={(e) => charge.charge = e.target.value}
                    />
                    <button
                      onClick={() => handleEditDeliveryCharge(index, charge)}
                      className="text-green-600 hover:text-green-800"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCharge(null)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-700">
                      {charge.minDistance} - {charge.maxDistance} km : ₹{charge.charge}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingCharge(index)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No delivery charges configured</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Store Settings</h2>
        <p className="text-gray-600">Manage your store configuration and preferences</p>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-3 mb-4">
            {PAYMENT_OPTIONS.map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.paymentTypes.includes(option)}
                  onChange={() => toggleArrayItem('paymentTypes', option)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleUpdatePaymentTypes}
            disabled={loading.payments}
            className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {loading.payments ? 'Saving...' : 'Save Payment Methods'}
          </button>
        </div>

        {/* Service Types */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Types</h3>
          <div className="space-y-3 mb-4">
            {SERVICE_OPTIONS.map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.serviceTypes.includes(option)}
                  onChange={() => toggleArrayItem('serviceTypes', option)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleUpdateServiceTypes}
            disabled={loading.services}
            className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {loading.services ? 'Saving...' : 'Save Service Types'}
          </button>
        </div>

        {/* Protected Pages */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Protected Pages</h3>
          <p className="text-sm text-gray-600 mb-4">Select pages that require password access</p>
          <div className="space-y-3 mb-4">
            {PAGE_OPTIONS.map((page) => (
              <label key={page} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.securedPages.includes(page)}
                  onChange={() => toggleArrayItem('securedPages', page)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-gray-700 capitalize">{page}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleUpdateSecuredPages}
            disabled={loading.securedPages}
            className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {loading.securedPages ? 'Saving...' : 'Save Protected Pages'}
          </button>
        </div>

        {/* GST Configuration */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">GST Configuration</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter GST percentage (e.g., 18)"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={formData.gst}
              onChange={(e) => handleInputChange('gst', e.target.value)}
            />
            <button
              onClick={handleUpdateGst}
              disabled={loading.gst}
              className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {loading.gst ? 'Saving...' : 'Save GST'}
            </button>
          </div>
        </div>
      </div>

      {/* Conditional sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {renderUpiSection()}
        {renderRazorpaySection()}
      </div>

      {renderDeliveryCharges()}

      {/* Store Switcher */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Store className="w-5 h-5" />
          Switch Store
        </h3>
        
        {loadingStores ? (
          <p className="text-gray-500">Loading other stores...</p>
        ) : otherStores.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Click on a store to switch to that store:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherStores.map((storeData) => (
                <button
                  key={storeData._id}
                  onClick={() => handleStoreSwitch(storeData.email, storeData.password, storeData.storeName)}
                  disabled={switchingStore === storeData.storeName}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Store className="w-4 h-4" />
                  <span>
                    {switchingStore === storeData.storeName 
                      ? 'Switching...' 
                      : storeData.storeName
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No other stores available</p>
        )}
      </div>

      {/* Logout Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this delivery charge? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDeliveryCharge(confirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreSettings;