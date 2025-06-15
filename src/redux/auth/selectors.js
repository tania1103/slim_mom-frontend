// Auth selectors - Modern naming convention
export const selectToken = state => state.auth.token;
export const selectUser = state => state.auth.user;
export const selectIsLoggedIn = state => state.auth.isLoggedIn;
export const selectIsRefreshing = state => state.auth.isRefreshing;
export const selectIsLoading = state => state.auth.isLoading;
export const selectAuthError = state => state.auth.error;
export const selectAuthState = state => state.auth;
export const selectIsVerified = state => state.auth.isVerified;
export const selectUserName = state => state.auth.user?.name;
export const selectUserEmail = state => state.auth.user?.email;

// Deprecated selectors - keep for backward compatibility
export const getToken = state => state.auth.token;
export const getUser = state => state.auth.user;
export const getIsRefreshing = state => state.auth.isRefreshing;
export const getIsLoading = state => state.auth.isLoading;
