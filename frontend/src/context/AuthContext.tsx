import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  orgName?: string;
  orgId?: string;
  brandColor?: string;
  logoUrl?: string;
  theme?: 'dark' | 'light';
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  theme: 'dark' | 'light';
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, orgName?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE = '/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Theme Injection
  useEffect(() => {
    if (user?.brandColor) {
      document.documentElement.style.setProperty('--brand-primary', user.brandColor);
    } else {
      document.documentElement.style.setProperty('--brand-primary', '#3b82f6');
    }
  }, [user?.brandColor]);

  // Theme Application
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Login failed');
    }

    const data = await res.json();
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, orgName?: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, orgName }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Registration failed');
    }

    const data = await res.json();
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!token && !!user,
    token,
    theme,
    login,
    register,
    logout,
    updateUser,
    toggleTheme,
  }), [user, token, theme, login, register, logout, updateUser, toggleTheme]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
