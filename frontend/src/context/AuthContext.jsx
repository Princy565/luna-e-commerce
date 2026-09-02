import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, getAuthToken, setAuthToken } from '../api/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' or 'register'
  const { addToast } = useToast();

  const loadUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getProfile();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setAuthToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Session validation error:', err);
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.token) {
        setAuthToken(res.token);
        setUser(res.user);
        setIsAuthModalOpen(false);
        addToast(`Welcome back, ${res.user.name}!`, 'success');
        return true;
      }
    } catch (err) {
      addToast(err.message || 'Login failed. Please check credentials.', 'error');
      throw err;
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const res = await authApi.register(name, email, password, phone);
      if (res.success && res.token) {
        setAuthToken(res.token);
        setUser(res.user);
        setIsAuthModalOpen(false);
        addToast('Account created successfully! Welcome to LUNA.', 'success');
        return true;
      }
    } catch (err) {
      addToast(err.message || 'Registration failed.', 'error');
      throw err;
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    addToast('You have been logged out.', 'info');
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        reloadUser: loadUser,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
