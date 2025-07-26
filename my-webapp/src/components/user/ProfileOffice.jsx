import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/UserContext';
import { SERVER_URL } from '../../Config';
import axios from 'axios';
import { X, Calendar, Tag, Percent, IndianRupee } from 'lucide-react';

const OffersStories = ({ storeId }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    fetchOffers();
  }, [storeId]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${SERVER_URL}/offers/store/${storeId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      setOffers(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch offers');

    } finally {
      setLoading(false);
    }
  };

  const handleOfferClick = (offer) => {
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOffer(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateSavings = (original, offer) => {
    return original - offer;
  };

  if (loading) {
    return (
      <div className="w-full p-4">
        <div className="flex space-x-3 overflow-x-auto">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4">
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      </div>
    );
  }

  if (!offers.length) {
    return (
      <div className="w-full p-4">
        <div className="text-gray-500 text-center py-4">
          No offers available
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">Shop Offers</h2>
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {offers.map((offer, index) => (
            <div
              key={offer._id || index}
              onClick={() => handleOfferClick(offer)}
              className="flex-shrink-0 cursor-pointer group"
            >
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gradient-to-r from-purple-500 to-pink-500 p-0.5 group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-white rounded-md overflow-hidden">
                  {offer.image ? (
                    <img
                      src={offer.image}
                      alt={offer.title || 'Offer'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold text-center px-1">
                        {offer.discountValue || offer.title?.substring(0, 10) || 'Offer'}
                      </span>
                    </div>
                  )}
                </div>
           
              </div>
              
              {/* Offer title */}
              <div className="mt-1 text-xs text-center text-gray-600 max-w-20 truncate">
                {offer.title || `Offer ${index + 1}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="relative">
              {selectedOffer.image && (
                <div className="h-48 w-full overflow-hidden rounded-t-2xl">
                  <img
                    src={selectedOffer.image}
                    alt={selectedOffer.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition-all"
              >
                <X size={20} className="text-gray-700" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {selectedOffer.title}
              </h3>

              {/* Description */}
              {selectedOffer.description && (
                <p className="text-gray-600 mb-4">
                  {selectedOffer.description}
                </p>
              )}

              {/* Pricing Section */}
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Original Price:</span>
                  <span className="text-lg font-semibold text-gray-500 line-through flex items-center">
                    <IndianRupee size={16} />
                    {selectedOffer.originalPrice}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Offer Price:</span>
                  <span className="text-2xl font-bold text-green-600 flex items-center">
                    <IndianRupee size={20} />
                    {selectedOffer.offerPrice}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">You Save:</span>
                  <span className="text-lg font-semibold text-red-500 flex items-center">
                    <IndianRupee size={16} />
                    {calculateSavings(selectedOffer.originalPrice, selectedOffer.offerPrice)}
                  </span>
                </div>
              </div>

              {/* Discount Badge */}
              <div className="flex items-center mb-4">
                <div className="bg-red-500 text-white px-3 py-1 rounded-full flex items-center">
                  <span className="font-semibold">
                    {selectedOffer.discountValue}
                    {selectedOffer.discountType === 'percentage' ? '% OFF' : ' OFF'}
                  </span>
                </div>
              </div>

              {/* Validity */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                  <Calendar size={16} className="text-blue-600 mr-2" />
                  <span className="font-semibold text-blue-800">Offer Validity</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Valid From:</span> {formatDate(selectedOffer.validFrom)}
                  </div>
                  <div>
                    <span className="font-medium">Valid Till:</span> {formatDate(selectedOffer.validTo)}
                  </div>
                </div>
              </div>

              {/* Category */}
              {selectedOffer.category && (
                <div className="flex items-center mb-4">
                  <Tag size={16} className="text-gray-500 mr-2" />
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {selectedOffer.category}
                  </span>
                </div>
              )}

              {/* Premium Badge */}
              {selectedOffer.isPremium && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full inline-flex items-center mb-4">
                  <span className="text-sm font-semibold">★ Premium Offer</span>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OffersStories;