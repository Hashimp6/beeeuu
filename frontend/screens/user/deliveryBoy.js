import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const DeliveryBoyScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setShowScanner(false);
    
    try {
      // Parse the QR code data
      const parsedData = JSON.parse(data);
      setOrderData(parsedData);
    } catch (error) {
      Alert.alert('Error', 'Invalid QR Code data');
      console.error('QR Code parsing error:', error);
    }
  };

  const startScanning = () => {
    setScanned(false);
    setShowScanner(true);
  };

  const makePhoneCall = (phoneNumber) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone call not supported on this device');
        }
      })
      .catch((err) => console.error('Phone call error:', err));
  };

  const openNavigation = async (address) => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for navigation');
        return;
      }

      // Encode the address for URL
      const encodedAddress = encodeURIComponent(address);
      
      let navigationUrl;
      
      if (Platform.OS === 'ios') {
        // Try Apple Maps first, fallback to Google Maps
        navigationUrl = `maps://maps.apple.com/?q=${encodedAddress}&dirflg=d`;
        
        const canOpen = await Linking.canOpenURL(navigationUrl);
        if (!canOpen) {
          navigationUrl = `https://maps.google.com/maps?q=${encodedAddress}&navigate=yes`;
        }
      } else {
        // Android - try Google Maps app first
        navigationUrl = `google.navigation:q=${encodedAddress}`;
        
        const canOpen = await Linking.canOpenURL(navigationUrl);
        if (!canOpen) {
          navigationUrl = `https://maps.google.com/maps?q=${encodedAddress}&navigate=yes`;
        }
      }

      await Linking.openURL(navigationUrl);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Could not open navigation app');
    }
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
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No access to camera</Text>
      </View>
    );
  }

  if (showScanner) {
    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "pdf417"],
          }}
        />
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerFrame} />
          <Text style={styles.scannerText}>Scan QR Code</Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowScanner(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!orderData ? (
        <View style={styles.scanPrompt}>
          <Ionicons name="qr-code" size={80} color="#666" />
          <Text style={styles.promptText}>Scan QR Code to view order details</Text>
          <TouchableOpacity style={styles.scanButton} onPress={startScanning}>
            <Ionicons name="camera" size={24} color="white" />
            <Text style={styles.scanButtonText}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.orderContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.orderId}>Order ID: {orderData.orderId}</Text>
            <Text style={styles.orderDate}>{formatDate(orderData.orderDate)}</Text>
          </View>

          {/* Customer Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{orderData.customerName}</Text>
              <Text style={styles.phoneNumber}>{orderData.phoneNumber}</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => makePhoneCall(orderData.phoneNumber)}
            >
              <Ionicons name="call" size={20} color="white" />
              <Text style={styles.callButtonText}>Call Customer</Text>
            </TouchableOpacity>
          </View>

          {/* Delivery Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <Text style={styles.address}>{orderData.deliveryAddress}</Text>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => openNavigation(orderData.deliveryAddress)}
            >
              <Ionicons name="navigate" size={20} color="white" />
              <Text style={styles.navigateButtonText}>Navigate</Text>
            </TouchableOpacity>
          </View>

          {/* Store Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Store Details</Text>
            <Text style={styles.storeName}>{orderData.store.storeName}</Text>
            <Text style={styles.storePlace}>{orderData.store.place}</Text>
            <Text style={styles.storePhone}>{orderData.store.phone}</Text>
          </View>

          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {orderData.products.map((product, index) => (
              <View key={index} style={styles.productItem}>
                <Text style={styles.productName}>{product.productName}</Text>
                <View style={styles.productDetails}>
                  <Text style={styles.quantity}>Qty: {product.quantity}</Text>
                  <Text style={styles.price}>{formatCurrency(product.totalPrice)}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(orderData.totalAmount)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(orderData.deliveryFee)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Platform Fee:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(orderData.platformFee)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(orderData.gst)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Payment Method:</Text>
              <Text style={styles.paymentMethod}>{orderData.paymentMethod.toUpperCase()}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Payment Status:</Text>
              <Text style={[styles.paymentStatus, 
                orderData.paymentStatus === 'pending' ? styles.pending : styles.completed]}>
                {orderData.paymentStatus.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.newScanButton}
              onPress={() => {
                setOrderData(null);
                startScanning();
              }}
            >
              <Ionicons name="qr-code" size={20} color="white" />
              <Text style={styles.newScanButtonText}>Scan New Order</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scannerContainer: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
  },
  scannerText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'red',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  promptText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 20,
    textAlign: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#008080',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  orderContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  phoneNumber: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  callButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  address: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  navigateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  storePlace: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  storePhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  productDetails: {
    alignItems: 'flex-end',
  },
  quantity: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  pending: {
    color: '#FF9500',
  },
  completed: {
    color: '#34C759',
  },
  actionButtons: {
    marginVertical: 20,
  },
  newScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#666',
    paddingVertical: 15,
    borderRadius: 8,
  },
  newScanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default DeliveryBoyScreen;