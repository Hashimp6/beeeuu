import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Clock, CheckCircle, XCircle, AlertCircle, User, Phone, MapPin, 
  Check, X, RefreshCw, Package, Filter, Truck, DollarSign, RotateCcw, Eye,
  IndianRupee, Printer, Volume2, VolumeX,
  RefreshCcw
} from 'lucide-react';

import { SERVER_URL } from '../../Config';
import { useAuth } from '../../context/UserContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { showErrorToast, showSuccessToast } from '../user/Tost';
import QRCode from 'qrcode';


// Enhanced thermal printing function that bypasses A4 format
const printThermalReceiptDirect = (order, store) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate totals
  const itemTotal = order.products?.reduce((sum, item) => sum + item.totalPrice, 0) || order.totalAmount;
  const deliveryFee = order.deliveryFee || 0;
  const platformFee = order.platformFee || 0;
  const gst = order.gst || 0;
  const grandTotal = itemTotal + deliveryFee + platformFee + gst;

  // Create QR Code data object
  const qrData = {
    orderId: order.orderId,
    customerName: order.customerName,
    phoneNumber: order.phoneNumber,
    orderDate: order.orderDate,
    deliveryAddress: order.deliveryAddress,
    products: order.products?.map(product => ({
      productName: product.productName,
      quantity: product.quantity,
      totalPrice: product.totalPrice
    })) || [],
    totalAmount: order.totalAmount || grandTotal,
    deliveryFee: deliveryFee,
    platformFee: platformFee,
    gst: gst,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    store: {
      storeName: store?.storeName,
      place: store?.place,
      phone: store?.phone
    },
    printedAt: new Date().toISOString()
  };

  // Convert to JSON string for QR code
  const qrCodeData = JSON.stringify(qrData);
  
  // Generate QR code URL using QR Server API (free service)
  const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeData)}`;

  // Thermal receipt HTML with forced 80mm width and QR code
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt #${order.orderId}</title>
      <style>
        /* Force thermal printer settings */
        @page {
          size: 80mm auto !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body {
          width: 80mm !important;
          max-width: 80mm !important;
          margin: 0 !important;
          padding: 2mm !important;
          font-family: 'Courier New', monospace !important;
          font-size: 8pt !important;
          line-height: 1.1 !important;
          color: #000 !important;
          background: #fff !important;
          overflow-x: hidden !important;
        }
        
        .receipt {
          width: 100% !important;
          max-width: 76mm !important;
        }
        
        /* Typography */
        .bold { font-weight: bold !important; }
        .center { text-align: center !important; }
        .left { text-align: left !important; }
        .right { text-align: right !important; }
        
        /* Header */
        .header {
          text-align: center;
          margin-bottom: 4px;
          padding-bottom: 2px;
          border-bottom: 1px solid #000;
        }
        
        .brand-name {
          font-size: 12pt !important;
          font-weight: bold !important;
          margin-bottom: 1px;
        }
        
        .restaurant-name {
          font-size: 9pt !important;
          font-weight: bold !important;
          margin: 1px 0;
        }
        
        .restaurant-details {
          font-size: 7pt !important;
          margin: 0.5px 0;
        }
        
        /* Order ID */
        .order-id {
          background: #000 !important;
          color: #fff !important;
          text-align: center;
          padding: 3px !important;
          margin: 4px 0;
          font-weight: bold !important;
          font-size: 10pt !important;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        /* Info sections */
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 1px 0;
          font-size: 8pt !important;
        }
        
        .info-label { font-weight: normal; }
        .info-value { font-weight: bold; }
        
        /* Customer box */
        .customer-box {
          border: 1px solid #000;
          padding: 3px;
          margin: 4px 0;
          font-size: 8pt !important;
        }
        
        .customer-title {
          text-align: center;
          font-weight: bold !important;
          margin-bottom: 2px;
          text-decoration: underline;
        }
        
        /* Items */
        .items-header {
          background: #000 !important;
          color: #fff !important;
          padding: 2px;
          text-align: center;
          font-weight: bold !important;
          font-size: 9pt !important;
          margin: 4px 0 2px 0;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        .items-table-header {
          display: flex;
          font-weight: bold !important;
          padding: 1px 0;
          border-bottom: 1px solid #000;
          font-size: 7pt !important;
        }
        
        .item-col-name { flex: 2.5; }
        .item-col-qty { width: 25px; text-align: center; }
        .item-col-price { width: 45px; text-align: right; }
        
        .item-row {
          display: flex;
          padding: 2px 0;
          border-bottom: 1px dotted #999;
          font-size: 8pt !important;
        }
        
        /* Bill summary */
        .bill-summary {
          margin: 4px 0;
          border: 1px solid #000;
          padding: 3px;
        }
        
        .bill-title {
          text-align: center;
          font-weight: bold !important;
          font-size: 9pt !important;
          margin-bottom: 3px;
          text-decoration: underline;
        }
        
        .bill-line {
          display: flex;
          justify-content: space-between;
          margin: 1px 0;
          font-size: 8pt !important;
        }
        
        .bill-total {
          border-top: 1px solid #000;
          margin-top: 2px;
          padding-top: 2px;
          font-weight: bold !important;
          font-size: 10pt !important;
        }
        
        /* QR Code Section */
        .qr-section {
          text-align: center;
          margin: 6px 0;
          padding: 4px;
          border: 1px dashed #000;
        }
        
        .qr-title {
          font-size: 8pt !important;
          font-weight: bold !important;
          margin-bottom: 3px;
        }
        
        .qr-code {
          margin: 4px 0;
        }
        
        .qr-code img {
          width: 40mm !important;
          height: 40mm !important;
          border: 1px solid #ccc;
        }
        
        .qr-description {
          font-size: 6pt !important;
          margin-top: 2px;
          line-height: 1.2;
        }
        
        /* Footer */
        .footer {
          text-align: center;
          margin-top: 6px;
          padding-top: 3px;
          border-top: 1px dashed #000;
          font-size: 7pt !important;
        }
        
        .thank-you {
          font-size: 10pt !important;
          font-weight: bold !important;
          margin: 3px 0;
        }
        
        /* Separators */
        .line-separator {
          border-top: 1px solid #000;
          margin: 2px 0;
        }
        
        .dashed-separator {
          border-top: 1px dashed #000;
          margin: 3px 0;
        }
        
        /* Print specific overrides */
        @media print {
          html, body {
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 1mm !important;
            font-size: 7pt !important;
          }
          
          @page {
            size: 80mm auto !important;
            margin: 0 !important;
          }
          
          .no-print { display: none !important; }
          
          .order-id, .items-header {
            background: #000 !important;
            color: #fff !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .qr-code img {
            width: 35mm !important;
            height: 35mm !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        
        <!-- Header -->
        <div class="header">
          <div class="brand-name">SERCHBY</div>
          <div class="restaurant-name">${store?.storeName || 'RESTAURANT NAME'}</div>
          <div class="restaurant-details">${store?.place || 'Location'}</div>
          <div class="restaurant-details">Tel: ${store?.phone || '+91-XXXXXXXXXX'}</div>
        </div>
        
        <!-- Order ID -->
        <div class="order-id">ORDER #${order.orderId}</div>
        
        <!-- Order Details -->
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span class="info-value">${formatDate(order.orderDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Time:</span>
          <span class="info-value">${formatTime(order.orderDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Type:</span>
          <span class="info-value">DELIVERY</span>
        </div>
        
        <div class="line-separator"></div>
        
        <!-- Customer Details -->
        <div class="customer-box">
          <div class="customer-title">DELIVERY TO</div>
          <div class="info-row">
            <span>Name:</span>
            <span class="bold">${order.customerName}</span>
          </div>
          <div class="info-row">
            <span>Phone:</span>
            <span class="bold">${order.phoneNumber}</span>
          </div>
          <div style="font-size: 7pt; margin-top: 2px;">
            <strong>Address:</strong><br>
            ${order.deliveryAddress}
          </div>
        </div>
        
        <!-- Items -->
        <div class="items-header">ORDER DETAILS</div>
        
        <div class="items-table-header">
          <span class="item-col-name">Item</span>
          <span class="item-col-qty">Qty</span>
          <span class="item-col-price">Total</span>
        </div>
        
        ${order.products?.map((product, index) => `
          <div class="item-row">
            <div class="item-col-name bold">${product.productName}</div>
            <div class="item-col-qty bold">${product.quantity}</div>
            <div class="item-col-price bold">₹${product.totalPrice}</div>
          </div>
        `).join('') || '<div class="item-row"><div class="item-col-name">No items</div><div class="item-col-qty">-</div><div class="item-col-price">-</div></div>'}
        
        <!-- Bill Summary -->
        <div class="bill-summary">
          <div class="bill-title">PAYMENT BREAKDOWN</div>
          
          <div class="bill-line">
            <span>Items (${order.products?.length || 0})</span>
            <span>₹${itemTotal.toFixed(2)}</span>
          </div>
          
          <div class="bill-line">
            <span>Delivery Fee</span>
            <span>${deliveryFee === 0 ? 'FREE' : '₹' + deliveryFee.toFixed(2)}</span>
          </div>
          
          ${platformFee > 0 ? `
          <div class="bill-line">
            <span>Platform Fee</span>
            <span>₹${platformFee.toFixed(2)}</span>
          </div>
          ` : ''}
          
          ${gst > 0 ? `
          <div class="bill-line">
            <span>GST & Taxes</span>
            <span>₹${gst.toFixed(2)}</span>
          </div>
          ` : ''}
          
          <div class="bill-line bill-total">
            <span>TOTAL TO PAY</span>
            <span>₹${(order.totalAmount || grandTotal).toFixed(2)}</span>
          </div>
        </div>
        
        <!-- Payment Details -->
        <div class="customer-box">
          <div class="customer-title">PAYMENT INFO</div>
          <div class="info-row">
            <span>Method:</span>
            <span class="bold">${order.paymentMethod?.toUpperCase() || 'COD'}</span>
          </div>
          <div class="info-row">
            <span>Status:</span>
            <span class="bold">${order.paymentStatus?.toUpperCase() || 'PENDING'}</span>
          </div>
        </div>
        
        <!-- QR Code Section -->
        <div class="qr-section">
          <div class="qr-title">SCAN FOR ORDER DATA</div>
          <div class="qr-code">
            <img src="${qrCodeURL}" alt="Order QR Code" />
          </div>
         
        </div>
        
        <div class="dashed-separator"></div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="thank-you">THANK YOU!</div>
          <div>Enjoy your meal!</div>
          <div>Support: ${store?.phone || '+91-XXXXXXXXXX'}</div>
          <div style="margin-top: 4px; font-size: 6pt;">
            Printed: ${formatDate(new Date().toISOString())}
          </div>
        </div>
        
      </div>
    </body>
    </html>
  `;

  // Force direct printing without browser dialog
  const printDirect = () => {
    // Method 1: Use iframe (most reliable)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '80mm';
    iframe.style.height = 'auto';
    
    document.body.appendChild(iframe);
    
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(receiptHTML);
    doc.close();
    
    // Auto-print after content loads
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          
          // Clean up
          setTimeout(() => {
            if (iframe.parentNode) {
              document.body.removeChild(iframe);
            }
          }, 2000);
        } catch (error) {
          console.error('Print error:', error);
          // Fallback to popup method
          printViaPopup();
        }
      }, 300);
    };
  };

  // Fallback popup method
  const printViaPopup = () => {
    const printWindow = window.open('', '_blank', 
      'width=300,height=600,scrollbars=no,resizable=no,toolbar=no,menubar=no'
    );
    
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => printWindow.close(), 1000);
        }, 100);
      };
    } else {
      alert('Please allow popups for thermal printing or check your printer settings.');
    }
  };

  // Execute printing
  printDirect();
  
  // Return the QR data for testing/debugging purposes
  console.log('QR Code Data:', qrData);
  return qrData;
};

