import { Header } from './Header/Header';
import { Routes, Route } from 'react-router-dom';
import { MainPage } from 'pages/MainPage/MainPage';
import { LoginPage } from 'pages/LoginPage';
import { RegistrationPage } from 'pages/RegistrationPage';
import { VerificationPage } from 'pages/VerificationPage';
import { DiaryPage } from 'pages/DiaryPage';
import CalculatorPage from 'pages/CalculatorPage';
import { RestrictedRoute } from './RestrictedRoute/RestrictedRoute';
import { ProtectedRoute } from './ProtectedRoute/ProtectedRoute';
import { useAuth } from 'hooks/useAuth';
import { SharedLayout } from './SharedLayout/SharedLayout';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { refreshUser } from '../redux/auth/authOperations';
import { fetchProfile } from '../redux/profile/profileOperations';
import { fetchDiaryEntries } from '../redux/diary/diaryOperations';
import { Loader } from './Loader/Loader';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from './ErrorBoundary/ErrorBoundary';
import 'react-toastify/dist/ReactToastify.css';

export const App = () => {
  const { isLoggedIn, token, isRefreshing } = useAuth();
  const dispatch = useDispatch();
  const selectedDate = useSelector(state => state.diary.selectedDate);
  // Effect to check token validity on app start
  useEffect(() => {
    // Attempt refresh on app start if we have a token but validity is uncertain
    if (token && !isRefreshing) {
      // Try to decode token to check expiry
      try {
        const { exp } = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (exp < currentTime) {
          // Token is expired, try to refresh
          dispatch(refreshUser());
        } else {
          // Token is still valid, just refresh user data
          dispatch(fetchProfile());
        }
      } catch (error) {
        console.error('Error processing token:', error);
        dispatch(refreshUser()); // Try refresh as fallback
      }
    }
  }, [token, dispatch, isRefreshing]);

  // Effect to load data when logged in and date changes
  useEffect(() => {
    if (isLoggedIn && !isRefreshing) {
      dispatch(fetchDiaryEntries(selectedDate));
    }
  }, [dispatch, isLoggedIn, selectedDate, isRefreshing]);

  // Render Loader if refreshing token
  if (isRefreshing) {
    return (
      <div className="h-[100vh] w-[100vw] flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="relative">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <div className="fixed -z-[1]">
          <SharedLayout />
        </div>
        <div>
          <Header />
          <Routes>
            {/* Public */}
            <Route
              path="/"
              element={isLoggedIn ? <CalculatorPage /> : <MainPage />}
            />

            {/* Restricted Routes */}
            <Route
              path="/login"
              element={
                <RestrictedRoute component={LoginPage} redirectTo="/calculator" />
              }
            />
            <Route
              path="/register"
              element={
                <RestrictedRoute
                  component={RegistrationPage}
                  redirectTo="/calculator"
                />
              }
            />
            <Route
              path="/verify"
              element={
                <RestrictedRoute
                  component={VerificationPage}
                  redirectTo="/calculator"
                />
              }
            />

            {/* Protected Routes */}
            <Route
              path="/diary"
              element={
                <ProtectedRoute component={DiaryPage} redirectTo="/login" />
              }
            />
            <Route
              path="/calculator"
              element={
                <ProtectedRoute component={CalculatorPage} redirectTo="/login" />
              }
            />

            {/* Catch-all for non-existent routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute component={DiaryPage} redirectTo="/diary" />
              }
            />
          </Routes>
        </div>
      </div>
    </ErrorBoundary>
  );
};
