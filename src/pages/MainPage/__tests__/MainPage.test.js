import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { MainPage } from '../MainPage';
import authSlice from '../../../redux/auth/authSlice';
import productSlice from '../../../redux/product/productSlice';
import profileSlice from '../../../redux/profile/profileSlice';

// Mock the hooks and modules
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ isLoggedIn: false })
}));

jest.mock('../../../redux/product/productOperation', () => ({
  fetchProductsByBloodType: jest.fn()
}));

jest.mock('../../../redux/profile/profileOperations', () => ({
  updateProfile: jest.fn()
}));

// Create a test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice,
      product: productSlice,
      profile: profileSlice
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isLoggedIn: false,
        isRefreshing: false
      },
      product: {
        items: [],
        isLoading: false,
        error: null
      },
      profile: {
        userProfile: null,
        isLoading: false,
        error: null
      }
    }
  });
};

const renderWithProviders = (component, store = createTestStore()) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('MainPage with Formik', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders calculator form with all fields', () => {
    renderWithProviders(<MainPage />);

    expect(screen.getByText('Calculate your daily calorie intake right now')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Height in cm')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Age')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('Weight in kg')).toHaveLength(2); // Current and desired weight
    expect(screen.getByText('Blood type *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start losing weight/i })).toBeInTheDocument();
  });

  test('displays validation errors for empty form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainPage />);

    const submitButton = screen.getByRole('button', { name: /start losing weight/i });
    
    // Try to submit empty form
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Height is required')).toBeInTheDocument();
      expect(screen.getByText('Age is required')).toBeInTheDocument();
      expect(screen.getByText('Current weight is required')).toBeInTheDocument();
      expect(screen.getByText('Desired weight is required')).toBeInTheDocument();
      expect(screen.getByText('Blood type is required')).toBeInTheDocument();
    });
  });

  test('validates numeric field ranges', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainPage />);

    const heightInput = screen.getByPlaceholderText('Height in cm');
    const ageInput = screen.getByPlaceholderText('Age');

    // Test invalid height
    await user.type(heightInput, '50');
    await user.tab(); // Trigger blur to show validation

    await waitFor(() => {
      expect(screen.getByText('Height must be at least 100 cm')).toBeInTheDocument();
    });

    // Test invalid age
    await user.clear(heightInput);
    await user.type(heightInput, '180');
    await user.type(ageInput, '15');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Age must be at least 18 years')).toBeInTheDocument();
    });
  });

  test('enables submit button when all fields are valid', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainPage />);

    const heightInput = screen.getByPlaceholderText('Height in cm');
    const ageInput = screen.getByPlaceholderText('Age');
    const currentWeightInputs = screen.getAllByPlaceholderText('Weight in kg');
    const currentWeightInput = currentWeightInputs[0];
    const desiredWeightInput = currentWeightInputs[1];
    const bloodTypeRadio = screen.getByLabelText('1', { selector: 'input[type="radio"]' });
    const submitButton = screen.getByRole('button', { name: /start losing weight/i });

    // Fill in valid data
    await user.type(heightInput, '175');
    await user.type(ageInput, '30');
    await user.type(currentWeightInput, '80');
    await user.type(desiredWeightInput, '70');
    await user.click(bloodTypeRadio);

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('displays calculating state when form is submitted', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainPage />);

    // Fill form with valid data
    await user.type(screen.getByPlaceholderText('Height in cm'), '175');
    await user.type(screen.getByPlaceholderText('Age'), '30');
    const weightInputs = screen.getAllByPlaceholderText('Weight in kg');
    await user.type(weightInputs[0], '80');
    await user.type(weightInputs[1], '70');
    await user.click(screen.getByLabelText('1', { selector: 'input[type="radio"]' }));

    const submitButton = screen.getByRole('button', { name: /start losing weight/i });
    await user.click(submitButton);

    // Should show calculating state
    expect(screen.getByText('Calculating...')).toBeInTheDocument();
  });

  test('blood type radio buttons work correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainPage />);

    const bloodType1 = screen.getByLabelText('1', { selector: 'input[type="radio"]' });
    const bloodType2 = screen.getByLabelText('2', { selector: 'input[type="radio"]' });

    // Select blood type 1
    await user.click(bloodType1);
    expect(bloodType1).toBeChecked();
    expect(bloodType2).not.toBeChecked();

    // Select blood type 2
    await user.click(bloodType2);
    expect(bloodType2).toBeChecked();
    expect(bloodType1).not.toBeChecked();
  });
});
