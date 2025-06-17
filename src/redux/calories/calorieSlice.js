import { createSlice } from '@reduxjs/toolkit';
import { calculateDailyCaloriesPublic, calculateDailyCaloriesPrivate } from './calorieOperations';

const initialState = {
  dailyRate: null,
  notAllowedProducts: [],
  isLoading: false,
  error: null
};

const calorieSlice = createSlice({
  name: 'calories',
  initialState,
  reducers: {
    resetCalories: () => initialState,
    setManualCalculation: (state, action) => {
      state.dailyRate = action.payload.dailyCalories;
      state.notAllowedProducts = action.payload.notRecommendedProducts || [];
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Public calculation
      .addCase(calculateDailyCaloriesPublic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(calculateDailyCaloriesPublic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailyRate = action.payload.dailyRate;
        state.notAllowedProducts = action.payload.notAllowedProducts || [];
      })
      .addCase(calculateDailyCaloriesPublic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Private calculation
      .addCase(calculateDailyCaloriesPrivate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(calculateDailyCaloriesPrivate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailyRate = action.payload.dailyRate;
        state.notAllowedProducts = action.payload.notAllowedProducts || [];
      })
      .addCase(calculateDailyCaloriesPrivate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { resetCalories, setManualCalculation } = calorieSlice.actions;
export default calorieSlice.reducer;
