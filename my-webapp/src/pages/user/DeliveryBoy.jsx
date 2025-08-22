import React, { useState, useEffect, useRef } from 'react';
import { Camera, Phone, Navigation, QrCode, CheckCircle, X } from 'lucide-react';
import { SERVER_URL } from '../../Config';

const DeliveryBoyScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [scanning, setScanning] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setHasPermission(true);
        stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      } catch (error) {
        setHasPermission(false);
        console.error('Camera permission denied:', error);
      }
    };

    getCameraPermissions();
  }, []);

  const markAsDelivered = async () => {
    if (!orderData) return;

    try {
      const response = await fetch(`${SERVER_URL}/orders/status/${orderData._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'delivered' }),
      });

      if (response.ok) {
        setOrderData({ ...orderData, status: 'delivered' });
        alert('Order marked as delivered!');
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Could not update order status');
    }
  };

  const startScanning = async () => {
    setScanned(false);
    setShowScanner(true);
    setScanning(true);

    try {
      // Request camera with specific constraints for better QR detection
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to load before starting detection
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            console.log('Camera started, beginning QR detection...');
            setTimeout(() => scanForQRCode(), 1000); // Give camera time to focus
          });
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      // Provide specific error messages
      let errorMessage = 'Unable to access camera. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera is not supported in this browser.';
      } else {
        errorMessage += 'Please ensure you\'re using HTTPS and a supported browser.';
      }
      
      alert(errorMessage);
      setShowScanner(false);
      setScanning(false);
    }
  };

  const scanForQRCode = async () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Method 1: Try BarcodeDetector API (Chrome/Edge only)
      // eslint-disable-next-line no-undef
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
          // eslint-disable-next-line no-undef
          const barcodeDetector = new BarcodeDetector({ 
            formats: ['qr_code', 'code_128', 'code_39', 'ean_13'] 
          });
          const barcodes = await barcodeDetector.detect(canvas);
          
          if (barcodes.length > 0 && !scanned) {
            console.log("Real QR Code detected:", barcodes[0].rawValue);
            handleQRCodeDetected(barcodes[0].rawValue);
            return;
          }
        } catch (error) {
          console.error('BarcodeDetector error:', error);
        }
      }

      // Method 2: Manual QR detection simulation for demo
      // In production, install jsQR: npm install jsqr
      else {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Simulate QR detection - click anywhere on screen to trigger
        // Or wait for automatic detection
        if (Math.random() > 0.985) { // ~1.5% chance per frame
          const mockQRData = JSON.stringify({
            _id: "order_123",
            orderId: `ORD${Date.now()}`,
            orderDate: new Date().toISOString(),
            customerName: "John Doe",
            phoneNumber: "+91-9876543210",
            deliveryAddress: "123 Main Street, New Delhi, India",
            status: "out_for_delivery",
            store: {
              storeName: "Quick Mart",
              place: "Central Plaza",
              phone: "+91-9876543211"
            },
            products: [
              {
                productName: "Organic Apples",
                quantity: 2,
                totalPrice: 150
              },
              {
                productName: "Fresh Milk", 
                quantity: 1,
                totalPrice: 60
              }
            ],
            totalAmount: 210,
            deliveryFee: 30,
            platformFee: 15,
            gst: 21,
            paymentMethod: "cash",
            paymentStatus: "pending"
          });
          
          console.log("Mock QR Code detected (demo mode)");
          handleQRCodeDetected(mockQRData);
          return;
        }
      }
    }

    // Continue scanning
    if (scanning) {
      requestAnimationFrame(scanForQRCode);
    }
  };



  const handleQRCodeDetected = (data) => {
    setScanned(true);
    setScanning(false);
    setShowScanner(false);
    
    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    try {
      const parsedData = JSON.parse(data);
      setOrderData(parsedData);
    } catch (error) {
      alert('Invalid QR Code data');
      console.error('QR Code parsing error:', error);
    }
  };

  const stopScanning = () => {
    setScanning(false);
    setShowScanner(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const makePhoneCall = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const openNavigation = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://maps.google.com/maps?q=${encodedAddress}&navigate=yes`;
    window.open(googleMapsUrl, '_blank');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatCurrency = (amount) => {
    return `₹${amount}`;
  };

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Requesting camera permission...</p>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <Camera className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">No access to camera</p>
          <p className="text-gray-500 mt-2">Please enable camera permissions to scan QR codes</p>
        </div>
      </div>
    );
  }

  if (showScanner) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="relative h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-64 h-64 border-2 border-white rounded-lg"></div>
              <div className="absolute inset-0 border-2 border-transparent">
                <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-white"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-white"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-white"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-white"></div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-6 text-center">
            <p className="text-white text-lg mb-2">Scan QR Code</p>
            <p className="text-gray-300 text-sm mb-4">
              Position the QR code within the frame
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  // Manual trigger for testing
                  const mockData = JSON.stringify({
                    _id: "test_order",
                    orderId: `TEST${Date.now()}`,
                    orderDate: new Date().toISOString(),
                    customerName: "Test Customer",
                    phoneNumber: "+91-9999999999",
                    deliveryAddress: "Test Address, Test City",
                    status: "out_for_delivery",
                    store: {
                      storeName: "Test Store",
                      place: "Test Location", 
                      phone: "+91-8888888888"
                    },
                    products: [
                      {
                        productName: "Test Product",
                        quantity: 1,
                        totalPrice: 100
                      }
                    ],
                    totalAmount: 100,
                    deliveryFee: 20,
                    platformFee: 10,
                    gst: 10,
                    paymentMethod: "cash",
                    paymentStatus: "pending"
                  });
                  handleQRCodeDetected(mockData);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Test Scan
              </button>
              <button
                onClick={stopScanning}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {!orderData ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <QrCode className="h-20 w-20 text-gray-400 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
            Scan QR Code to view order details
          </h2>
          <button
            onClick={startScanning}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg flex items-center text-lg font-medium transition-colors"
          >
            <Camera className="h-6 w-6 mr-3" />
            Scan QR Code
          </button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto p-4 pb-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Order ID: {orderData.orderId}</h1>
            <p className="text-gray-600 mt-2">{formatDate(orderData.orderDate)}</p>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Details</h2>
            <div className="mb-4">
              <h3 className="text-xl font-medium text-gray-800">{orderData.customerName}</h3>
              <p className="text-gray-600 mt-1">{orderData.phoneNumber}</p>
            </div>
            <button
              onClick={() => makePhoneCall(orderData.phoneNumber)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Customer
            </button>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Delivery Address</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">{orderData.deliveryAddress}</p>
            <button
              onClick={() => openNavigation(orderData.deliveryAddress)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors"
            >
              <Navigation className="h-5 w-5 mr-2" />
              Navigate
            </button>
          </div>

          {/* Mark as Delivered Button */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <button
              onClick={markAsDelivered}
              disabled={orderData.status === 'delivered'}
              className={`w-full py-4 px-6 rounded-lg flex items-center justify-center text-white font-medium transition-colors ${
                orderData.status === 'delivered' 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <CheckCircle className="h-6 w-6 mr-3" />
              {orderData.status === 'delivered' ? 'Order Delivered' : 'Mark as Delivered'}
            </button>
          </div>

          {/* Store Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Store Details</h2>
            <h3 className="text-lg font-medium text-gray-800">{orderData.store.storeName}</h3>
            <p className="text-gray-600 mt-1">{orderData.store.place}</p>
            <p className="text-gray-600">{orderData.store.phone}</p>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h2>
            <div className="space-y-3">
              {orderData.products.map((product, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <h4 className="text-gray-800 font-medium">{product.productName}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm">Qty: {product.quantity}</p>
                    <p className="text-gray-800 font-medium">{formatCurrency(product.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-gray-800 font-medium">{formatCurrency(orderData.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee:</span>
                <span className="text-gray-800 font-medium">{formatCurrency(orderData.deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee:</span>
                <span className="text-gray-800 font-medium">{formatCurrency(orderData.platformFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST:</span>
                <span className="text-gray-800 font-medium">{formatCurrency(orderData.gst)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-gray-800 font-semibold">Payment Method:</span>
                <span className="text-gray-800 font-semibold">{orderData.paymentMethod.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-800 font-semibold">Payment Status:</span>
                <span className={`font-semibold ${
                  orderData.paymentStatus === 'pending' ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {orderData.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Scan New Order Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <button
              onClick={() => {
                setOrderData(null);
                startScanning();
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-4 px-6 rounded-lg flex items-center justify-center font-medium transition-colors"
            >
              <QrCode className="h-5 w-5 mr-3" />
              Scan New Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoyScreen;