/**
 * Mock API pentru development când backend-ul nu este disponibil
 * Simulează toate endpoint-urile necesare
 */
import productsData from '../components/data/products.json';

// LocalStorage keys
const MOCK_USERS_KEY = 'mockAPI_users';
const MOCK_DIARY_KEY = 'mockAPI_diary';
const MOCK_COUNTERS_KEY = 'mockAPI_counters';

// Load data from localStorage
const loadMockData = () => {
  try {
    const usersData = localStorage.getItem(MOCK_USERS_KEY);
    const diaryData = localStorage.getItem(MOCK_DIARY_KEY);
    const countersData = localStorage.getItem(MOCK_COUNTERS_KEY);

    const users = usersData ? JSON.parse(usersData) : [];
    const diary = diaryData ? JSON.parse(diaryData) : [];
    const counters = countersData ? JSON.parse(countersData) : { userCounter: 1, diaryCounter: 1 };

    return { users, diary, counters };
  } catch (error) {
    console.warn('🔧 Failed to load mock data from localStorage:', error);
    return { users: [], diary: [], counters: { userCounter: 1, diaryCounter: 1 } };
  }
};

// Save data to localStorage
const saveMockData = (users, diary, counters) => {
  try {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
    localStorage.setItem(MOCK_DIARY_KEY, JSON.stringify(diary));
    localStorage.setItem(MOCK_COUNTERS_KEY, JSON.stringify(counters));
  } catch (error) {
    console.warn('🔧 Failed to save mock data to localStorage:', error);
  }
};

// Initialize data
const { users, diary, counters } = loadMockData();

// Mock users database
const mockUsers = new Map(users.map(user => [user.id, user]));
let mockUserIdCounter = counters.userCounter;

// Mock diary entries
const mockDiaryEntries = new Map(diary.map(entry => [entry.userId, entry.entries || []]));
let mockDiaryIdCounter = counters.diaryCounter;

// Helper to persist data - defined after mockUsers and mockDiaryEntries
const persistMockData = () => {
  const users = Array.from(mockUsers.entries()).map(([id, user]) => user);
  const diary = Array.from(mockDiaryEntries.entries()).map(([userId, entries]) => ({ userId, entries }));
  const counters = { userCounter: mockUserIdCounter, diaryCounter: mockDiaryIdCounter };

  saveMockData(users, diary, counters);
};

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Generate mock JWT token
const generateMockToken = (userId) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    id: userId,
    exp: Date.now() + 3600000, // 1 hour
    iat: Date.now()
  }));
  return `${header}.${payload}.mock-signature`;
};

// Initialize with default test user if no users exist
const initializeDefaultUser = () => {
  if (mockUsers.size === 0) {
    console.log('🔧 Creating default test user for Mock API');
    const defaultUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      createdAt: new Date().toISOString(),
      isVerified: true
    };
    mockUsers.set(1, defaultUser);
    mockUserIdCounter = 2;
    persistMockData();
    console.log('✅ Default user created: test@example.com / password123');
  }
};

// Initialize default user
initializeDefaultUser();

export class MockAPI {
  static isEnabled = process.env.REACT_APP_ENABLE_MOCK_FALLBACK === 'true';

  // Auth endpoints
  static async register(userData) {
    await delay();

    const { name, email, password } = userData;
      // Check if user already exists
    for (const [, user] of mockUsers) {
      if (user.email === email) {
        throw new Error('User already exists');
      }
    }

    const userId = mockUserIdCounter++;
    const user = {
      id: userId,
      name,
      email,
      createdAt: new Date().toISOString(),
      isVerified: true
    };

    mockUsers.set(userId, { ...user, password });
    persistMockData(); // Save to localStorage
    const token = generateMockToken(userId);

    return {
      data: {
        user,
        token,
        refreshToken: `refresh_${token}`
      }
    };
  }

  static async login(credentials) {
    await delay();

    const { email, password } = credentials;
    console.log('🔧 Mock login attempt for:', email);
    console.log('🔧 Available users:', Array.from(mockUsers.values()).map(u => ({ id: u.id, email: u.email })));

    // Find user by email
    for (const [userId, user] of mockUsers) {
      console.log('🔧 Checking user:', user.email, 'vs', email);
      if (user.email === email) {
        console.log('🔧 Email match found, checking password...');
        if (user.password === password) {
          console.log('✅ Login successful - userId:', userId);
          const { password: _, ...userWithoutPassword } = user;
          const token = generateMockToken(userId);

          return {
            data: {
              user: userWithoutPassword,
              token,
              refreshToken: `refresh_${token}`
            }
          };
        } else {
          console.log('❌ Password mismatch for user:', email);
        }
      }
    }

    console.error('❌ Login failed for:', email);
    console.log('🔧 Suggestion: Try test@example.com / password123');
    throw new Error('Invalid credentials');
  }

