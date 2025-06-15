import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { formatDateForAPI } from '../../utils/dateHelpers';
import { selectToken } from '../auth/selectors';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

export const addToDiary = createAsyncThunk(
  'diary/addToDiary',
  async ({ date, grams, product }, { getState, rejectWithValue }) => {
    try {
      const token = selectToken(getState());
      const { calories, categories, title } = product;
      const calorieIntake = (grams * calories) / 100;

      const response = await axios.post(
        '/diary/add',
        {
          date, // Use the passed date here
          title,
          grams,
          calories,
          calorieIntake,
          category: categories,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
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
      const response = await axios.get(`/diary/fetch?date=${formattedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
      await axios.delete(`/diary/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return id; // Return the id of the deleted item
    } catch (error) {
      return rejectWithValue(
        error.response?.data ||
          'An error occurred while deleting the diary entry'
      );
    }
  }
);
