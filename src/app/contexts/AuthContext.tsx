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
    // Since you don't have /api/auth/verify endpoint, we'll use stored user data
    try {
      const storedUser = Cookies.get('user-data');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('Using stored user data:', userData);
        return userData;
      }
    } catch (error) {
      console.error('Error parsing stored user data:', error);
    }

    // If no stored user data, the token is invalid
    console.log('No stored user data found, token may be invalid');
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
      console.log('Response URL:', response.url);

      // Check if response has content
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        console.error('Response length:', textResponse.length);
        
        if (textResponse.length === 0) {
          return { 
            success: false, 
            message: `API returned empty response. Please check if your backend server is running at http://localhost:8081 and the endpoint /api/auth/login exists.` 
          };
        }
        
        return { 
          success: false, 
          message: `Server error: Expected JSON response but got ${contentType || 'unknown content type'}. Response: "${textResponse.substring(0, 100)}${textResponse.length > 100 ? '...' : ''}"` 
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
        // Handle specific status codes
        if (response.status === 401) {
          return { 
            success: false, 
            message: 'Username or password is not correct, please try again' 
          };
        }
        
        return { 
          success: false, 
          message: data.message || `Server error (${response.status}): ${data.error || 'Login failed'}` 
        };
      }

      // Log the successful response structure for debugging
      console.log('Login response data:', data);

      // Extract data based on your actual API response structure
      const { token, username: responseUsername, role } = data;

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

      const userInfo = {
        id: 1, // You can add an ID field to your API response if needed
        username: responseUsername,
        email: '', // You can add email to your API response if needed
        role: role
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
      
      if (error instanceof TypeError) {
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          return { 
            success: false, 
            message: 'Cannot connect to server. Please check:\n• Backend server is running at http://localhost:8081\n• No firewall blocking the connection\n• CORS is properly configured' 
          };
        }
        if (error.message.includes('NetworkError') || error.message.includes('ERR_CONNECTION_REFUSED')) {
          return { 
            success: false, 
            message: 'Connection refused. Please ensure your backend server is running on port 8081' 
          };
        }
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