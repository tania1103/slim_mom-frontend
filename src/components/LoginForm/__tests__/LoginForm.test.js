import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { LoginForm } from '../LoginForm';
import authReducer from '../../redux/auth/authSlice';

// Mock store for testing
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isLoading: false,
        error: null,
        ...initialState.auth,
      },
    },
  });
};

const renderWithStore = (component, initialState = {}) => {
  const store = createTestStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('LoginForm Component', () => {
  test('renders login form fields', () => {
    renderWithStore(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('validates email format', async () => {
    renderWithStore(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  test('validates password requirements', async () => {
    renderWithStore(<LoginForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  test('shows loading state during submission', () => {
    const loadingState = { auth: { isLoading: true } };
    renderWithStore(<LoginForm />, loadingState);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('displays error messages', () => {
    const errorState = { auth: { error: 'Invalid credentials' } };
    renderWithStore(<LoginForm />, errorState);

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
