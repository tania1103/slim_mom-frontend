import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../axiosSetup';
import { formatDateForAPI } from '../../utils/dateHelpers';
import { selectToken } from '../auth/selectors';

export const addToDiary = createAsyncThunk(
  'diary/addToDiary',
  async ({ date, grams, product }, { getState, rejectWithValue }) => {
    try {
      // We don't need to explicitly use token as it's handled by axios interceptor
      // Just check that we have it
      if (!selectToken(getState())) {
        return rejectWithValue('No authentication token found');
      }
      
      const { calories, categories, title, _id: productId } = product;
      const calorieIntake = (grams * calories) / 100;      
      
      const response = await api.post(
        '/api/diary',
        {
          date,
          productId,
          grams,
          title,
          calories: calorieIntake,
          category: categories,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add product to diary');
    }
  }
);

export const fetchDiaryEntries = createAsyncThunk(
  'diary/fetchDiaryEntries',
  async (date, { getState, rejectWithValue }) => {
    const token = selectToken(getState());

    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    const formattedDate = formatDateForAPI(date);
    try {      
      const response = await api.get(`/api/diary/${formattedDate}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'An error occurred while fetching diary entries'
      );
    }
  }
);

export const deleteDiaryEntry = createAsyncThunk(
  'diary/deleteDiaryEntry',
  async (id, { getState, rejectWithValue }) => {
    const token = selectToken(getState());

    if (!token) {
      return rejectWithValue('No authentication token found');
    }

    try {      
      await api.delete(`/api/diary/${id}`);
      return id; // Return the id of the deleted item
    } catch (error) {
      return rejectWithValue(
        error.response?.data ||
          'An error occurred while deleting the diary entry'
      );
    }
  }
);
