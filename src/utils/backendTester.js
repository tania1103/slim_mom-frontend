/**
 * Backend connectivity tester
 * Verifică ce endpoint-uri sunt disponibile și trezește serverul
 */
import axios from 'axios';

// Backend URL configuration
const BACKEND_URL = process.env.REACT_APP_API_URL || 
                   'https://slimmom-backend-y9wy.onrender.com';

// Wake up the backend server (for services like Render that sleep)
export const wakeUpBackend = async () => {
  console.log('🚀 Waking up backend server...');

  const wakeUpAttempts = 3;

  for (let i = 1; i <= wakeUpAttempts; i++) {
    try {
      console.log(`⏰ Wake up attempt ${i}/${wakeUpAttempts}...`);      // First try the health endpoint
      try {
        const healthResponse = await axios.get(`${BACKEND_URL}/health`, {
          timeout: 10000,
          validateStatus: () => true
        });
        
        if (healthResponse.status === 200) {
          console.log('✅ Backend is awake and responding to health check!');
          return true;
        }
      } catch (healthError) {
        console.log('Health endpoint failed, trying root endpoint...');
      }
      
      // If health endpoint fails, try root endpoint
      const response = await axios.get(`${BACKEND_URL}`, {
        timeout: 15000,
        validateStatus: () => true
      });

      if (response.status === 200) {
        console.log('✅ Backend is awake and responding to root endpoint!');
        return true;
      }
    } catch (error) {
      console.log(`⚠️  Attempt ${i} failed: ${error.message}`);
      if (i < wakeUpAttempts) {
        console.log('⏳ Waiting 10 seconds before next attempt...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  console.log('❌ Failed to wake up backend after all attempts');
  return false;
};

export const testBackendConnectivity = async () => {
  console.log('🔍 Testing backend connectivity...');

  // First try to wake up the backend
  await wakeUpBackend();

  const endpoints = [
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/refresh',    '/api/products/search',
    '/api/products/blood-type/1',
    '/api/diary',
    '/api/profile',
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/refresh',
    '/api/products/search',
    '/api/products/blood-type/1',
    '/api/diary',
    '/api/profile',
    '/',
    '/api',
    '/health',
    '/status'
  ];

  const results = {};

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
        timeout: 5000,
        validateStatus: (status) => status < 500 // Accept 4xx as "accessible"
      });

      results[endpoint] = {
        status: response.status,
        accessible: true,
        data: typeof response.data === 'string' ? response.data.substring(0, 100) : response.data
      };

      console.log(`✅ ${endpoint} - ${response.status}`);

    } catch (error) {
      results[endpoint] = {
        status: error.response?.status || 'NETWORK_ERROR',
        accessible: false,
        error: error.message
      };

      if (error.response?.status === 404) {
        console.log(`❌ ${endpoint} - 404 Not Found`);
      } else if (error.response?.status < 500) {
        console.log(`⚠️  ${endpoint} - ${error.response.status} (accessible but error)`);
      } else {
        console.log(`💥 ${endpoint} - ${error.message}`);
      }
    }
  }

  // Analyze results
  const accessible = Object.entries(results).filter(([, result]) => result.accessible);
  const working = accessible.filter(([, result]) => result.status < 400);

  console.log('\n📊 Backend Analysis:');
  console.log(`Total endpoints tested: ${endpoints.length}`);
  console.log(`Accessible endpoints: ${accessible.length}`);
  console.log(`Working endpoints: ${working.length}`);

  if (working.length > 0) {
    console.log('\n✅ Working endpoints:');
    working.forEach(([endpoint, result]) => {
      console.log(`  ${endpoint} - ${result.status}`);
    });
  }

  return results;
};

// Auto-test on import in development
if (process.env.NODE_ENV === 'development') {
  // Run test after a short delay to avoid blocking app startup
  setTimeout(() => {
    testBackendConnectivity().catch(console.error);
  }, 2000);
}
