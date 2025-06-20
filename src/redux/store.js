import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './auth';
import { diaryReducer } from './diary/diarySlice';
import { productReducer } from './product/productSlice';
import { profileReducer } from './profile/profileSlice';
import calorieReducer from './calories/calorieSlice';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token', 'refreshToken'],
};

const persistedReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedReducer,
    diary: diaryReducer,
    product: productReducer,
    profile: profileReducer,
    calories: calorieReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