// Usage: Replace your existing print button handler with this
const printThermalReceipt = (order, store) => {
  return printThermalReceiptDirect(order, store);
};

// Helper function to manually get QR data without printing
const getOrderQRData = (order, store) => {
  const itemTotal = order.products?.reduce((sum, item) => sum + item.totalPrice, 0) || order.totalAmount;
  const deliveryFee = order.deliveryFee || 0;
  const platformFee = order.platformFee || 0;
  const gst = order.gst || 0;
  const grandTotal = itemTotal + deliveryFee + platformFee + gst;

  return {
    orderId: order.orderId,
    customerName: order.customerName,
    phoneNumber: order.phoneNumber,
    orderDate: order.orderDate,
    deliveryAddress: order.deliveryAddress,
    products: order.products?.map(product => ({
      productName: product.productName,
      quantity: product.quantity,
      totalPrice: product.totalPrice
    })) || [],
    totalAmount: order.totalAmount || grandTotal,
    deliveryFee: deliveryFee,
    platformFee: platformFee,
    gst: gst,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    store: {
      storeName: store?.storeName,
      place: store?.place,
      phone: store?.phone
    },
    printedAt: new Date().toISOString()
  };
};

// COD Table Print Receipt Component - Add this after PrintReceipt component
const CODTablePrintReceipt = ({ tableData, tableName, store, onClose }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>COD Receipt - ${tableName}</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              margin: 0; 
              padding: 15px; 
              line-height: 1.3; 
              font-size: 12px;
            }
            .receipt { 
              max-width: 300px; 
              margin: 0 auto; 
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #000; 
              padding-bottom: 8px; 
              margin-bottom: 8px; 
            }
            .table-highlight {
              background: #ff6b35;
              color: #fff;
              padding: 8px 12px;
              margin: 8px 0;
              text-align: center;
              font-weight: bold;
              font-size: 16px;
              letter-spacing: 1px;
            }
            .section { 
              margin: 8px 0; 
              padding: 5px 0;
            }
            .section-title {
              font-weight: bold;
              font-size: 11px;
              margin-bottom: 5px;
              text-transform: uppercase;
              border-bottom: 1px dashed #000;
              padding-bottom: 2px;
            }
            .order-group {
              border: 1px solid #ccc;
              margin: 8px 0;
              padding: 6px;
              background: #f9f9f9;
            }
            .order-header {
              font-weight: bold;
              font-size: 11px;
              margin-bottom: 4px;
              border-bottom: 1px dashed #666;
              padding-bottom: 2px;
            }
            .items-table { 
              width: 100%;
              border-collapse: collapse;
              margin: 4px 0;
              font-size: 10px;
            }
            .items-table td {
              padding: 2px 4px;
              vertical-align: top;
            }
            .item-name { text-align: left; }
            .item-qty, .item-price, .item-total { text-align: right; }
            .order-total {
              text-align: right;
              font-weight: bold;
              margin-top: 4px;
              padding-top: 2px;
              border-top: 1px solid #666;
            }
            .grand-total {
              border: 2px solid #000;
              margin: 12px 0;
              padding: 8px;
              text-align: center;
              font-weight: bold;
              font-size: 14px;
              background: #000;
              color: #fff;
            }
            .customer-info {
              font-size: 10px;
              line-height: 1.2;
              margin: 8px 0;
              padding: 6px;
              border: 1px dashed #000;
            }
            .footer { 
              text-align: center; 
              margin-top: 15px; 
              font-size: 9px; 
              border-top: 1px dashed #000;
              padding-top: 8px;
            }
            .payment-note {
              background: #fffacd;
              border: 2px solid #ffa500;
              padding: 8px;
              margin: 8px 0;
              text-align: center;
              font-weight: bold;
              font-size: 12px;
            }
            @media print {
              body { print-color-adjust: exact; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Print COD Receipt - {tableName}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Receipt Preview */}
          <div ref={printRef} className="receipt border p-4 bg-gray-50">
            {/* Header */}
            <div className="header">
              <h1 style={{margin: '0', fontSize: '16px', fontWeight: 'bold'}}>
                {store?.storeName || 'RESTAURANT NAME'}
              </h1>
              <p style={{margin: '3px 0', fontSize: '10px'}}>
                {store?.place || 'Store Address Here'}
              </p>
              <p style={{margin: '3px 0', fontSize: '10px'}}>
                Tel: {store?.phone || '+91 XXXXXXXXXX'}
              </p>
            </div>

            {/* Table Highlight */}
            <div className="table-highlight">
              {tableName.toUpperCase()} - COD BILL
            </div>

            {/* Customer Details */}
            <div className="customer-info">
              <div className="section-title">Customer Details</div>
              <div><strong>{tableData.customerName}</strong></div>
              <div>{tableData.phoneNumber}</div>
              <div>Date: {formatDate(new Date().toISOString())}</div>
            </div>

            {/* Individual Orders */}
            <div className="section">
              <div className="section-title">Order Details ({tableData.orders.length} Orders)</div>
              {tableData.orders.map((order, index) => (
                <div key={order._id} className="order-group">
                  <div className="order-header">
                    Order #{order.orderId} - {formatDate(order.orderDate)}
                  </div>
                  <table className="items-table">
                    {order.products?.map((product, idx) => (
                      <tr key={idx}>
                        <td className="item-name" style={{width: '45%'}}>{product.productName}</td>
                        <td className="item-qty" style={{width: '15%'}}>{product.quantity}</td>
                        <td className="item-price" style={{width: '20%'}}>₹{product.unitPrice}</td>
                        <td className="item-total" style={{width: '20%'}}>₹{product.totalPrice}</td>
                      </tr>
                    ))}
                  </table>
                  <div className="order-total">
                    Order Total: ₹{order.totalAmount}
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Note */}
            <div className="payment-note">
              CASH ON DELIVERY (COD)
              <br />
              PAYMENT PENDING
            </div>

            {/* Grand Total */}
            <div className="grand-total">
              TOTAL AMOUNT TO COLLECT
              <br />
              ₹{tableData.totalAmount}
            </div>

            {/* Summary */}
            <div className="section">
              <div style={{fontSize: '10px', textAlign: 'center'}}>
                <div><strong>Payment Summary:</strong></div>
                <div>Total Orders: {tableData.orders.length}</div>
                <div>Payment Method: Cash on Delivery</div>
                <div>Status: Pending Collection</div>
              </div>
            </div>

            {/* Footer */}
            <div className="footer">
              <p style={{margin: '5px 0', fontWeight: 'bold'}}>Please collect payment from customer</p>
              <p style={{margin: '3px 0'}}>
                Support: {store?.email || 'support@restaurant.com'}
              </p>
              <p style={{margin: '3px 0'}}>
                Printed: {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>

          {/* Print Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handlePrint}
              className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print COD Receipt
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// COD Payment Tracker Component - Add this after PrintReceipt component
// Updated COD Payment Tracker Component with Print - Replace the existing one
const CODPaymentTracker = ({ orders, onMarkTablePaid, store }) => {
  const [showPrintModal, setShowPrintModal] = useState(null); // Track which table to print

  // Group orders by table number and calculate COD totals
  const codOrdersByTable = orders
    .filter(order => 
      order.paymentMethod === 'cod' && 
      order.paymentStatus !== 'completed' &&
      order.status !== 'cancelled'
    )
    .reduce((acc, order) => {
      // Extract table number from delivery address or use a default grouping
      const tableMatch = order.deliveryAddress?.match(/table\s*(\d+)/i) || 
                        order.deliveryAddress?.match(/(\d+)/);
      const tableNumber = tableMatch ? `Table ${tableMatch[1]}` : 'Table Not Specified';
      
      if (!acc[tableNumber]) {
        acc[tableNumber] = {
          orders: [],
          totalAmount: 0,
          customerName: order.customerName,
          phoneNumber: order.phoneNumber
        };
      }
      
      acc[tableNumber].orders.push(order);
      acc[tableNumber].totalAmount += parseFloat(order.totalAmount || 0);
      
      return acc;
    }, {});

  const handleMarkTablePaid = (tableNumber, orders) => {
    const orderIds = orders.map(order => order._id);
    onMarkTablePaid(orderIds, tableNumber);
  };

  const handlePrintTable = (tableName, tableData) => {
    setShowPrintModal({ tableName, tableData });
  };

  if (Object.keys(codOrdersByTable).length === 0) {
    return null; // Don't show if no COD pending
  }

  return (
    <>
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 mb-8">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-black">COD Payment Pending</h3>
            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
              {Object.keys(codOrdersByTable).length} Tables
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(codOrdersByTable).map(([tableNumber, tableData]) => (
              <div 
                key={tableNumber}
                className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg text-orange-900">{tableNumber}</h4>
                  <div className="flex items-center space-x-2">
                    <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {tableData.orders.length} Orders
                    </div>
                    {/* Print Button */}
                    <button
                      onClick={() => handlePrintTable(tableNumber, tableData)}
                      className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors shadow-md"
                      title="Print COD Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-orange-600" />
                    <span className="text-orange-800 font-medium">{tableData.customerName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-orange-600" />
                    <span className="text-orange-700">{tableData.phoneNumber}</span>
                  </div>
                </div>

                {/* Individual Orders */}
                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                  {tableData.orders.map((order, index) => (
                    <div key={order._id} className="bg-white/70 rounded-lg p-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">{order.orderId}</span>
                        <span className="font-bold text-orange-700">₹{order.totalAmount}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {order.products?.slice(0, 2).map(p => p.productName).join(', ')}
                        {order.products?.length > 2 && ` +${order.products.length - 2} more`}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Amount */}
                <div className="border-t-2 border-orange-300 pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-orange-900">Total Amount:</span>
                    <span className="font-bold text-2xl text-orange-800">₹{tableData.totalAmount}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {/* Mark as Paid Button */}
                  <button
                    onClick={() => handleMarkTablePaid(tableNumber, tableData.orders)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Mark as Paid</span>
                  </button>
                  
                  {/* Print Button */}
                  <button
                    onClick={() => handlePrintTable(tableNumber, tableData)}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md flex items-center justify-center"
                    title="Print COD Receipt"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary Footer */}
          <div className="mt-8 p-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-bold">Total COD Pending</h4>
                <p className="text-orange-100">Across all tables</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">
                  ₹{Object.values(codOrdersByTable).reduce((sum, table) => sum + table.totalAmount, 0)}
                </p>
                <p className="text-orange-100">{Object.keys(codOrdersByTable).length} tables pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <CODTablePrintReceipt
          tableData={showPrintModal.tableData}
          tableName={showPrintModal.tableName}
          store={store}
          onClose={() => setShowPrintModal(null)}
        />
      )}
    </>
  );
};


// Compact Order Card Component
const OrderCard = ({ order, onStatusChange, storeCategory, store }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const { token } = useAuth();

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': 
        return { 
          bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100', 
          text: 'text-yellow-900', 
          badge: 'bg-yellow-500 text-white shadow-md',
          icon: <AlertCircle className="w-4 h-4" />,
          dot: 'bg-yellow-500'
        };
      case 'confirmed': 
        return { 
          bg: 'bg-gradient-to-br from-blue-50 to-blue-100', 
          text: 'text-blue-900', 
          badge: 'bg-blue-500 text-white shadow-md',
          icon: <CheckCircle className="w-4 h-4" />,
          dot: 'bg-blue-500'
        };
      case 'processing': 
        return { 
          bg: 'bg-gradient-to-br from-purple-50 to-purple-100', 
          text: 'text-purple-900', 
          badge: 'bg-purple-500 text-white shadow-md',
          icon: <Package className="w-4 h-4" />,
          dot: 'bg-purple-500'
        };
      case 'shipped': 
        return { 
          bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100', 
          text: 'text-indigo-900', 
          badge: 'bg-indigo-500 text-white shadow-md',
          icon: <Truck className="w-4 h-4" />,
          dot: 'bg-indigo-500'
        };
      case 'delivered': 
        return { 
          bg: 'bg-gradient-to-br from-teal-50 to-teal-100', 
          text: 'text-teal-900', 
          badge: 'bg-teal-500 text-white shadow-md',
          icon: <CheckCircle className="w-4 h-4" />,
          dot: 'bg-teal-500'
        };
      case 'cancelled': 
        return { 
          bg: 'bg-gradient-to-br from-red-50 to-red-100', 
          text: 'text-red-900', 
          badge: 'bg-red-500 text-white shadow-md',
          icon: <XCircle className="w-4 h-4" />,
          dot: 'bg-red-500'
        };
      case 'returned': 
        return { 
          bg: 'bg-gradient-to-br from-orange-50 to-orange-100', 
          text: 'text-orange-900', 
          badge: 'bg-orange-500 text-white shadow-md',
          icon: <RotateCcw className="w-4 h-4" />,
          dot: 'bg-orange-500'
        };
      default: 
        return { 
          bg: 'bg-gradient-to-br from-gray-50 to-gray-100', 
          text: 'text-gray-900', 
          badge: 'bg-gray-500 text-white shadow-md',
          icon: <Clock className="w-4 h-4" />,
          dot: 'bg-gray-500'
        };
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    // Only ask for OTP if changing from processing → delivered
    if (order.status === 'processing' && newStatus === 'delivered') {
      const userOtp = prompt('Enter OTP provided by customer:');
  
      if (!userOtp) {
        showErrorToast('OTP is required to mark as delivered');
        return;
      }
  
      if (userOtp !== order.otp) {
        showErrorToast('Incorrect OTP');
        return;
      }
    }
  
    setIsUpdating(true);
    try {
      await onStatusChange(order._id, newStatus);
      showSuccessToast(`Order marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      showErrorToast('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };
  
const handleNotifyReady = async (orderId) => {
  try {

    await axios.post(`${SERVER_URL}/orders/${orderId}/notify-ready`,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    showSuccessToast('Customer notified: Order is ready');
  } catch (error) {
    console.error('Failed to send ready notification', error);
    showErrorToast('Failed to notify customer');
  }
};

  const handlePaymentStatusChange = async (orderId, newStatus) => {
 toast((t) => (
      <span className="flex flex-col gap-2 relative">
        {/* ❌ X Button */}
        <button
          onClick={() => toast.dismiss(t.id)}
          className="absolute top-1 right-1 text-gray-500 hover:text-gray-800"
        >
          <X size={14} />
        </button>
    
        <span className="text-sm font-medium">
          Confirm marking payment as <b>completed</b>?
        </span>
    
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.patch(
                  `${SERVER_URL}/orders/payment/${orderId}`,
                  { paymentStatus: "completed" },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
    
                showSuccessToast("Payment marked as completed");
                onStatusChange(orderId, null, "completed");
              } catch (error) {
                console.error("Error updating payment status:", error);
                showErrorToast("Failed to update payment status");
              }
            }}
            className="px-2 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-2 py-1 text-sm text-white bg-gray-600 rounded hover:bg-gray-700"
          >
            No
          </button>
        </div>
      </span>
    ), { 
      duration: 2000,  // ✅ Auto close after 2 seconds
      position: "top-center",
    });
    
  };
  

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getActionButtons = () => {
    const status = order.status?.toLowerCase();
    const buttons = [];
  
    const isHotel = storeCategory?.toLowerCase().includes('hotel') || 
                    storeCategory?.toLowerCase().includes('restaurant');
  
    if (isHotel) {
      switch (status) {
        case 'pending':
          buttons.push(
            <button
              key="process"
              onClick={() => handleStatusUpdate('processing')}
              disabled={isUpdating}
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
            >
              {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Package className="w-4 h-4" /><span>Accept</span></>}
            </button>
          );
          break;
        case 'processing':
          buttons.push(
            <button
              key="deliver"
              onClick={() => handleStatusUpdate('delivered')}
              disabled={isUpdating}
              className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
            >
              {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /><span>Deliver</span></>}
            </button>
          );
          buttons.push(
            <button
              key="ready"
              onClick={() => handleNotifyReady(order._id)}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-1 shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Ready</span>
            </button>
          );
          
          break;
      }
  
      if (!['delivered', 'cancelled'].includes(status)) {
        buttons.push(
          <button
            key="cancel"
            onClick={() => handleStatusUpdate('cancelled')}
            disabled={isUpdating}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
          >
            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4" /><span>Cancel</span></>}
          </button>
        );
      }
  
      return buttons;
    }

    switch (status) {
      case 'pending':
        buttons.push(
          <button
            key="confirm"
            onClick={() => handleStatusUpdate('processing')}
            disabled={isUpdating}
            className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
          >
            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /><span>Confirm</span></>}
          </button>
        );
        break;
      
      case 'confirmed':
        buttons.push(
          <button
            key="process"
            onClick={() => handleStatusUpdate('processing')}
            disabled={isUpdating}
            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
          >
            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Package className="w-4 h-4" /><span>Process</span></>}
          </button>
        );
        break;
      
      case 'processing':
        buttons.push(
          <button
            key="ship"
            onClick={() => handleStatusUpdate('delivered')}
            disabled={isUpdating}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
          >
            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Truck className="w-4 h-4" /><span>Delivered</span></>}
          </button>
        );
        buttons.push(
          <button
            key="ready"
            onClick={() => handleNotifyReady(order._id)}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-1 shadow-md"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Ready</span>
          </button>
        );
        
        break;
      
      case 'shipped':
        buttons.push(
          <button
            key="deliver"
            onClick={() => handleStatusUpdate('delivered')}
            disabled={isUpdating}
            className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
          >
            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /><span>Deliver</span></>}
          </button>
        );
        break;
      
      case 'delivered':
        buttons.push(
          <button
            key="return"
            onClick={() => handleStatusUpdate('returned')}
            disabled={isUpdating}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
          >
            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><RotateCcw className="w-4 h-4" /><span>Return</span></>}
          </button>
        );
        break;
    }

    if (!['delivered', 'cancelled', 'returned'].includes(status)) {
      buttons.push(
        <button
          key="cancel"
          onClick={() => handleStatusUpdate('cancelled')}
          disabled={isUpdating}
          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-1 shadow-md"
        >
          {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4" /><span>Cancel</span></>}
        </button>
      );
    }

    return buttons;
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <>
      <div className={`${statusConfig.bg} rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-white/50 overflow-hidden backdrop-blur-sm transform hover:scale-102`}>
        <div className={`h-1.5 ${statusConfig.dot} shadow-inner`}></div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-black text-base">{order.orderId}</h3>
                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.badge}`}>
                  {statusConfig.icon}
                  <span className="capitalize">{order.status}</span>
                </span>
              </div>
            </div>
            
            {/* Print Button */}
            <button 
  onClick={() => printThermalReceipt(order, store)}
  className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors shadow-md"
  title="Print Receipt"
>
  <Printer className="w-4 h-4" />
</button>
          </div>
    
          <div className="mb-3 space-y-2">
            {order.products?.map((product, index) => (
              <div
                key={product.productId || index}
                className="p-2.5 bg-white/70 rounded-lg border border-white/50 shadow-sm"
              >
                <h4 className="font-semibold text-black text-sm mb-0.5">{product.productName}</h4>
                <p className="text-gray-600 text-xs">Qty: {product.quantity}</p>
                <p className="text-gray-600 text-xs">
                  Unit Price: ₹{product.unitPrice} &nbsp;|&nbsp; Total: ₹{product.totalPrice}
                </p>
              </div>
            ))}
          </div>
    
          <div className="mb-3">
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-black font-medium">{order.customerName}</span>
            </div>
          </div>
    
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-gray-700 text-xs">{formatDate(order.orderDate)}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-gray-700 text-xs">{order.phoneNumber}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-gray-700 text-xs truncate">{order.deliveryAddress}</span>
            </div>
            
            <div className="flex items-center justify-between p-2.5 bg-white/70 rounded-lg border border-white/50">
              <div className="flex items-center space-x-2">
                <IndianRupee className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-black font-bold text-base">{order.totalAmount}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Payment</p>
                <p className="text-sm font-medium text-black capitalize">{order.paymentMethod}</p>
              </div>
            </div>

            {order.paymentMethod === 'cod' && (
              <div className="flex items-center justify-between px-2.5 py-2 bg-white/70 rounded-lg border border-white/50">
                <div className="flex items-center space-x-2">
                  <IndianRupee className="w-3.5 h-3.5 text-teal-600" />
                  <span className="text-sm text-black font-medium capitalize">
                    Payment Status: 
                    <span className={`ml-2 font-semibold ${
  order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
}`}>
  {order.paymentStatus === 'completed' ? 'paid' : order.paymentStatus}
</span>
                  </span>
                </div>

                {order.paymentStatus !== 'completed' && (
                  <button
                  onClick={() => handlePaymentStatusChange(order._id, 'completed')}
                    className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-600 transition-all duration-200 shadow-sm"
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            )}

            {(order.paymentMethod === 'gpay' || order.paymentMethod === 'phonepe') && order.transactionId && (
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Transaction ID</p>
                    <p className="text-sm font-mono text-black">{order.transactionId}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
    
          <div className="flex gap-2">
            {getActionButtons()}
            {(order.paymentMethod === 'gpay' || order.paymentMethod === 'phonepe') && 
             order.paymentStatus === 'pending' && (
              <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
                Verify Payment
              </button>
            )}
          </div>
        </div>
      </div>

    
    </>
  );
};

// Main Order Management Component
const OrderManagement = ({ store }) => {
  const storeId = store._id;
  const { user, token } = useAuth() || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationTimer, setNotificationTimer] = useState(null);
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const [audioReady, setAudioReady] = useState(false); // NEW: Track audio readiness
  const [previousPendingCount, setPreviousPendingCount] = useState(0);
  const [showCODOnly, setShowCODOnly] = useState(false);
  // Audio ref for notification sound
  const audioRef = useRef(null); // CHANGED: Use ref instead of state

  // Create notification sound
// Create notification sound
// FIND this section around line 20-50 and REPLACE it completely:

// Create notification sound - FIXED VERSION
useEffect(() => {
  if (soundEnabled && typeof window !== 'undefined') {
    const createChimeSound = () => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Create a pleasant chime with descending tones
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(450, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.type = 'sine';
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.log('Audio context error:', error);
      }
    };

    // Set the audio element and mark as ready
    audioRef.current = { play: createChimeSound };  // ✅ CHANGED: Use audioRef instead of setAudioElement
    setAudioReady(true); // ✅ NEW: Mark audio as ready
 } else {
    setAudioReady(false);
  }
}, [soundEnabled]);
  // Play notification sound
// Play notification sound
// Replace your existing playNotificationSound function with this:

// Add this function inside OrderManagement component after handleStatusChange
const handleMarkTablePaid = async (orderIds, tableName) => {
  const totalAmount = orderIds.reduce((sum, orderId) => {
    const order = orders.find(o => o._id === orderId);
    return sum + (order ? parseFloat(order.totalAmount) : 0);
  }, 0);

  toast((t) => (
    <span className="flex flex-col gap-2 relative">
      {/* ❌ X Button */}
      <button
        onClick={() => toast.dismiss(t.id)}
        className="absolute top-1 right-1 text-gray-500 hover:text-gray-800"
      >
        <X size={16} />
      </button>
  
      <span className="text-sm font-medium">
        Mark all orders for <b>{tableName}</b> as paid?
      </span>
      <span className="text-xs text-gray-600">
        Total Amount: ₹{totalAmount} | {orderIds.length} orders
      </span>
  
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              const updatePromises = orderIds.map(orderId =>
                axios.patch(
                  `${SERVER_URL}/orders/payment/${orderId}`,
                  { paymentStatus: 'completed' },
                  {
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                  }
                )
              );
  
              await Promise.all(updatePromises);
  
              setOrders(prev =>
                prev.map(order =>
                  orderIds.includes(order._id)
                    ? { ...order, paymentStatus: 'completed' }
                    : order
                )
              );
  
              toast.success(`✅ ${tableName} marked as paid! Total: ₹${totalAmount}`);
              setTimeout(() => fetchOrders(selectedStatus), 1000);
            } catch (error) {
              console.error('Error updating table payments:', error);
              toast.error('Failed to update payments');
            }
          }}
          className="px-3 py-1.5 text-sm text-white bg-green-600 rounded hover:bg-green-700"
        >
          Confirm Payment
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-3 py-1.5 text-sm text-white bg-gray-600 rounded hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </span>
  ), { 
    duration: 2000,   // ✅ Auto-close after 5 seconds
    position: "top-center",
  });
};


const playNotificationSound = () => {
  if (soundEnabled && audioReady && audioRef.current) {
    try {
      if (audioRef.current.play && typeof audioRef.current.play === 'function') {
        audioRef.current.play();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  } else {
    console.log('🔇 Sound not played - soundEnabled:', soundEnabled, 'audioReady:', audioReady);
  }
};

// Start persistent notification
const startPersistentNotification = () => {
  if (notificationTimer || !soundEnabled || !audioReady) {
   return;
  }
  
  // Play immediately
  playNotificationSound();
  
  // Then repeat every 2 seconds
  const timer = setInterval(() => {
    playNotificationSound();
  }, 2000);
  
  setNotificationTimer(timer);
  setHasNewOrders(true);
};

// Stop notification
const stopNotification = () => {
  if (notificationTimer) {
    clearInterval(notificationTimer);
    setNotificationTimer(null);
    setHasNewOrders(false);
  }
};

  const statusOptions = [
    { value: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: 'bg-yellow-500' },
    { value: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length, color: 'bg-blue-500' },
    { value: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length, color: 'bg-purple-500' },
    { value: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length, color: 'bg-indigo-500' },
    { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length, color: 'bg-teal-500' },
    { value: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length, color: 'bg-red-500' },
    { value: 'returned', label: 'Returned', count: orders.filter(o => o.status === 'returned').length, color: 'bg-orange-500' },
    { value: 'today', label: 'Today', count: orders.filter(o => new Date(o.orderDate).toDateString() === new Date().toDateString()).length, color: 'bg-gray-500' }
  ];

  const fetchOrders = async (status = 'pending') => {
    setLoading(true);
    setError(null);
    
    try {
      let apiUrl = '';
      let params = { status };
      
      if (status === 'today') {
        apiUrl = `${SERVER_URL}/orders/store/${storeId}`;
        const today = new Date().toISOString().split('T')[0];
        params.date = today;
      } else {
        apiUrl = `${SERVER_URL}/orders/store/${storeId}/status`;
      }
      
      const response = await axios.get(apiUrl, {
        params,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 10000
      });
      
      const newOrders = response.data.orders || response.data || [];
      
      // Check for new pending orders and play sound
      const pendingOrders = newOrders.filter(o => o.status === 'pending');
      const currentPendingCount = pendingOrders.length;
      
      // Handle notifications for pending orders
     // Handle notifications for pending orders with audio ready check
if (currentPendingCount > 0) {
  if (!hasNewOrders) {
    // Wait a bit for audio to be ready if it's not yet
    if (!audioReady && soundEnabled) {
     setTimeout(() => {
        if (audioReady) {
          startPersistentNotification();
        }
      }, 500); // Wait 500ms for audio to initialize
    } else {
      startPersistentNotification();
    }
    
    showSuccessToast(`🔔 You have ${currentPendingCount} pending order${currentPendingCount > 1 ? 's' : ''}!`);
  }
} else {
  stopNotification();
}
      
      setPreviousPendingCount(currentPendingCount);
      setOrders(newOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

// 1. Fix the handleStatusChange function in OrderManagement component
// Fixed handleStatusChange function - replace your existing one with this:
const handleStatusChange = (orderId, newStatus, paymentStatus = null) => {
  if (paymentStatus) {
    // Handle payment status update
    setOrders(prev =>
      prev.map(order =>
        order._id === orderId 
          ? { ...order, paymentStatus: paymentStatus } 
          : order
      )
    );
    return;
  }

  // Handle order status update
  toast((t) => (
    <span className="flex flex-col gap-2 relative">
      {/* ❌ X Button */}
      <button
        onClick={() => toast.dismiss(t.id)}
        className="absolute top-1 right-1 text-gray-500 hover:text-gray-800"
      >
        <X size={14} />
      </button>
  
      <span className="text-sm font-medium">
        Are you sure you want to change status to <b>{newStatus}</b>?
      </span>
  
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              await axios.patch(
                `${SERVER_URL}/orders/status/${orderId}`,
                { status: newStatus },
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  timeout: 10000,
                }
              );
  
              // ✅ Update orders immediately
              setOrders((prev) => {
                const updatedOrders = prev.map((order) =>
                  order._id === orderId ? { ...order, status: newStatus } : order
                );
  
                const remainingPendingOrders = updatedOrders.filter(
                  (order) => order.status === "pending"
                );
  
                if (remainingPendingOrders.length === 0) {
                  stopNotification();
                }
  
                return updatedOrders;
              });
  
              // ✅ Refresh orders
              await fetchOrders(selectedStatus);
              toast.success(`Status updated to ${newStatus}`);
            } catch (error) {
              console.error("Error updating order status:", error);
              toast.error("Failed to update status");
            }
          }}
          className="px-2 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
        >
          Yes
        </button>
  
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-2 py-1 text-sm text-white bg-gray-600 rounded hover:bg-gray-700"
        >
          No
        </button>
      </div>
    </span>
  ), {
    duration: 2000,   // ✅ Auto close after 2 seconds
    position: "top-center",
  });
};

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.phoneNumber?.includes(searchQuery);
    return matchesSearch;
  });

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  useEffect(() => {
    // Only fetch orders after audio is ready (or audio is disabled)
    if (!soundEnabled || audioReady) {
      fetchOrders(selectedStatus);
      
      const interval = setInterval(() => {
        fetchOrders(selectedStatus);
      }, 30000);
  
      return () => {
        clearInterval(interval);
        stopNotification();
      };
    }
  }, [selectedStatus, storeId, token, soundEnabled, audioReady]); // Added audioReady dependency
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-black via-gray-900 to-black rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-teal-400 to-white bg-clip-text text-transparent">
                  Order Management
                </h1>
                <p className="text-gray-300 text-lg">Manage and track all your orders efficiently</p>
              </div>
              {/* ADD THIS NOTIFICATION INDICATOR */}
{hasNewOrders && (
  <div className="mb-4 bg-red-500 text-white px-6 py-3 rounded-2xl text-center animate-pulse shadow-lg">
    <div className="flex items-center justify-center space-x-2">
      <span className="text-2xl">🔔</span>
      <span className="font-bold text-lg">New Orders Pending - Sound Notification Active!</span>
      <button
        onClick={stopNotification}
        className="ml-4 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
      >
        Dismiss
      </button>
    </div>
  </div>
)}

<div className="flex gap-6"></div>
              <div className="flex gap-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-2xl">{orders.length}</p>
                      <p className="text-gray-300 text-sm">Total Orders</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                      <IndianRupee className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-2xl">₹{totalRevenue}</p>
                      <p className="text-gray-300 text-sm">Total Revenue</p>
                    </div>
                  </div>
                </div>

             
             
                <div className="fixed top-4 right-24 z-50 flex flex-row space-x-3 ">
  {/* Sound Toggle */}
  <button
onClick={() => {
  const newSoundState = !soundEnabled;
  setSoundEnabled(newSoundState);
  
  // If disabling sound, stop notifications
  if (!newSoundState) {
    stopNotification();
    setAudioReady(false);
  }
  // Audio will be recreated by useEffect when soundEnabled changes
}}
    className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-lg backdrop-blur-md transition"
    title={soundEnabled ? 'Disable notification sound' : 'Enable notification sound'}
  >
    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
  </button>

  {/* Refresh Button */}
  <button
    onClick={() => fetchOrders(selectedStatus)}
    className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-lg backdrop-blur-md transition"
    title="Refresh Orders"
  >
    <RefreshCcw className="w-5 h-5" />
  </button>
  {/* Add this COD Toggle Button in the fixed button container with sound toggle */}
  <div className="fixed top-4 right-24 z-50 flex flex-row space-x-3">
                  {/* COD Only View Toggle */}
                  <button
                    onClick={() => setShowCODOnly(!showCODOnly)}
                    className={`px-4 py-2 rounded-full shadow-lg backdrop-blur-md transition font-semibold text-sm flex items-center space-x-2 ${
                      showCODOnly 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'bg-black/50 hover:bg-black/70 text-white'
                    }`}
                    title={showCODOnly ? 'Show all orders' : 'Show only COD tracker'}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>{showCODOnly ? 'Exit COD' : 'COD Only'}</span>
                  </button>

                  {/* Sound Toggle */}
                  <button
                    onClick={() => {
                      const newSoundState = !soundEnabled;
                      setSoundEnabled(newSoundState);
                      if (!newSoundState) {
                        stopNotification();
                        setAudioReady(false);
                      }
                    }}
                    className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-lg backdrop-blur-md transition"
                    title={soundEnabled ? 'Disable notification sound' : 'Enable notification sound'}
                  >
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>

                  {/* Refresh Button */}
                  <button
                    onClick={() => fetchOrders(selectedStatus)}
                    className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-lg backdrop-blur-md transition"
                    title="Refresh Orders"
                  >
                    <RefreshCcw className="w-5 h-5" />
                  </button>
                </div>
</div>


              </div>
            </div>
          </div>
        </div>
        {showCODOnly && (
  <CODPaymentTracker 
  orders={orders} 
  onMarkTablePaid={handleMarkTablePaid}
  store={store}
/>
)}


        {/* Filter Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50">
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black">Filter Orders</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`group relative p-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    selectedStatus === option.value
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
                      : 'bg-white/70 text-gray-700 hover:bg-white/90 shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${option.color}`}></div>
                    <div className="text-sm">{option.label}</div>
                    {option.count > 0 && (
                      <div className={`mt-1 px-2 py-1 text-xs rounded-full font-bold ${
                        selectedStatus === option.value
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {option.count}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-gray-700 font-semibold text-lg">Loading orders...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white/80 backdrop-blur-lg border-2 border-red-200 rounded-3xl p-12 text-center shadow-xl">
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-red-800 mb-4">Failed to Load Orders</h3>
              <p className="text-red-600 mb-6 text-lg">{error}</p>
              <button
                onClick={() => fetchOrders(selectedStatus)}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg"
              >
                Try Again
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-lg border-2 border-gray-200 rounded-3xl p-16 text-center shadow-xl">
              <ShoppingCart className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-black mb-4">No Orders Found</h3>
              <p className="text-gray-600 text-lg">
                {selectedStatus === 'today' 
                  ? "No orders placed today." 
                  : `No ${selectedStatus} orders found.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  storeCategory={store.category}
                  store={store}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;