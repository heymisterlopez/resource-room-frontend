import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.checkAuth();
      if (response.data.isAuthenticated) {
        const teacherResponse = await authAPI.getCurrentTeacher();
        setTeacher(teacherResponse.data.teacher);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('Not authenticated');
      setIsAuthenticated(false);
      setTeacher(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      setTeacher(response.data.teacher);
      setIsAuthenticated(true);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // inside AuthContext.js
const register = async (userData) => {
  try {
    // Grab the code from env (or fallback)
    const code = process.env.REACT_APP_REGISTRATION_CODE || 'TEACHER2024';

    // 1) Call register endpoint with the correct code
    await authAPI.register({
      email: userData.email,
      password: userData.password,
      registrationCode: code
    });

    // 2) Immediately log in to establish a session cookie
    const loginRes = await authAPI.login({
      email: userData.email,
      password: userData.password
    });

    // 3) Update context state
    setTeacher(loginRes.data.teacher);
    setIsAuthenticated(true);

    return { success: true, data: loginRes.data };
  } catch (error) {
    // surfacing the backend’s error message
    return {
      success: false,
      error:
        error.response?.data?.message ||
        'Registration or login failed'
    };
  }
};

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setTeacher(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    teacher,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};