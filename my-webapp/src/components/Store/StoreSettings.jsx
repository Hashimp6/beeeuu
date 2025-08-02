import React, { useState } from 'react';
import axios from 'axios';
import { LogOut } from 'lucide-react';
import { SERVER_URL } from '../../Config';

const paymentOptions = ['Cash on Delivery', 'UPI', 'Card', 'Net Banking','Razorpay'];
const serviceOptions = ['Eat In', 'Take Away / Parcel', 'collection', 'Delivery'];

const StoreSettings = ({ store, logout }) => {
  const [newUpi, setNewUpi] = useState(store.upi);
  const [selectedPayments, setSelectedPayments] = useState(store.paymentType || []);
  const [selectedServices, setSelectedServices] = useState(store.serviceType || []);
  const [loading, setLoading] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
const [isFetchingKeys, setIsFetchingKeys] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const toggleItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };
  const handleViewRazorpay = async () => {
    if (showKeys) {
      setShowKeys(false);
      return;
    }
  
    setIsFetchingKeys(true);
    try {
      const res = await axios.get(`${SERVER_URL}/stores/${store._id}/razorpay`);
      setRazorpayKeyId(res.data.key_id || ' ');
      setRazorpayKeySecret(res.data.key_secret || ' ');
      setShowKeys(true);
    } catch (err) {
      console.error('Failed to fetch Razorpay credentials:', err);
      alert('Could not retrieve Razorpay credentials');
    } finally {
      setIsFetchingKeys(false);
    }
  };
  const handleRazorpaySave = async () => {
    if (!razorpayKeyId.trim() || !razorpayKeySecret.trim()) {
      alert("Both Key ID and Secret are required.");
      return;
    }
  
    try {
      await axios.put(`${SERVER_URL}/stores/${store._id}/razorpay`, {
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret
      });
      alert("Razorpay credentials saved securely!");
    } catch (err) {
      console.error("Error saving Razorpay credentials:", err);
      alert("Failed to save Razorpay credentials.");
    }
  };
  
  
  const handleUpiUpdate = async () => {
    if (!newUpi.trim()) return;
    try {
      await axios.put(`${SERVER_URL}/stores/${store._id}`, { upi: newUpi });
      alert('UPI updated!');
      setNewUpi('');
    } catch (err) {
      console.error('UPI update failed:', err);
      alert('Failed to update UPI');
    }
  };

  const handleUpdatePaymentTypes = async (types) => {
    setLoading(true);
    try {
      await axios.put(`${SERVER_URL}/stores/${store._id}/payment-type`, {
        paymentType: types,
      });
      alert('Payment types updated successfully');
    } catch (err) {
      console.error('Payment type update failed:', err);
      alert('Failed to update payment types');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateServiceTypes = async (types) => {
    setLoading(true);
    try {
      await axios.put(`${SERVER_URL}/stores/${store._id}/service-type`, {
        serviceType: types,
      });
      alert('Service types updated successfully');
    } catch (err) {
      console.error('Service type update failed:', err);
      alert('Failed to update service types');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Store Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* UPI Section */}
          {selectedPayments.includes('UPI') && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Store UPI</h3>
            {store.upi ? (
              <p className="text-gray-700 mb-4"><span className="font-semibold">Current UPI:</span> {store.upi}</p>
            ) : (
              <p className="text-gray-500 mb-4">No UPI ID set yet.</p>
            )}
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Enter new UPI ID"
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                value={newUpi}
                onChange={(e) => setNewUpi(e.target.value)}
              />
              <button
                onClick={handleUpiUpdate}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                {store.upi ? "Update" : "Add"} UPI
              </button>
            </div>
          </div>
          )}
  {selectedPayments.includes('Razorpay') && (
  <div className="bg-white rounded-xl shadow-lg p-6 col-span-1">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Razorpay Credentials</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Key ID</label>
        <input
          type="text"
          className="border border-gray-300 rounded-lg px-4 py-2 w-full"
          placeholder="Enter Razorpay Key ID"
          value={showKeys || !store.razorpay?.key_id ? razorpayKeyId : '••••••••'}
          onChange={(e) => setRazorpayKeyId(e.target.value)}
          disabled={!showKeys && store.razorpay?.key_id}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Key Secret</label>
        <input
          type="text"
          className="border border-gray-300 rounded-lg px-4 py-2 w-full"
          placeholder="Enter Razorpay Secret"
          value={showKeys || !store.razorpay?.key_secret ? razorpayKeySecret : '••••••••'}
          onChange={(e) => setRazorpayKeySecret(e.target.value)}
          disabled={!showKeys && store.razorpay?.key_secret}
        />
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleRazorpaySave}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
        >
          {store.razorpay?.key_id ? "Update" : "Add"} Razorpay Credentials
        </button>

        {store.razorpay?.key_id && (
          <button
            onClick={handleViewRazorpay}
            disabled={isFetchingKeys}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {showKeys ? 'Hide' : isFetchingKeys ? 'Loading...' : 'View'}
          </button>
        )}
      </div>
    </div>
  </div>
)}




          {/* Payment Options Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            {paymentOptions.map((option) => (
              <label key={option} className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={selectedPayments.includes(option)}
                  onChange={() => toggleItem(selectedPayments, setSelectedPayments, option)}
                />
                <span>{option}</span>
              </label>
            ))}
            <button
              onClick={() => handleUpdatePaymentTypes(selectedPayments)}
              disabled={loading}
              className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Payment Types'}
            </button>
          </div>

          {/* Service Options Section - Only for Hotel/Restaurant */}
          {store.category === "Hotel / Restaurent" && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Accepting Methods</h3>
              {serviceOptions.map((option) => (
                <label key={option} className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(option)}
                    onChange={() => toggleItem(selectedServices, setSelectedServices, option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
              <button
                onClick={() => handleUpdateServiceTypes(selectedServices)}
                disabled={loading}
                className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Service Types'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 border-t mt-6 ml-6">
        <button
          onClick={logout}
          className="flex items-center space-x-2 text-red-600 font-semibold hover:text-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default StoreSettings;
