import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../auth/authSlice';
import profileSlice from '../profile/profileSlice';
import diarySlice from '../diary/diarySlice';
import productSlice from '../product/productSlice';

// Test store configuration
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      profile: profileSlice,
      diary: diarySlice,
      product: productSlice,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
  });
};

describe('Redux Store Integration', () => {
  test('store is created with all reducers', () => {
    const store = createTestStore();
    const state = store.getState();

    expect(state.auth).toBeDefined();
    expect(state.profile).toBeDefined();
    expect(state.diary).toBeDefined();
    expect(state.product).toBeDefined();
  });

  test('auth state initial values', () => {
    const store = createTestStore();
    const authState = store.getState().auth;

    expect(authState.user).toBeNull();
    expect(authState.token).toBeNull();
    expect(authState.isLoggedIn).toBe(false);
    expect(authState.isLoading).toBe(false);
    expect(authState.isRefreshing).toBe(false);
    expect(authState.error).toBeNull();
  });

  test('profile state initial values', () => {
    const store = createTestStore();
    const profileState = store.getState().profile;

    expect(profileState.profile).toBeNull();
    expect(profileState.isLoading).toBe(false);
    expect(profileState.error).toBeNull();
  });

  test('diary state initial values', () => {
    const store = createTestStore();
    const diaryState = store.getState().diary;

    expect(diaryState.diaryEntries).toEqual([]);
    expect(diaryState.isLoading).toBe(false);
    expect(diaryState.error).toBeNull();
    expect(diaryState.selectedDate).toBeDefined();
  });

  test('product state initial values', () => {
    const store = createTestStore();
    const productState = store.getState().product;

    expect(productState.searchResults).toEqual([]);
    expect(productState.notRecommended).toEqual([]);
    expect(productState.isLoading).toBe(false);
    expect(productState.error).toBeNull();
  });

  test('store handles preloaded state', () => {
    const preloadedState = {
      auth: {
        user: { id: '1', name: 'Test User' },
        token: 'test-token',
        isLoggedIn: true,
        isLoading: false,
        isRefreshing: false,
        error: null,
      },
    };

    const store = createTestStore(preloadedState);
    const authState = store.getState().auth;

    expect(authState.user.name).toBe('Test User');
    expect(authState.token).toBe('test-token');
    expect(authState.isLoggedIn).toBe(true);
  });
});
