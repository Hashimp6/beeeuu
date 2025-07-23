import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader2, XCircle, ArrowLeft, Download } from 'lucide-react';

const PaymentSuccess = () => {
  const [status, setStatus] = useState('loading'); // loading, success, failed
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get transaction ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const txnId = urlParams.get('txnId');
    
    if (txnId) {
      verifyPayment(txnId);
    } else {
      setStatus('failed');
      setError('Transaction ID not found');
    }
  }, []);

  const verifyPayment = async (txnId) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL || 'http://192.168.1.7:5500'}/payment/phonepe/status/${txnId}`);
      const data = await response.json();
      
      if (data.success && data.data.code === 'PAYMENT_SUCCESS') {
        setStatus('success');
        setTransactionDetails({
          transactionId: txnId,
          amount: data.data.data?.amount ? (data.data.data.amount / 100) : 'N/A',
          paymentMethod: data.data.data?.paymentInstrument?.type || 'PhonePe',
          timestamp: new Date().toLocaleString(),
          merchantTransactionId: data.data.data?.merchantTransactionId || txnId
        });
      } else {
        setStatus('failed');
        setError(data.data?.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setStatus('failed');
      setError('Unable to verify payment status');
    }
  };

  const goHome = () => {
    window.location.href = '/'; // or use React Router navigation
  };

  const downloadReceipt = () => {
    // Create a simple receipt
    const receiptContent = `
Payment Receipt
================
Transaction ID: ${transactionDetails?.transactionId}
Amount: ₹${transactionDetails?.amount}
Payment Method: ${transactionDetails?.paymentMethod}
Date: ${transactionDetails?.timestamp}
Status: SUCCESS

Thank you for your payment!
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${transactionDetails?.transactionId}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-r from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-500" />
          <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
          <p className="text-gray-400">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-r from-black via-gray-900 to-black text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-700">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4 text-red-400">Payment Failed</h1>
          <p className="text-gray-300 mb-6">{error || 'Something went wrong with your payment'}</p>
          
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/subscription'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={goHome}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-gray-900 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-700">
        {/* Success Animation */}
        <div className="relative mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-pulse" />
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-green-500/20 animate-ping"></div>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-green-400">Payment Successful!</h1>
        <p className="text-gray-300 mb-8">Your subscription has been activated successfully.</p>

        {/* Transaction Details */}
        {transactionDetails && (
          <div className="bg-gray-900/50 rounded-xl p-6 mb-6 text-left">
            <h3 className="text-lg font-semibold mb-4 text-center">Transaction Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Transaction ID:</span>
                <span className="text-white font-mono text-xs">{transactionDetails.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-green-400 font-semibold">₹{transactionDetails.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method:</span>
                <span className="text-white">{transactionDetails.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date & Time:</span>
                <span className="text-white">{transactionDetails.timestamp}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={downloadReceipt}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
          
          <button
            onClick={goHome}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue to Dashboard
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-6">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;