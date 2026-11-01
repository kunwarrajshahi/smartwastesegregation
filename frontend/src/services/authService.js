/**
 * Authentication Service Module
 * Handles user registration, login, token management, and profile retrieval.
 */

import { apiRequest } from './api';

export const TOKEN_STORAGE_KEY = 'token';
export const USER_STORAGE_KEY = 'user';

/**
 * Register a new user account.
 * Endpoint: POST /api/auth/register
 */
export async function register({ email, password, full_name, role = 'operator' }) {
  const result = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name, role }),
  });

  if (result.access_token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, result.access_token);
    if (result.user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
    }
  }

  return result;
}

/**
 * Log in an existing user.
 * Endpoint: POST /api/auth/login
 */
export async function login({ email, password }) {
  const result = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (result.access_token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, result.access_token);
    if (result.user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
    }
  }

  return result;
}

/**
 * Retrieve current logged-in user profile.
 * Endpoint: GET /api/auth/me
 */
export async function getMe() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return null;

  try {
    const user = await apiRequest('/api/auth/me', {
      method: 'GET',
    });
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  } catch (err) {
    // If token expired or invalid, clear stored session
    if (err.status === 401) {
      logout();
    }
    throw err;
  }
}

/**
 * Update user profile details.
 * Endpoint: PUT /api/auth/profile
 */
export async function updateProfile(data) {
  const user = await apiRequest('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  return user;
}

/**
 * Log out and remove stored tokens.
 */
export function logout() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * Get stored token if any.
 */
export function getStoredToken() {
  return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
}

/**
 * Get stored user if any.
 */
export function getStoredUser() {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  getStoredToken,
  getStoredUser,
};
