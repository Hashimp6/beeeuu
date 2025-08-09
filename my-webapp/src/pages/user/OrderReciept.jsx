import React, { useRef } from 'react';
import { CheckCircle, Calendar, MapPin, Phone, Mail, Package, CreditCard, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderReceipt = () => {
    const navigate = useNavigate();
    const receiptRef = useRef();
    const location = useLocation(); // ✅ get location state
    const orderData = location.state?.orderData; // ✅ safely get passed order data

  const order = orderData ;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'delivered': return 'text-blue-600 bg-blue-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handlePrint = () => {
    window.print();
  };
  const handleDownload = () => {
    const content = receiptRef.current.innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OrderReceipt_${order._id || 'receipt'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };
  

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div ref={receiptRef} className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Order Confirmed!</h1>
                <p className="text-green-100">Thank you for your purchase</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-100">Order ID</p>
              <p className="text-lg font-mono font-bold">{order.orderId}</p>
            </div>
          </div>
        </div>
{/* OTP Section */}
<div className="bg-blue-50 border-l-4 border-blue-400 p-4 m-6">
  <div className="flex items-center">
    <div className="flex-shrink-0">
      <Clock className="h-5 w-5 text-blue-400" />
    </div>
    <div className="ml-3">
      <p className="text-sm text-blue-700">
        <strong>Delivery OTP: </strong>
        <span className="font-mono text-lg font-bold text-blue-800">{order.otp}</span>
      </p>
      <p className="text-xs text-blue-600 mt-1">
        Share this OTP with the delivery person to receive your order
      </p>

      {/* ⚠️ Guest user warning */}
      <p className="mt-3 text-sm text-red-600 font-medium">
        ⚠️ If you are a guest user, you won't be able to access this receipt later.
      </p>
    </div>
  </div>
</div>


        {/* Order Details */}
        <div className="p-6 space-y-6">
          {/* Customer & Delivery Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Customer Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-600">Name:</span>
                  <span className="text-gray-800">{order.customerName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-800">{order.phoneNumber}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-800">{order.buyerId.email}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Delivery Address</h3>
              <div className="flex items-start space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <span className="text-gray-800">{order.deliveryAddress}</span>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Order Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="text-gray-800">{formatDate(order.orderDate)}</span>
                </div>
              
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="text-gray-800 uppercase">{order.paymentMethod}</span>
                </div>
               
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Seller Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-800">{order.sellerName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-600">Store ID:</span>
                  <span className="text-gray-600 text-xs font-mono">{order.sellerId._id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Order Items</h3>
            <div className="space-y-3">
            {order.products.map((product, index) => (
  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
        <Package className="w-6 h-6 text-gray-500" />
      </div>
      <div>
        <p className="font-medium text-gray-800">{product.productName || product.productId?.name || 'Product Item'}</p>
        <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
        <p className="text-sm text-gray-600">Unit Price: {formatCurrency(product.unitPrice)}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-semibold text-gray-800">{formatCurrency(product.totalPrice)}</p>
      <p className="text-sm text-gray-500">Subtotal</p>
    </div>
  </div>
))}

            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>Total Items: {order.totalItems}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(order.totalAmount)}</p>
                <p className="text-sm text-gray-600">Total Amount</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={handlePrint}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Print Receipt
            </button>
            <button
  onClick={handleDownload}
  className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
>
  Download Receipt
</button>
            <button
    onClick={() => navigate('/home')} // ✅ Go to home
    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
  >
    Back to Home
  </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
          <p>Thank you for shopping with us!</p>
          <p className="mt-1">For any queries, please contact customer support.</p>
        </div>
      </div>
    </div>
  );
};

export default OrderReceipt;