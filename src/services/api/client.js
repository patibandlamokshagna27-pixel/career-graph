import { config } from '../../config/env';

/**
 * Standardized API client with connection detection, timeouts, and error handling.
 */
class ApiClient {
  constructor() {
    this.token = null;
  }

  setAuthToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${config.apiBaseUrl}${endpoint}`;
    const timeout = options.timeout || config.timeoutMs;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers = {
      'Accept': 'application/json',
      ...(!options.isFormData && { 'Content-Type': 'application/json' }),
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: (data && data.detail) || (data && data.message) || `HTTP error ${response.status}`,
          data: null,
          isOffline: false,
        };
      }

      return {
        ok: true,
        status: response.status,
        data,
        error: null,
        isOffline: false,
      };
    } catch (err) {
      clearTimeout(timeoutId);

      const isAborted = err.name === 'AbortError';
      const isNetworkError = err instanceof TypeError || isAborted;

      return {
        ok: false,
        status: 0,
        error: isAborted
          ? `Request timed out after ${timeout}ms. Is the backend server running?`
          : `Network error: Unable to reach backend server at ${url}. Check your connection and API settings.`,
        data: null,
        isOffline: isNetworkError,
      };
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  postForm(endpoint, formData, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
