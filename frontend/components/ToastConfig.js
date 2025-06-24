// Create a new file: components/ToastConfig.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => (
        <View style={styles.successIcon}>
          <Text style={styles.iconText}>✓</Text>
        </View>
      )}
    />
  ),
  
  error: (props) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => (
        <View style={styles.errorIcon}>
          <Text style={styles.iconText}>✕</Text>
        </View>
      )}
    />
  ),
  
  info: (props) => (
    <BaseToast
      {...props}
      style={styles.infoToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => (
        <View style={styles.infoIcon}>
          <Text style={styles.iconText}>i</Text>
        </View>
      )}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    borderLeftColor: '#4CAF50',
    borderLeftWidth: 5,
    backgroundColor: '#F8FFF8',
    borderRadius: 12,
    height: 70,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  errorToast: {
    borderLeftColor: '#F44336',
    borderLeftWidth: 5,
    backgroundColor: '#FFF8F8',
    borderRadius: 12,
    height: 70,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  infoToast: {
    borderLeftColor: '#2196F3',
    borderLeftWidth: 5,
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    height: 70,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  contentContainer: {
    paddingHorizontal: 15,
    flex: 1,
  },
  
  text1: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  
  text2: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
  },
  
  successIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  
  errorIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#F44336',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  
  infoIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#2196F3',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  
  iconText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});