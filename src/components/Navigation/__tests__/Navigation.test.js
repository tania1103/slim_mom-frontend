import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from '../Navigation';

// Mock useAuth hook
const mockUseAuth = jest.fn();
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderNavigation = () => {
  return render(
    <BrowserRouter>
      <Navigation />
    </BrowserRouter>
  );
};

describe('Navigation Component', () => {
  test('renders login and register links when not logged in', () => {
    mockUseAuth.mockReturnValue({ isLoggedIn: false });

    renderNavigation();

    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByText('Registration')).toBeInTheDocument();
  });

  test('renders diary and calculator links when logged in', () => {
    mockUseAuth.mockReturnValue({ isLoggedIn: true });

    renderNavigation();

    expect(screen.getByText('Diary')).toBeInTheDocument();
    expect(screen.getByText('Calculator')).toBeInTheDocument();
  });
  test('navigation links have correct hrefs', () => {
    mockUseAuth.mockReturnValue({ isLoggedIn: false });

    renderNavigation();

    const loginLink = screen.getByRole('link', { name: /log in/i });
    const registerLink = screen.getByRole('link', { name: /registration/i });

    expect(loginLink).toHaveAttribute('href', '/login');
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('authenticated navigation links have correct hrefs', () => {
    mockUseAuth.mockReturnValue({ isLoggedIn: true });

    renderNavigation();

    const diaryLink = screen.getByRole('link', { name: /diary/i });
    const calculatorLink = screen.getByRole('link', { name: /calculator/i });

    expect(diaryLink).toHaveAttribute('href', '/diary');
    expect(calculatorLink).toHaveAttribute('href', '/calculator');
  });
});
