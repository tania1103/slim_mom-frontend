import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../../../redux/store';
import { UserInfo } from '../UserInfo';

// Mock useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    isLoggedIn: true,
    user: { name: 'Test User' },
  }),
}));

// Mock Notiflix
jest.mock('notiflix', () => ({
  Confirm: {
    init: jest.fn(),
    show: jest.fn(),
  },
  Loading: {
    init: jest.fn(),
    remove: jest.fn(),
    standard: jest.fn(),
  },
}));

const renderUserInfo = () => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <UserInfo />
      </BrowserRouter>
    </Provider>
  );
};

describe('UserInfo Component', () => {
  test('renders user name when logged in', () => {
    renderUserInfo();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('renders exit button', () => {
    renderUserInfo();
    expect(screen.getByText('Exit')).toBeInTheDocument();
  });

  test('calls logout when exit button is clicked', () => {
    const Notiflix = require('notiflix');
    renderUserInfo();

    const exitButton = screen.getByText('Exit');
    fireEvent.click(exitButton);

    expect(Notiflix.Confirm.show).toHaveBeenCalled();
  });

  test('renders separator line', () => {
    renderUserInfo();
    // Look for SVG separator using test id
    const svgElement = screen.getByTestId('separator-line');
    expect(svgElement).toBeInTheDocument();
  });
});
