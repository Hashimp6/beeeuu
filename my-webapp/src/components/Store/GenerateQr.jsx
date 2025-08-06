import React, { useState, useRef, useEffect } from 'react';
import { Download, Link, QrCode, Sparkles, Camera, Star } from 'lucide-react';

const RestaurantQRGenerator = () => {
  const [menuUrl, setMenuUrl] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrError, setQrError] = useState('');
  const canvasRef = useRef(null);

  // Validate and format URL
  const formatUrl = (url) => {
    if (!url) return '';
    
    // Remove whitespace
    url = url.trim();
    
    // Add https:// if no protocol is specified
    if (!url.match(/^https?:\/\//)) {
      url = 'https://' + url;
    }
    
    return url;
  };

  // Validate URL format
  const isValidUrl = (url) => {
    try {
      const formattedUrl = formatUrl(url);
      new URL(formattedUrl);
      return true;
    } catch {
      return false;
    }
  };

  // Generate QR code using QR Server API
  const generateQRCode = () => {
    if (!menuUrl || !restaurantName) return;
    
    // Validate URL first
    if (!isValidUrl(menuUrl)) {
      setQrError('Please enter a valid URL (e.g., https://yourmenu.com)');
      return;
    }
    
    setQrError('');
    setIsGenerating(true);
    
    const formattedUrl = formatUrl(menuUrl);
    
    // Use QR Server API with better error correction and larger size
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(formattedUrl)}&format=png&margin=20&ecc=M`;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set high resolution canvas
    canvas.width = 800;
    canvas.height = 1000;
    
    // Create premium background with texture
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#1a1a1a');
    bgGradient.addColorStop(0.3, '#2d2d2d');
    bgGradient.addColorStop(0.7, '#1a1a1a');
    bgGradient.addColorStop(1, '#0f0f0f');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle texture overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < canvas.width; i += 40) {
      for (let j = 0; j < canvas.height; j += 40) {
        if ((i + j) % 80 === 0) {
          ctx.fillRect(i, j, 20, 1);
          ctx.fillRect(i, j, 1, 20);
        }
      }
    }
    
    // Restaurant name with premium typography
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px "Times New Roman", serif';
    ctx.letterSpacing = '3px';
    
    // Add text shadow effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillText(restaurantName.toUpperCase(), canvas.width / 2, 80);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Golden decorative line
    const lineGradient = ctx.createLinearGradient(canvas.width / 2 - 200, 100, canvas.width / 2 + 200, 100);
    lineGradient.addColorStop(0, 'transparent');
    lineGradient.addColorStop(0.2, '#d4af37');
    lineGradient.addColorStop(0.5, '#f4e4bc');
    lineGradient.addColorStop(0.8, '#d4af37');
    lineGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = lineGradient;
    ctx.fillRect(canvas.width / 2 - 200, 100, 400, 4);
    
    // "MENU" text with golden effect
    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 64px "Times New Roman", serif';
    ctx.fillText('MENU', canvas.width / 2, 180);
    
    // Add golden glow effect to MENU
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 20;
    ctx.fillText('MENU', canvas.width / 2, 180);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Load and draw QR code
    const qrImage = new Image();
    qrImage.crossOrigin = 'anonymous';
    
    qrImage.onload = () => {
      // QR code positioning - larger size for better scanning
      const qrSize = 320; // Increased from 280
      const qrX = canvas.width / 2 - qrSize / 2;
      const qrY = 230; // Adjusted position
      
      // Outer golden frame
      const frameGradient = ctx.createLinearGradient(qrX - 25, qrY - 25, qrX + qrSize + 25, qrY + qrSize + 25);
      frameGradient.addColorStop(0, '#d4af37');
      frameGradient.addColorStop(0.5, '#f4e4bc');
      frameGradient.addColorStop(1, '#d4af37');
      ctx.fillStyle = frameGradient;
      ctx.fillRect(qrX - 25, qrY - 25, qrSize + 50, qrSize + 50);
      
      // Inner white frame
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
      
      // Black inner border
      ctx.fillStyle = '#000000';
      ctx.fillRect(qrX - 15, qrY - 15, qrSize + 30, qrSize + 30);
      
      // White QR background with extra padding
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
      
      // Draw QR code - DO NOT add logo overlay as it can break scanning
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
      
      // Instruction text with premium styling
      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 22px "Times New Roman", serif';
      ctx.fillText('SCAN WITH YOUR PHONE CAMERA', canvas.width / 2, 630);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px "Times New Roman", serif';
      ctx.fillText('TO VIEW OUR DIGITAL MENU', canvas.width / 2, 660);
      
      // Show the actual URL for verification
      ctx.fillStyle = '#888888';
      ctx.font = '14px monospace';
      const displayUrl = formattedUrl.length > 50 ? formattedUrl.substring(0, 47) + '...' : formattedUrl;
      ctx.fillText(displayUrl, canvas.width / 2, 690);
      
      // Decorative elements
      ctx.fillStyle = '#d4af37';
      ctx.font = '20px serif';
      ctx.fillText('✦ ◆ ✦', canvas.width / 2, 720);
      
      // Camera icon and instruction - with proper padding
      ctx.fillStyle = 'rgba(212, 175, 55, 0.9)';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('📱 POINT YOUR CAMERA HERE', canvas.width / 2, 610);
      
      // Premium features list - adjusted position to avoid overlap
      ctx.fillStyle = '#cccccc';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      const features = [
        '• Browse our complete menu',
        '• View detailed descriptions & prices',
        '• Place orders directly',
        '• Secure payment options'
      ];
      
      features.forEach((feature, index) => {
        ctx.fillText(feature, canvas.width / 2 - 200, 740 + index * 22);
      });
      
      // Table Number Section - Positioned on the right side (adjusted)
      // TABLE NUMBER heading with golden effect (positioned right)
      ctx.textAlign = 'center';
      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 28px "Times New Roman", serif';
      ctx.shadowColor = '#d4af37';
      ctx.shadowBlur = 1;
      ctx.fillText('TABLE NUMBER', canvas.width - 150, 740);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      
      // Large white box for table number (positioned right)
      const boxWidth = 160;
      const boxHeight = 70;
      const boxX = canvas.width - 150 - boxWidth / 2;
      const boxY = 760;
      
      // Outer golden frame for table number box
      const tableFrameGradient = ctx.createLinearGradient(boxX - 8, boxY - 8, boxX + boxWidth + 8, boxY + boxHeight + 8);
      tableFrameGradient.addColorStop(0, '#d4af37');
      tableFrameGradient.addColorStop(0.5, '#f4e4bc');
      tableFrameGradient.addColorStop(1, '#d4af37');
      ctx.fillStyle = tableFrameGradient;
      ctx.fillRect(boxX - 8, boxY - 8, boxWidth + 16, boxHeight + 16);
      
      // White box for writing table number
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      
      // Subtle inner border
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX + 4, boxY + 4, boxWidth - 8, boxHeight - 8);
      
     
      // SerchBy branding section - moved down to accommodate all content
      ctx.textAlign = 'center';
      ctx.fillStyle = '#16a085';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('SerchBy', canvas.width / 2, 860);
      
      ctx.fillStyle = '#888888';
      ctx.font = '14px sans-serif';
      ctx.fillText('Restaurent order automation system', canvas.width / 2, 885);
      
      // Website
      ctx.fillStyle = '#666666';
      ctx.font = '12px sans-serif';
      ctx.fillText('www.serchby.com phn:7012455400', canvas.width / 2, 905);
      
      // Bottom decorative border - adjusted to fit all content
      const bottomGradient = ctx.createLinearGradient(0, 940, canvas.width, 940);
      bottomGradient.addColorStop(0, 'transparent');
      bottomGradient.addColorStop(0.2, '#d4af37');
      bottomGradient.addColorStop(0.8, '#d4af37');
      bottomGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = bottomGradient;
      ctx.fillRect(0, 940, canvas.width, 6);
      
      // Corner decorative elements
      ctx.fillStyle = '#d4af37';
      ctx.font = '24px serif';
      ctx.textAlign = 'left';
      ctx.fillText('◆', 30, 50);
      ctx.textAlign = 'right';
      ctx.fillText('◆', canvas.width - 30, 50);
      ctx.textAlign = 'left';
      ctx.fillText('◆', 30, canvas.height - 30);
      ctx.textAlign = 'right';
      ctx.fillText('◆', canvas.width - 30, canvas.height - 30);
      
      setIsGenerating(false);
    };
    
    qrImage.onerror = () => {
      setIsGenerating(false);
      setQrError('Failed to generate QR code. Please check your URL and try again.');
    };
    
    qrImage.src = qrApiUrl;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `${restaurantName.replace(/\s+/g, '_')}_Premium_QR_Menu.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  // Test URL function
  const testUrl = () => {
    if (menuUrl) {
      const formattedUrl = formatUrl(menuUrl);
      window.open(formattedUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Premium Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-6 p-6 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 rounded-3xl shadow-2xl">
              <Star className="text-white mr-3 animate-spin" size={32} />
              <h1 className="text-4xl font-bold text-white">Premium QR Menu Creator</h1>
              <Star className="text-white ml-3 animate-spin" size={32} />
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Create professional-grade QR menu designs that impress customers and boost your restaurant's image
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Simple Input Section */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-400 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <QrCode className="text-white" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Quick Setup</h2>
                  <p className="text-gray-400">Just 2 fields to create magic</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-3 text-lg flex items-center">
                    <Sparkles className="mr-2 text-yellow-400" size={20} />
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="e.g., The Golden Spoon"
                    className="w-full px-6 py-4 bg-white/20 backdrop-blur border border-white/30 rounded-2xl text-white placeholder-white/60 focus:ring-4 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all duration-300 text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-semibold mb-3 text-lg flex items-center">
                    <Link className="mr-2 text-teal-400" size={20} />
                    Menu Website URL
                  </label>
                  <input
                    type="url"
                    value={menuUrl}
                    onChange={(e) => {
                      setMenuUrl(e.target.value);
                      setQrError('');
                    }}
                    placeholder="yourmenu.com or https://yourmenu.com"
                    className={`w-full px-6 py-4 bg-white/20 backdrop-blur border rounded-2xl text-white placeholder-white/60 focus:ring-4 transition-all duration-300 text-lg ${
                      qrError ? 'border-red-400 focus:ring-red-400/50 focus:border-red-400' : 'border-white/30 focus:ring-teal-400/50 focus:border-teal-400'
                    }`}
                  />
                  {qrError && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {qrError}
                    </p>
                  )}
                  {menuUrl && isValidUrl(menuUrl) && (
                    <div className="mt-2 flex items-center gap-2">
                      <p className="text-green-400 text-sm">✅ Valid URL</p>
                      <button
                        onClick={testUrl}
                        className="text-teal-400 text-sm underline hover:text-teal-300"
                      >
                        Test URL
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={generateQRCode}
                  disabled={!menuUrl || !restaurantName || isGenerating || !isValidUrl(menuUrl)}
                  className="w-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black py-5 px-6 rounded-2xl font-bold text-xl hover:from-yellow-600 hover:via-yellow-500 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                      Creating Magic...
                    </>
                  ) : (
                    <>
                      <Camera size={24} />
                      Generate Premium QR Design
                    </>
                  )}
                </button>
              </div>

              {/* Quick Tips */}
              <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-white font-semibold mb-2 flex items-center">
                  <Star className="mr-2 text-yellow-400" size={16} />
                  Pro Tips for Working QR Codes
                </h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Make sure your URL actually works (test it first!)</li>
                  <li>• Use HTTPS for better security and compatibility</li>
                  <li>• Keep restaurant name concise for better display</li>
                  <li>• Print at high resolution for clearer scanning</li>
                  <li>• Test the QR code before printing many copies</li>
                </ul>
              </div>
            </div>

            {/* Premium Preview */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <Star className="text-white" size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Premium Preview</h2>
                    <p className="text-gray-400">Restaurant-grade quality</p>
                  </div>
                </div>
                
                {restaurantName && menuUrl && !isGenerating && (
                  <button
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                  >
                    <Download size={20} />
                    Download HD
                  </button>
                )}
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-4 shadow-2xl border border-white/10">
                  {restaurantName && menuUrl ? (
                    <canvas 
                      ref={canvasRef} 
                      className="max-w-full h-auto rounded-xl shadow-2xl bg-white"
                      style={{ maxHeight: '600px' }}
                    />
                  ) : (
                    <div className="py-24 text-gray-400">
                      <Camera size={80} className="mx-auto mb-6 opacity-30" />
                      <p className="text-xl mb-2">Premium QR Menu Design</p>
                      <p className="text-sm">Fill in the details to see your stunning design</p>
                    </div>
                  )}
                </div>
                
                {restaurantName && menuUrl && !isGenerating && (
                  <div className="mt-4 text-center">
                    <p className="text-green-400 font-semibold">✅ Ready for download & printing!</p>
                    <p className="text-gray-400 text-sm mt-1">High-resolution PNG • Perfect for restaurant use</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantQRGenerator;