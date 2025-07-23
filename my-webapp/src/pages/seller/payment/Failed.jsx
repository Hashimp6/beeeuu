import React from 'react';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';

const PaymentFailed = () => {
  const goHome = () => {
    window.location.href = '/';
  };

  const retryPayment = () => {
    window.location.href = '/subscription';
  };

  const contactSupport = () => {
    // You can replace this with your support email or chat system
    window.location.href = 'mailto:support@yourapp.com?subject=Payment Failed - Need Help';
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-gray-900 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-700">
        {/* Failed Animation */}
        <div className="relative mb-6">
          <XCircle className="w-20 h-20 text-red-500 mx-auto" />
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-red-500/20 animate-pulse"></div>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-red-400">Payment Failed</h1>
        <p className="text-gray-300 mb-8">
          We couldn't process your payment. This might be due to insufficient funds, 
          network issues, or other technical problems.
        </p>

        {/* Common Issues */}
        <div className="bg-gray-900/50 rounded-xl p-6 mb-6 text-left">
          <h3 className="text-lg font-semibold mb-4 text-center text-yellow-400">Common Issues</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Insufficient balance in your account</li>
            <li>• Poor internet connection</li>
            <li>• Card/UPI app temporary issues</li>
            <li>• Bank server downtime</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={retryPayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <button
            onClick={contactSupport}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Contact Support
          </button>

          <button
            onClick={goHome}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 p-4 bg-blue-900/30 rounded-xl">
          <p className="text-xs text-blue-300 mb-2">💡 Pro Tip:</p>
          <p className="text-xs text-gray-300">
            Try using a different payment method or check your internet connection before retrying.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;