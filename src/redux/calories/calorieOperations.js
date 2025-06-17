import api from '../../axiosSetup';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { selectToken } from '../auth/selectors';

// Calculate daily calories (public endpoint - no auth required)
export const calculateDailyCaloriesPublic = createAsyncThunk(
  'calories/calculatePublic',
  async ({ age, height, weight, desiredWeight, bloodType }, { rejectWithValue }) => {
    try {
      const response = await api.post('/products/public/daily', {
        age,
        height,
        weight,
        desiredWeight,
        bloodType
      });

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);

// Calculate and save daily calories (private endpoint - requires auth)
export const calculateDailyCaloriesPrivate = createAsyncThunk(
  'calories/calculatePrivate',
  async (
    { age, height, weight, desiredWeight, bloodType },
    { getState, rejectWithValue }
  ) => {
    const token = selectToken(getState());
    if (!token) {
      return rejectWithValue('No token found');
    }

    try {
      const response = await api.post('/products/private/daily', {
        age,
        height,
        weight,
        desiredWeight,
        bloodType
      });

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);
