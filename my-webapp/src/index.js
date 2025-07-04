import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/UserContext';
import { SocketProvider } from './context/SocketContext';

// Correct way using createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
     <SocketProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
    </SocketProvider>
  </React.StrictMode>
);
