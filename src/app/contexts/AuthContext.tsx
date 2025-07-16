'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{success: boolean, message: string}>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => {
    return Cookies.get('auth-token') || null;
  };

  const verifyToken = async (token: string): Promise<User | null> => {
    try {
      // Try to call your backend to verify the token
      const response = await fetch('http://localhost:8081/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Return user data from your backend
        return {
          id: data.id || data.user?.id || 1,
          username: data.username || data.user?.username || '',
          email: data.email || data.user?.email || '',
          role: data.role || data.user?.role || 'USER'
        };
      }
    } catch (error) {
      console.log('Token verification endpoint not available, checking stored user data');
    }

    // Fallback: If verification endpoint doesn't exist, check if we have stored user data
    try {
      const storedUser = Cookies.get('user-data');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error parsing stored user data:', error);
    }

    return null;
  };

  const login = async (username: string, password: string): Promise<{success: boolean, message: string}> => {
    try {
      setIsLoading(true);
      
      // Call your existing API
      const response = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        }),
      });

      // Debug: Log response details
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        return { 
          success: false, 
          message: `Server error: Expected JSON response but got ${contentType}. Check if your API is running at http://localhost:8081/api/auth/login` 
        };
      }

      // Try to parse JSON
      let data;
      try {
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        if (!responseText.trim()) {
          return { 
            success: false, 
            message: 'Empty response from server. Check if your API is running at http://localhost:8081/api/auth/login' 
          };
        }
        
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return { 
          success: false, 
          message: 'Invalid response format from server. Please check your API.' 
        };
      }

      if (!response.ok) {
        return { 
          success: false, 
          message: data.message || `Server error (${response.status}): ${data.error || 'Invalid username or password'}` 
        };
      }

      // Log the successful response structure for debugging
      console.log('Login response data:', data);

      // Assuming your API returns a token and user data
      // Adjust this based on your actual API response structure
      const { token, user: userData } = data;

      if (!token) {
        console.error('No token in response:', data);
        return { success: false, message: 'No token received from server. Please check your API response format.' };
      }

      // Store token in cookie
      Cookies.set('auth-token', token, { 
        expires: 1, // 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // Set user state - adjust based on your API response structure
      const userInfo = {
        id: userData?.id || 1,
        username: userData?.username || username,
        email: userData?.email || '',
        role: userData?.role || 'USER'
      };

      // Store user data in cookie as fallback for token verification
      Cookies.set('user-data', JSON.stringify(userInfo), { 
        expires: 1, // 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      setUser(userInfo);
      return { success: true, message: 'Login successful' };

    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { 
          success: false, 
          message: 'Cannot connect to server. Please ensure your API is running at http://localhost:8081/api/auth/login' 
        };
      }
      
      return { 
        success: false, 
        message: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('auth-token');
    Cookies.remove('user-data');
    setUser(null);
    window.location.href = '/login';
  };

  // Check for existing token on mount and verify it
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        const userData = await verifyToken(token);
        if (userData) {
          setUser(userData);
        } else {
          // Token is invalid, remove it
          Cookies.remove('auth-token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 