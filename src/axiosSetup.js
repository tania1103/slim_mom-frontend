import axios from 'axios';
import { store } from './redux/store';
import { logout } from './redux/auth/authOperations';
import { MockAPI } from './utils/mockAPI';
import { wakeUpBackend } from './utils/backendTester';

// Set base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// Track if backend is available
let backendAvailable = true;
let wakeUpAttempted = false;

// Wake up backend on app start
const ensureBackendAwake = async () => {
  if (!wakeUpAttempted) {
    wakeUpAttempted = true;
    const isAwake = await wakeUpBackend();
    backendAvailable = isAwake;
  }
};

// Start wake up process immediately
ensureBackendAwake();

// Helper function to extract user ID from token
const getUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch {
    return null;
  }
};

// Request interceptor
axios.interceptors.request.use(
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
axios.interceptors.response.use(
  (response) => {
    // Backend is working
    backendAvailable = true;
    return response;
  },
  async (error) => {
    const { config, response } = error;

    // Check if it's a 404 or network error (backend down)
    if (!response || response.status === 404 || error.code === 'NETWORK_ERROR') {
      console.warn('🔄 Backend unavailable, falling back to Mock API:', config.url);
      backendAvailable = false;

      // Try to handle with Mock API
      try {
        const mockResponse = await handleWithMockAPI(config);
        if (mockResponse) {
          return mockResponse;
        }
      } catch (mockError) {
        console.error('Mock API error:', mockError);
      }
    }

    // Handle 401 Unauthorized
    if (response?.status === 401) {
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
    if (url.includes('/auth/register') && method === 'post') {
      return await MockAPI.register(data);
    }

    if (url.includes('/auth/login') && method === 'post') {
      return await MockAPI.login(data);
    }

    if (url.includes('/auth/refresh') && method === 'post') {
      return await MockAPI.refreshToken(data.refreshToken);
    }

    if (url.includes('/auth/logout') && method === 'post') {
      return await MockAPI.logout();
    }

    // Product endpoints
    if (url.includes('/product/search') && method === 'get') {
      const query = new URLSearchParams(url.split('?')[1]).get('query');
      return await MockAPI.searchProducts(query);
    }

    if (url.includes('/product/blood-type') && method === 'get') {
      const bloodType = url.split('/').pop();
      return await MockAPI.getProductsByBloodType(bloodType);
    }

    // Diary endpoints (require auth)
    if (!userId) {
      throw new Error('Authentication required');
    }

    if (url.includes('/diary/add') && method === 'post') {
      return await MockAPI.addDiaryEntry(data, userId);
    }

    if (url.includes('/diary/fetch') && method === 'get') {
      const date = new URLSearchParams(url.split('?')[1]).get('date');
      return await MockAPI.getDiaryEntries(date, userId);
    }

    if (url.includes('/diary/delete') && method === 'delete') {
      const entryId = parseInt(url.split('/').pop());
      return await MockAPI.deleteDiaryEntry(entryId, userId);
    }

    // Profile endpoints (require auth)
    if (url.includes('/profile/update') && method === 'put') {
      return await MockAPI.updateProfile(data, userId);
    }

    if (url.includes('/profile/fetch') && method === 'get') {
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

console.log(`🌐 API configured: ${axios.defaults.baseURL}`);
if (MockAPI.isEnabled) {
  console.log('🔧 Mock API fallback enabled');
}
