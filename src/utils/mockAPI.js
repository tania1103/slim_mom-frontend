/**
 * Mock API pentru development când backend-ul nu e disponibil
 * Simulează toate endpoint-urile necesare
 */
import productsData from '../components/data/products.json';

// Mock users database
const mockUsers = new Map();
let mockUserIdCounter = 1;

// Mock diary entries
const mockDiaryEntries = new Map();
let mockDiaryIdCounter = 1;

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
      // Find user by email
    for (const [userId, user] of mockUsers) {
      if (user.email === email && user.password === password) {
        const { password: _, ...userWithoutPassword } = user;
        const token = generateMockToken(userId);

        return {
          data: {
            user: userWithoutPassword,
            token,
            refreshToken: `refresh_${token}`
          }
        };
      }
    }

    throw new Error('Invalid credentials');
  }

  static async refreshToken(refreshToken) {
    await delay();

    // Extract user ID from refresh token
    const userId = Math.floor(Math.random() * mockUserIdCounter) + 1;
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
  }

  static async logout() {
    await delay();
    return { data: { message: 'Logged out successfully' } };
  }

  // Product endpoints
  static async searchProducts(query) {
    await delay();

    const filteredProducts = productsData.filter(product =>
      product.title.toLowerCase().includes(query.toLowerCase())
    );

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

    const user = mockUsers.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = { ...user, ...profileData };
    mockUsers.set(userId, updatedUser);

    const { password: _, ...userWithoutPassword } = updatedUser;
    return { data: userWithoutPassword };
  }

  static async getProfile(userId) {
    await delay();

    const user = mockUsers.get(userId);
    if (!user) {
      throw new Error('Profile not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return { data: userWithoutPassword };
  }
}

// Initialize with some demo data
if (MockAPI.isEnabled) {
  console.log('🔧 Mock API enabled for development');

  // Add demo user
  mockUsers.set(1, {
    id: 1,
    name: 'Demo User',
    email: 'demo@slimmom.com',
    password: 'demo123',
    height: 170,
    age: 25,
    currentWeight: 70,
    desiredWeight: 65,
    bloodType: 2,
    dailyCalories: 1800,
    createdAt: new Date().toISOString(),
    isVerified: true
  });

  mockUserIdCounter = 2;
}
