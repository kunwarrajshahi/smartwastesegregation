/**
 * Centralized API Client Service
 * Configured with Vite environment variables, comprehensive error handling,
 * and automatic FormData Content-Type boundary resolution.
 */

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Core HTTP Request Wrapper
 *
 * @param {string} endpoint - Path relative to API_BASE_URL (e.g. '/' or '/predict')
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = { ...(options.headers || {}) };

  // Attach JWT Bearer token if stored and not explicitly provided
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // CRITICAL: When body is FormData, do NOT set 'Content-Type'.
  // The browser must automatically set 'multipart/form-data; boundary=...'
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  } else if (!headers['Content-Type'] && options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Extract response body (attempt JSON first, fallback to text)
    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => '');
      data = text ? { detail: text } : null;
    }

    if (!response.ok) {
      let errorMessage = 'An unexpected server error occurred.';

      if (data) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          // FastAPI validation errors
          errorMessage = data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else if (data.error) {
          errorMessage = data.detail ? `${data.error}: ${data.detail}` : data.error;
        } else if (Array.isArray(data.errors)) {
          errorMessage = data.errors.join(', ');
        }
      }

      // Contextual status messages
      if (response.status === 413) {
        errorMessage = 'Uploaded image exceeds the 10 MB payload limit.';
      } else if (response.status === 415) {
        errorMessage = 'Unsupported image format. Allowed formats: JPEG, PNG, WEBP, BMP.';
      } else if (response.status === 503) {
        errorMessage = 'The AI model is unavailable or failed to initialize on the server.';
      }

      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network level failure (e.g. backend offline, CORS blocked, connection refused)
    const isNetworkError =
      error instanceof TypeError ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('NetworkError');

    if (isNetworkError) {
      throw new ApiError(
        `Unable to reach the backend at ${API_BASE_URL}. Please ensure the FastAPI server is running on port 8000.`,
        0,
        { originalError: error.message }
      );
    }

    throw new ApiError(error.message || 'An unknown network error occurred.', 500);
  }
}

export default {
  API_BASE_URL,
  apiRequest,
  ApiError,
};
