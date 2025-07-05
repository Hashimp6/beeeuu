import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SERVER_URL } from '../Config';

// Import Auth Context
const AuthContext = createContext();
// Instead of importing useAuth directly, we'll mock the import to avoid circular dependencies
export const useAuth = () => useContext(AuthContext);

// Create Socket Context
const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  
  // Get auth info directly from props instead of importing useAuth
  // This helps avoid circular dependencies
  const getAuthInfo = () => {
    // If you have access to AsyncStorage, you could read token directly
    // Otherwise, you should receive auth info through props
    return {
      token: global.authToken, // Use a global variable or receive as prop
      user: global.authUser,
      isAuthenticated: !!global.authToken
    };
  };
  
  useEffect(() => {
    const { token, user, isAuthenticated } = getAuthInfo();
    
    if (isAuthenticated && user && token) {
      // Create socket connection
      const newSocket = io(SERVER_URL, {
        auth: {
          token
        }
      });
      
      // Set socket in state
      setSocket(newSocket);
      
      // Socket event listeners
      newSocket.on('connect', () => {
        console.log('Socket connected');
        // Join user's personal room for direct messages
        if (user.id) {
          newSocket.emit('join', { userId: user.id });
        }
      });
      
      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      
      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });
      
      // Clean up on unmount
      return () => {
        newSocket.disconnect();
      };
    }
    
    return () => {};
  }, []);
  
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

// Export a modified version of SocketProvider that accepts auth as props
// to avoid circular dependencies
export const SocketProviderWithAuth = ({ children, token, user, isAuthenticated }) => {
  // Store auth info in global for the internal socket provider to use
  global.authToken = token;
  global.authUser = user;
  
  return <SocketProvider>{children}</SocketProvider>;
};