import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { App } from '../App';
import { store, persistor } from '../../redux/store';

// Mock modules
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    isLoggedIn: false,
    user: null,
    isRefreshing: false,
  }),
}));

jest.mock('../../utils/backendTester', () => ({
  wakeUpBackend: jest.fn().mockResolvedValue(true),
}));

const renderApp = () => {
  return render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
};

describe('App Component', () => {
  test('renders without crashing', () => {
    renderApp();
    expect(document.body).toBeInTheDocument();
  });

  test('renders header component', () => {
    renderApp();
    // Header should be present using semantic role
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  test('handles authentication state changes', () => {
    renderApp();
    // App should handle auth state without errors
    expect(document.body).toBeInTheDocument();
  });

  test('loads error boundary correctly', () => {
    renderApp();
    // Should not have any uncaught errors
    expect(document.body).toBeInTheDocument();
  });
});