  static async refreshToken(refreshToken) {
    await delay();

    // For Mock API, we'll extract user ID from the refresh token
    // In production, this would validate the refresh token properly
    try {
      // Simple mock: extract userId from refresh token format "refresh_<base64>.<base64>.mock-signature"
      const tokenPart = refreshToken.replace('refresh_', '');
      const payload = JSON.parse(atob(tokenPart.split('.')[1]));
      const userId = payload.id;

      const user = mockUsers.get(userId);
      if (!user) {
        throw new Error('Invalid refresh token');
      }

      const { password: _, ...userWithoutPassword } = user;
      const newToken = generateMockToken(userId);

      return {
        data: {
          user: userWithoutPassword,
          token: newToken,
          refreshToken: `refresh_${newToken}`
        }
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
  static async logout() {
    await delay();
    return { data: { message: 'Logged out successfully' } };
  }

  // Product endpoints
  static async searchProducts(query) {
    await delay();

    if (!query || typeof query !== 'string') {
      return { data: [] };
    }

    const filteredProducts = productsData.filter(product => {
      if (!product || !product.title) {
        return false;
      }

      let title = '';
      if (typeof product.title === 'string') {
        title = product.title;
      } else if (typeof product.title === 'object' && product.title !== null) {
        title = product.title.ua || product.title.en || product.title.ru || '';
      }

      // Safety check - ensure both title and query are strings before calling toLowerCase
      if (typeof title !== 'string' || typeof query !== 'string') {
        return false;
      }

      return title.toLowerCase().includes(query.toLowerCase());
    });

    return {
      data: filteredProducts.slice(0, 10) // Limit to 10 results
    };
  }

  static async getProductsByBloodType(bloodType) {
    await delay();

    const notRecommended = productsData.filter(product => {
      return product.groupBloodNotAllowed &&
             product.groupBloodNotAllowed[bloodType.toString()] === true;
    });

    return {
      data: notRecommended
    };
  }

  // Diary endpoints
  static async addDiaryEntry(entryData, userId) {
    await delay();

    const entry = {
      id: mockDiaryIdCounter++,
      ...entryData,
      userId,
      createdAt: new Date().toISOString()
    };

    const userEntries = mockDiaryEntries.get(userId) || [];
    userEntries.push(entry);
    mockDiaryEntries.set(userId, userEntries);

    return { data: entry };
  }

  static async getDiaryEntries(date, userId) {
    await delay();

    const userEntries = mockDiaryEntries.get(userId) || [];
    const dateEntries = userEntries.filter(entry =>
      entry.date.startsWith(date.split('T')[0])
    );

    return { data: dateEntries };
  }

  static async deleteDiaryEntry(entryId, userId) {
    await delay();

    const userEntries = mockDiaryEntries.get(userId) || [];
    const filteredEntries = userEntries.filter(entry => entry.id !== entryId);
    mockDiaryEntries.set(userId, filteredEntries);

    return { data: { message: 'Entry deleted' } };
  }

  // Profile endpoints
  static async updateProfile(profileData, userId) {
    await delay();

    console.log('🔧 Mock updateProfile - userId:', userId, 'data:', profileData);
    console.log('Available users:', Array.from(mockUsers.keys()));

    const user = mockUsers.get(userId);
    if (!user) {
      console.error('❌ User not found in mockUsers. UserId:', userId, 'Available:', Array.from(mockUsers.entries()));
      throw new Error('User not found');
    }

    // Map the profile data to user fields
    const updatedUser = {
      ...user,
      ...profileData,
      // Ensure consistency with different naming conventions
      currentWeight: profileData.cWeight || profileData.currentWeight,
      desiredWeight: profileData.dWeight || profileData.desiredWeight
    };

    mockUsers.set(userId, updatedUser);
    persistMockData(); // Save to localStorage
    console.log('✅ Profile updated successfully for user:', userId);

    const { password: _, ...userWithoutPassword } = updatedUser;
    return { data: userWithoutPassword };
  }

  static async getProfile(userId) {
    await delay();

    console.log('🔧 Mock getProfile - userId:', userId, 'Available users:', Array.from(mockUsers.keys()));

    const user = mockUsers.get(userId);
    if (!user) {
      console.error('❌ Profile not found in mockUsers. UserId:', userId);
      throw new Error('Profile not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return { data: userWithoutPassword };
  }
}

// Initialize with some demo data
if (MockAPI.isEnabled) {
  console.log('🔧 Mock API enabled for development');
  console.log('📊 Loaded users:', Array.from(mockUsers.keys()));
  console.log('📊 Loaded diary entries:', Array.from(mockDiaryEntries.keys()));

  // If no users exist, add a default test user
  if (mockUsers.size === 0) {
    console.log('🔧 Creating default test user...');
    const defaultUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      height: 170,
      age: 25,
      currentWeight: 70,
      desiredWeight: 65,
      bloodType: 2,
      createdAt: new Date().toISOString(),
      isVerified: true
    };
    mockUsers.set(1, defaultUser);
    mockUserIdCounter = 2;
    persistMockData();
  }
}
