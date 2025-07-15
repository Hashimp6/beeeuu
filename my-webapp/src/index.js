import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/UserContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';

// Correct way using createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
     <SocketProvider>
    <AuthProvider>
    <CartProvider>
      <App />
      </CartProvider>
    </AuthProvider>
    </SocketProvider>
  </React.StrictMode>
);
