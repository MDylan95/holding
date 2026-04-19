import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import { authAPI, setOnUnauthorized } from '../services/api';
import { STORAGE_KEYS } from '../constants/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
    // Subscribe to 401 events from Axios interceptor
    setOnUnauthorized(() => {
      setToken(null);
      setUser(null);
    });
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = await storage.getItem(STORAGE_KEYS.USER_DATA);
      if (storedToken && storedUser) {
        setToken(storedToken);
        const userData = JSON.parse(storedUser);
        // Normalize boolean fields that may have been stored as strings
        if (userData.is_admin === 'true' || userData.is_admin === '1') userData.is_admin = true;
        if (userData.is_admin === 'false' || userData.is_admin === '0') userData.is_admin = false;
        setUser(userData);
      }
    } catch (e) {
      console.error('Erreur chargement auth:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    const { token: newToken, user: userData } = response.data;
    await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
    await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const response = await authAPI.register(data);
    const { token: newToken, user: userData } = response.data;
    await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
    await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // ignore
    }
    await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await storage.removeItem(STORAGE_KEYS.USER_DATA);
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.profile();
      const userData = response.data.user;
      await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      setUser(userData);
    } catch (e) {
      console.error('Erreur refresh profil:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
