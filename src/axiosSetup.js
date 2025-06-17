import axios from 'axios';
import { store } from './redux/store';
import { logout } from './redux/auth/authOperations';
import { MockAPI } from './utils/mockAPI';
import { wakeUpBackend } from './utils/backendTester';

// Create axios instance with baseURL and JSON headers
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://slimmom-backend-y9wy.onrender.com',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Track if backend is available
let backendAvailable = true;
let wakeUpAttempted = false;

// Wake up backend on app start
const ensureBackendAwake = async () => {
  if (!wakeUpAttempted) {
    wakeUpAttempted = true;
    console.log('🚀 Attempting to wake up backend server...');
    try {
      const isAwake = await wakeUpBackend();
      backendAvailable = isAwake;
      console.log(`✅ Backend availability: ${backendAvailable ? 'ONLINE' : 'OFFLINE'}`);
    } catch (error) {
      console.error('❌ Error checking backend status:', error);
      backendAvailable = false;
    }
  }
  return backendAvailable;
};

// Start wake up process immediately
ensureBackendAwake()
  .then(() => {
    if (!backendAvailable) {
      console.warn('⚠️ Backend unavailable - fallback to Mock API will be used');
    }
  });

// Helper function to extract user ID from token using jwt-decode
const getUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    // Import jwtDecode from jwt-decode
    const { jwtDecode } = require('jwt-decode');
    const decoded = jwtDecode(token);
    return decoded.userId || decoded.id;
  } catch (error) {
    console.error('❌ Error decoding token:', error);
    return null;
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with Mock API fallback
api.interceptors.response.use(
  (response) => {
    // Backend is working
    backendAvailable = true;
    return response;
  },
  async (error) => {
    const { config, response } = error;

    // Log detailed error info for debugging
    console.error('📌 API Request Error:', {
      url: config?.url,
      method: config?.method,
      status: response?.status,
      errorCode: error.code,
      errorMessage: error.message,
      data: response?.data
    });
    
    // Check for various backend unavailability conditions
    const isBackendUnavailable = (
      !response ||
      response?.status === 404 ||
      response?.status === 503 ||
      response?.status === 500 ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ERR_FAILED' ||
      error.code === 'ERR_CONNECTION_REFUSED' ||
      (typeof error.message === 'string' && (
        error.message.includes('CORS') ||
        error.message.includes('Network Error') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Cannot resolve') ||
        error.message.includes('Receiving end does not exist')
      ))
    );

    // Check if it's an auth error that should still try Mock API
    const isAuthError = response?.status === 401 && config?.url?.includes('/api/auth/');

    if (isBackendUnavailable || isAuthError) {
      console.warn('🔄 Backend issue detected, falling back to Mock API:', config.url);
      console.warn('🔧 Error details:', error.message, error.code, response?.status);
      backendAvailable = false;

      // Try to handle with Mock API
      try {
        const mockResponse = await handleWithMockAPI(config);
        if (mockResponse) {
          console.log('✅ Mock API handled request successfully');
          return mockResponse;
        }
      } catch (mockError) {
        console.error('❌ Mock API error:', mockError.message);
        // For auth errors, still reject with original error
        if (config.url.includes('/api/auth/')) {
          return Promise.reject(mockError);
        }
      }
    }

    // Handle 401 Unauthorized (but not for auth endpoints that should use Mock API)
    if (response?.status === 401 && !config.url.includes('/api/auth/')) {
      console.log('🔓 Unauthorized, logging out...');
      store.dispatch(logout());
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Mock API request handler
async function handleWithMockAPI(config) {
  if (!MockAPI.isEnabled) return null;

  const { method, url, data } = config;
  const token = store.getState().auth.token;
  const userId = getUserIdFromToken(token);

  try {
    // Auth endpoints
    if (url.includes('/api/auth/register') && method === 'post') {
      return await MockAPI.register(data);
    }

    if (url.includes('/api/auth/login') && method === 'post') {
      return await MockAPI.login(data);
    }

    if (url.includes('/api/auth/refresh') && method === 'post') {
      return await MockAPI.refreshToken(data.refreshToken);
    }

    if (url.includes('/api/auth/logout') && method === 'post') {
      return await MockAPI.logout();
    }

    // Product endpoints
    if (url.includes('/api/products/search') && method === 'get') {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const query = urlParams.get('title') || urlParams.get('query') || '';
      return await MockAPI.searchProducts(query);
    }

    if (url.includes('/api/products/blood-type') && method === 'get') {
      const bloodType = url.split('/').pop();
      return await MockAPI.getProductsByBloodType(bloodType);
    }

    // Diary endpoints (require auth)
    if (!userId && (url.includes('/api/diary') || url.includes('/api/profile'))) {
      throw new Error('Authentication required');
    }

    if (url.includes('/api/diary/add') && method === 'post') {
      return await MockAPI.addDiaryEntry(data, userId);
    }

    if (url.includes('/api/diary/fetch') && method === 'get') {
      const date = new URLSearchParams(url.split('?')[1]).get('date');
      return await MockAPI.getDiaryEntries(date, userId);
    }

    if (url.includes('/api/diary/delete') && method === 'delete') {
      const entryId = parseInt(url.split('/').pop());
      return await MockAPI.deleteDiaryEntry(entryId, userId);
    }

    // Profile endpoints (require auth)
    if (url.includes('/api/profile/update') && method === 'put') {
      console.log('🔧 Profile update - userId:', userId, 'data:', data);
      return await MockAPI.updateProfile(data, userId);
    }

    if (url.includes('/api/profile/fetch') && method === 'get') {
      console.log('🔧 Profile fetch - userId:', userId);
      return await MockAPI.getProfile(userId);
    }

  } catch (error) {
    // Format error to match Axios error structure
    const axiosError = new Error(error.message);
    axiosError.response = {
      data: { message: error.message },
      status: error.message.includes('not found') ? 404 : 400,
      statusText: error.message
    };
    throw axiosError;
  }

  return null;
}

// Export status checker
export const isBackendAvailable = () => backendAvailable;

console.log(`🌐 API configured: ${api.defaults.baseURL}`);
if (MockAPI.isEnabled) {
  console.log('🔧 Mock API fallback enabled');
}

export default api;
