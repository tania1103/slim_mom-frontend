import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../../../redux/store';
import { Header } from '../Header';

// Mock useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    isLoggedIn: false,
    user: null,
  }),
}));

const renderHeader = (isLoggedIn = false) => {
  // Mock the hook for different scenarios
  require('../../../hooks/useAuth').useAuth = () => ({
    isLoggedIn,
    user: isLoggedIn ? { name: 'Test User' } : null,
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    </Provider>
  );
};

describe('Header Component', () => {
  test('renders header for unauthenticated user', () => {
    renderHeader(false);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('renders header for authenticated user', () => {
    renderHeader(true);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('displays logo', () => {
    renderHeader();
    // Logo should be present in header - look for link to home
    const logoLink = screen.getByRole('link', { name: /home|logo/i }) ||
                    screen.getByText(/slim|mom/i);
    expect(logoLink).toBeInTheDocument();
  });

  test('shows navigation component', () => {
    renderHeader();
    // Navigation should be rendered
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });
});
