import React, { createContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch full profile from /auth/me and merge with stored token
  const refreshProfile = useCallback(async (token) => {
    try {
      const { data } = await API.get('/auth/me');
      if (data.success && data.data) {
        const fullUser = { token, ...data.data };
        localStorage.setItem('user', JSON.stringify(fullUser));
        setUser(fullUser);
        return fullUser;
      }
    } catch (error) {
      console.error('Profile refresh failed:', error.message);
      localStorage.removeItem('user');
      setUser(null);
    }
    return null;
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.token) {
          await refreshProfile(parsed.token);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [refreshProfile]);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    const userData = { token: data.token, ...data.user };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    // Immediately fetch the full profile to get all institutional fields
    await refreshProfile(data.token);
    return data;
  };

  // Register now accepts FormData (for file upload) or plain object
  const register = async (formData) => {
    const isFormData = formData instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const { data } = await API.post('/auth/register', formData, config);
    const userData = { token: data.token, ...data.user };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Handle presence polling
  useEffect(() => {
    let interval;
    if (user && user.role === 'faculty') {
      // initial ping
      API.put('/auth/presence').catch(()=>null);
      // ping every 60 seconds
      interval = setInterval(() => {
        API.put('/auth/presence').catch(()=>null);
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
