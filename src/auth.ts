/**
 * Auth utility - handles JWT token management
 */

export const setAuthToken = (token: string): void => {
  sessionStorage.setItem('authToken', token);
};

export const getAuthToken = (): string | null => {
  return sessionStorage.getItem('authToken');
};

export const clearAuthToken = (): void => {
  sessionStorage.removeItem('authToken');
};

export const getUserId = (): string | null => {
  return sessionStorage.getItem('userId');
};

export const setUserId = (userId: string): void => {
  sessionStorage.setItem('userId', userId);
};

export const clearUserId = (): void => {
  sessionStorage.removeItem('userId');
};
