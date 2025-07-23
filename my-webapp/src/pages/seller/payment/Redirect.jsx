import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, ArrowRight, Home, RefreshCw } from 'lucide-react';

const RedirectStatusScreens = () => {
  const [status, setStatus] = useState('pending'); // 'pending', 'success', 'failure'
  const [countdown, setCountdown] = useState(5);

  // Simulate redirect process
  useEffect(() => {
    if (status === 'pending') {
      const timer = setTimeout(() => {
        // Simulate random success/failure for demo
        const isSuccess = Math.random() > 0.3;
        setStatus(isSuccess ? 'success' : 'failure');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Countdown for auto-redirect on success
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      // Auto redirect would happen here
      console.log('Auto-redirecting...');
    }
  }, [status, countdown]);

  const handleRetry = () => {
    setStatus('pending');
    setCountdown(5);
  };

  const handleManualRedirect = () => {
    console.log('Manual redirect triggered');
  };

  const PendingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-slate-200">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Processing Redirect</h2>
          <p className="text-slate-600">Please wait while we prepare your destination...</p>
        </div>
        
        <div className="space-y-4">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
          <p className="text-sm text-slate-500">This may take a few moments</p>
        </div>
      </div>
    </div>
  );

  const SuccessScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-teal-200">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <CheckCircle className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Redirect Successful!</h2>
          <p className="text-slate-600 mb-4">You will be redirected automatically in {countdown} seconds</p>
        </div>
        
        <div className="space-y-3">
          <div className="w-full bg-teal-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full transition-all duration-1000" 
              style={{width: `${((5 - countdown) / 5) * 100}%`}}
            ></div>
          </div>
          
          <button
            onClick={handleManualRedirect}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            Continue Now
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setStatus('pending')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  const FailureScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-red-200">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Redirect Failed</h2>
          <p className="text-slate-600 mb-4">We encountered an issue while processing your request</p>
        </div>
        
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-red-700">
              <strong>Error:</strong> Unable to establish connection to destination server
            </p>
          </div>
          
          <button
            onClick={handleRetry}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <button
            onClick={() => setStatus('pending')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  // Demo controls
  const DemoControls = () => (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 rounded-xl p-4 text-white">
      <p className="text-sm mb-2 font-medium">Demo Controls:</p>
      <div className="flex gap-2">
        <button
          onClick={() => setStatus('pending')}
          className="px-3 py-1 bg-teal-600 rounded-lg text-xs hover:bg-teal-700 transition-colors"
        >
          Pending
        </button>
        <button
          onClick={() => setStatus('success')}
          className="px-3 py-1 bg-green-600 rounded-lg text-xs hover:bg-green-700 transition-colors"
        >
          Success
        </button>
        <button
          onClick={() => setStatus('failure')}
          className="px-3 py-1 bg-red-600 rounded-lg text-xs hover:bg-red-700 transition-colors"
        >
          Failure
        </button>
      </div>
    </div>
  );

  return (
    <>
      {status === 'pending' && <PendingScreen />}
      {status === 'success' && <SuccessScreen />}
      {status === 'failure' && <FailureScreen />}
      <DemoControls />
    </>
  );
};

export default RedirectStatusScreens;