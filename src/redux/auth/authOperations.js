import api from '../../axiosSetup';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';


// Utility to add JWT
const setAuthHeader = token => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

// Utility to delete JWT
const clearAuthHeader = () => {
  delete api.defaults.headers.common.Authorization;
};

// Utility to schedule token refresh
let refreshTimeout;
const scheduleTokenRefresh = (token, dispatch) => {
  if (refreshTimeout) clearTimeout(refreshTimeout);

  try {
    const decoded = jwtDecode(token);
    if (!decoded || !decoded.exp) {
      console.error('Invalid token format - missing expiration');
      return;
    }

    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;

    if (timeUntilExpiry <= 0) {
      // Token expired, log out the user
      console.log('Token expired, logging out');
      dispatch(logout());
      return;
    }

    // Schedule refresh at 80% of token lifetime to ensure we refresh before expiry
    // but not too early (with a minimum of 30 seconds before expiry)
    const refreshTime = Math.max(Math.min(timeUntilExpiry * 0.8, timeUntilExpiry - 30), 0) * 1000;
    
    console.log(`Token refresh scheduled in ${Math.round(refreshTime / 1000)} seconds`);
    
    refreshTimeout = setTimeout(() => {
      console.log('Executing scheduled token refresh');
      dispatch(refreshUser());
    }, refreshTime);
  } catch (error) {
    console.error('Error processing JWT for refresh scheduling:', error);
    dispatch(logout());
  }
};

// Register
export const register = createAsyncThunk(
  'auth/register',
  async (credentials, thunkAPI) => {
    try {
      const response = await api.post('/api/auth/register', credentials);
      setAuthHeader(response.data.token);
      toast.success(
        'Account created! Verification has been sent to your email'
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 409 && message === 'Email already registered') {
        toast.error('Email is already in use.');
      }

      return thunkAPI.rejectWithValue({ status, message });
    }
  }
);

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      
      const { user, accessToken, refreshToken, token } = response.data;
      // Handle both backend format (accessToken) and Mock API format (token)
      const finalToken = accessToken || token;
      
      setAuthHeader(finalToken);
      scheduleTokenRefresh(finalToken, thunkAPI.dispatch);
      return { user, token: finalToken, refreshToken };
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 401 && message === 'Please verify your email') {
        toast.error('Please verify your email.');
      }

      if (
        (status === 401 && message === 'Invalid user') ||
        message === 'Invalid credentials'
      ) {
        toast.error('Invalid credentials. Please try again.');
      }

      if (status === 400 && message) {
        toast.warning('Please enter valid email address');
      }

      return thunkAPI.rejectWithValue({ status, message });
    }
  }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    // ignore errors
  } finally {
    clearAuthHeader();
    clearTimeout(refreshTimeout);
  }
});

// Refresh User
export const refreshUser = createAsyncThunk(
  'auth/refreshUser',
  async (_, thunkAPI) => {
    const refreshToken = thunkAPI.getState().auth.refreshToken;
    if (!refreshToken) {
      return thunkAPI.rejectWithValue('No refresh token available');
    }

    try {
      const response = await api.post('/api/auth/refresh', { refreshToken });
      const { accessToken, token } = response.data;
      const newToken = accessToken || token;

      setAuthHeader(newToken);
      scheduleTokenRefresh(newToken, thunkAPI.dispatch);
      return { token: newToken };
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Clear auth on refresh failure
      clearAuthHeader();
      
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Token refresh failed'
      );
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    if (!token) return thunkAPI.rejectWithValue(null);

    setAuthHeader(token);
    try {
      const response = await api.get('/api/auth/current');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Failed to get user data');
    }
  }
);

// Verify email
export const verifyEmail = createAsyncThunk(
  'auth/verify',
  async (email, thunkAPI) => {
    try {
      const response = await api.post('/api/auth/verify', { email });
      toast.info('Verification email sent');
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 404) {
        toast.error('Email is not registered.');
      } else if (status === 400 && message === 'Email is already verified') {
        toast.info('Email was already verified.');
      } else if (status === 400) {
        toast.warning('Please enter valid email address');
      }

      return thunkAPI.rejectWithValue({ status, message });
    }
  }
);

// For backward compatibility
export const resendVerifyEmail = verifyEmail;
