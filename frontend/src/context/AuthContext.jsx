import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../utils/api.js';
import { useTheme } from './ThemeContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      if (data.user?.theme) setTheme(data.user.theme);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setTheme]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('aurasync_token', data.token);
    setUser(data.user);
    if (data.user?.theme) setTheme(data.user.theme);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('aurasync_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('aurasync_token');
      setUser(null);
    }
  };

  const updateUser = (patch) => setUser((u) => ({ ...u, ...patch }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, refresh: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
