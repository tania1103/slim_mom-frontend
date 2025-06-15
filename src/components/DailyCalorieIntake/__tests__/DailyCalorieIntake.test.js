import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DailyCalorieIntake } from '../DailyCalorieIntake';
import profileReducer from '../../../redux/profile/profileSlice';

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      profile: profileReducer,
    },
    preloadedState: {
      profile: {
        userProfile: null,
        isLoading: false,
        error: null,
        ...initialState.profile,
      },
    },
  });
};

const renderWithStore = (component, initialState = {}) => {
  const store = createTestStore(initialState);
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('DailyCalorieIntake Component', () => {
  test('renders without profile data', () => {
    renderWithStore(<DailyCalorieIntake />);

    expect(screen.getByText(/calculate your daily calorie intake/i)).toBeInTheDocument();
  });

  test('displays calorie information when profile exists', () => {
    const profileState = {
      profile: {
        userProfile: {
          dailyCalories: 2000,
          recommendedCalories: 1800,
          notAllowedProducts: ['sugar', 'chocolate']
        }
      }
    };

    renderWithStore(<DailyCalorieIntake />, profileState);

    expect(screen.getByText(/2000/)).toBeInTheDocument();
    expect(screen.getByText(/1800/)).toBeInTheDocument();
  });

  test('shows loading state', () => {
    const loadingState = {
      profile: { isLoading: true }
    };

    renderWithStore(<DailyCalorieIntake />, loadingState);

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  test('displays not allowed products', () => {
    const profileState = {
      profile: {
        userProfile: {
          notAllowedProducts: ['Chocolate', 'Sugar', 'White bread']
        }
      }
    };

    renderWithStore(<DailyCalorieIntake />, profileState);

    expect(screen.getByText(/chocolate/i)).toBeInTheDocument();
    expect(screen.getByText(/sugar/i)).toBeInTheDocument();
    expect(screen.getByText(/white bread/i)).toBeInTheDocument();
  });

  test('handles empty not allowed products list', () => {
    const profileState = {
      profile: {
        userProfile: {
          notAllowedProducts: []
        }
      }
    };

    renderWithStore(<DailyCalorieIntake />, profileState);

    expect(screen.getByText(/no restrictions/i)).toBeInTheDocument();
  });
});
