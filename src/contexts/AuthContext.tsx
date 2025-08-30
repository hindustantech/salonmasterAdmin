// context/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import type { AuthState, AuthContextType, RegisterData, LoginData } from '../types/auth';

// Initialize axios with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Reducer function
function authReducer(state: AuthState, action: any): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const refreshToken = localStorage.getItem('refreshToken');

        if (token && user && refreshToken) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: JSON.parse(user),
              token,
              refreshToken,
            },
          });
        }
      } catch (error) {
        dispatch({ type: 'LOGOUT' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Register function
  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'REGISTER_START' });
    try {
      const response = await api.post('/api/v1/auth/register-salonmaster', data);
      
      // After successful registration, you might want to automatically log the user in
      // or redirect to OTP verification
      dispatch({ type: 'REGISTER_SUCCESS', payload: response.data });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Login function
  const login = async (data: LoginData): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await api.post('/api/v1/auth/login-salonmaster', data);
        console.log("response",response);
      // Save to localStorage
      localStorage.setItem('token', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.data.user,
          token: response.data.data.accessToken,
          refreshToken: response.data.refreshToken,
        },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  // Verify OTP function
  const verifyOtp = async (whatsapp_number:string,otp: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.post('/api/v1/auth/verify-otp-salonmaster', { whatsapp_number,otp });

      // Update user state if needed
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data.user,
            token: state.token,
            refreshToken: state.refreshToken,
          },
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'OTP verification failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Request password reset
  const requestPasswordReset = async (email: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await api.post('/api/v1/auth/request-password-reset', { email });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password reset request failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Reset password
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await api.post('/api/v1/auth/reset-password-salonmasterer', { token, newPassword });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Refresh token
  const refreshToken = async (): Promise<void> => {
    if (!state.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await api.post('/api/v1/auth/refresh-token', { 
        refreshToken: state.refreshToken 
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: state.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Token refresh failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // Resend OTP
  const resendOtp = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await api.post('/api/v1/auth/resend-otp-salonmasterer');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        register,
        login,
        logout,
        verifyOtp,
        requestPasswordReset,
        resetPassword,
        refreshToken,
        resendOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};