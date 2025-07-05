import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { SERVER_URL } from '../Config'; // e.g., http://localhost:5000

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load stored auth data on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const res = await axios.post(`${SERVER_URL}/users/login`, { email, password });

      const { token: newToken, user: userData } = res.data;

      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true };
    } catch (e) {
      const msg = e.response?.data?.message || 'Login failed.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    delete axios.defaults.headers.common['Authorization'];

    setToken(null);
    setUser(null);
  };

  const getCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${SERVER_URL}/users/me`);
      const userData = res.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (e) {
      console.error('Get user failed', e);
      if (e.response?.status === 401) logout();
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      token,
      setToken,
      loading,
      error,
      login,
      logout,
      getCurrentUser,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
