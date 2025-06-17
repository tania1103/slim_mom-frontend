// Manually export specific items to avoid circular dependencies
import { register, login, logout, refreshUser, verifyEmail, getCurrentUser } from './authOperations';
import { authReducer } from './authSlice';
import * as selectors from './selectors';

// Export operations
export { register, login, logout, refreshUser, verifyEmail, getCurrentUser };

// Export reducer
export { authReducer };

// Export selectors
export const {
  selectToken,
  selectUser,
  selectIsLoggedIn,
  selectIsRefreshing,
  selectIsLoading,
  selectAuthError,
  selectAuthState,
  selectIsVerified,
  selectUserName,
  selectUserEmail
} = selectors;
