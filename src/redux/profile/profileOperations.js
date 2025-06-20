import api from '../../axiosSetup';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { selectToken } from '../auth/selectors';

// Update Profile
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (
    { height, dWeight, age, bloodType, cWeight, dailyCalories },
    { getState, rejectWithValue }
  ) => {
    const token = selectToken(getState());
    if (!token) {
      return rejectWithValue('No token found');
    }

    try {      const response = await api.put(
        '/profile/update',
        {
          height,
          dWeight,
          age,
          bloodType,
          cWeight,
          dailyCalories,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get Current Profile
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, thunkAPI) => {
    const token = selectToken(thunkAPI.getState());
    if (!token) {
      return thunkAPI.rejectWithValue('No token found');
    }

    try {      const response = await api.get('/profile/fetch');

      return response.data;
    } catch (error) {
      const status = error.response?.status;

      if (status === 404) {
        return thunkAPI.rejectWithValue(
          'Profile not found. Please calculate your daily calorie intake.'
        );
      } else {
        return thunkAPI.rejectWithValue(
          'An error occurred while fetching the profile. Please try again later.'
        );
      }
    }
  }
);
