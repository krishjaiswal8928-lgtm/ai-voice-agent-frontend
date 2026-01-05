// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you would validate the token and fetch user data
      // For now, we'll just set a mock user
      setUser({
        id: 1,
        username: 'demo_user',
        email: 'demo@example.com'
      });
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(username, password);
      const { access_token, token_type } = response.data;
      
      // Store token
      localStorage.setItem('token', access_token);
      // For now, we'll just set a mock user since the API doesn't return user data on login
      setUser({
        id: 1,
        username: 'admin',
        email: 'admin@example.com'
      });
      
      return response.data;
    } catch (err) {
      setError('Invalid credentials');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register(username, email, password);
      const { access_token, token_type, id } = response.data;
      
      // Store token
      localStorage.setItem('token', access_token);
      setUser({
        id: id,
        username: username,
        email: email
      });
      
      return response.data;
    } catch (err) {
      setError('Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout
  };
}