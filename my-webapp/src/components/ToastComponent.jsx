import React from 'react';
import { Toaster } from 'react-hot-toast';

const CustomToaster = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1f2937', // gray-800
          color: '#fff',
          borderRadius: '10px',
          padding: '12px 20px',
        },
        success: {
          icon: '✅',
          style: {
            background: '#22c55e', // green-500
            color: '#fff',
          },
        },
        error: {
          icon: '❌',
          style: {
            background: '#ef4444', // red-500
            color: '#fff',
          },
        },
      }}
    />
  );
};

export default CustomToaster;
