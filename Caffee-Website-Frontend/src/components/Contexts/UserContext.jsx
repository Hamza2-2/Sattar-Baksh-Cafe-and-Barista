import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchUserProfile();
      loadWishlist();
      loadPurchaseHistory();
    }
  }, []);

  const loadWishlist = async () => {
    try {
      const response = await apiClient.get('/api/wishlist');
      setWishlist(response.data);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    }
  };

  const loadPurchaseHistory = async () => {
    try {
      const response = await apiClient.get('/api/purchase-history');
      setPurchaseHistory(response.data);
    } catch (error) {
      console.error('Failed to load purchase history:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/auth/user');
      setUser(response.data.user);
      setIsLoggedIn(true);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setError(error.response?.data?.error || 'Failed to load user profile');
      localStorage.removeItem('authToken');
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/api/auth/register', {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        age: userData.age
      });

      localStorage.setItem('authToken', response.data.token);
      setUser(response.data.user);
      setIsLoggedIn(true);
      return { success: true, user: response.data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/api/auth/login', { email, password });

      localStorage.setItem('authToken', response.data.token);
      setUser(response.data.user);
      setIsLoggedIn(true);
      return { success: true, user: response.data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
      setIsLoggedIn(false);
      setWishlist([]);
      setError(null);
    }
  };

  const addToWishlist = async (product) => {
    try {
      setError(null);
      if (isLoggedIn) {
        await apiClient.post('/api/wishlist', { productId: product.id });
      }
      if (!wishlist.find(item => item.id === product.id)) {
        setWishlist([...wishlist, product]);
      }
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to add to wishlist';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      setError(null);
      if (isLoggedIn) {
        await apiClient.delete(`/api/wishlist/${productId}`);
      }
      setWishlist(wishlist.filter(item => item.id !== productId));
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to remove from wishlist';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const addPurchase = async (order) => {
    try {
      setError(null);
      if (isLoggedIn) {
        const response = await apiClient.post('/orders', {
          order: {
            order_number: order.order_number || `ORD-${Date.now()}`,
            total_amount: order.total_amount || order.total,
            subtotal: order.subtotal,
            shipping_cost: order.shipping_cost,
            estimated_delivery: order.estimated_delivery
          },
          items: order.items
        });
        await loadPurchaseHistory();
        return { success: true, orderId: response.data.orderId };
      }
      return { success: false, message: 'Not logged in' };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create order';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const updatePersonalDetails = async (details) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.put('/api/auth/user', {
        firstName: details.firstName,
        lastName: details.lastName,
        age: details.age,
        currentPassword: details.currentPassword,
        newPassword: details.newPassword
      });

      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isLoggedIn,
    wishlist,
    purchaseHistory,
    loading,
    error,
    register,
    login,
    logout,
    addToWishlist,
    removeFromWishlist,
    isInWishlist: (productId) => wishlist.some(item => item.id === productId),
    toggleWishlist: async (product) => {
      if (wishlist.some(item => item.id === product.id)) {
        return await removeFromWishlist(product.id);
      } else {
        return await addToWishlist(product);
      }
    },
    addPurchase,
    updatePersonalDetails,
    fetchUserProfile,
    loadWishlist,
    loadPurchaseHistory
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

