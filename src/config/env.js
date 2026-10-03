/**
 * Centralized Application Configuration & Environment Variable Access
 * Allows reading from Vite environment variables and runtime developer overrides.
 */

const getStoredOverride = (key) => {
  try {
    return localStorage.getItem(`CONFIG_OVERRIDE_${key}`);
  } catch {
    return null;
  }
};

export const config = {
  // Base API URL
  get apiBaseUrl() {
    return (
      getStoredOverride('VITE_API_BASE_URL') ||
      import.meta.env.VITE_API_BASE_URL ||
      'http://localhost:8000/api'
    );
  },

  // NLP Resume Parser Endpoint
  get nlpParserEndpoint() {
    return (
      `${this.apiBaseUrl}/resume/upload`
    );
  },

  // Assessment & Evaluation Endpoint
  get assessmentEndpoint() {
    return (
      getStoredOverride('VITE_ASSESSMENT_ENDPOINT') ||
      import.meta.env.VITE_ASSESSMENT_ENDPOINT ||
      `${this.apiBaseUrl}/assessment`
    );
  },

  // Mock Interview LLM Endpoint
  get interviewEndpoint() {
    return (
      getStoredOverride('VITE_INTERVIEW_ENDPOINT') ||
      import.meta.env.VITE_INTERVIEW_ENDPOINT ||
      `${this.apiBaseUrl}/interview`
    );
  },

  // Network Timeout in MS
  get timeoutMs() {
    return Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15000;
  },

  // Environment mode
  get isDev() {
    return import.meta.env.DEV;
  },

  /**
   * Helper to set a runtime override for quick local API testing
   */
  setOverride(key, value) {
    try {
      if (value === null || value === undefined || value === '') {
        localStorage.removeItem(`CONFIG_OVERRIDE_${key}`);
      } else {
        localStorage.setItem(`CONFIG_OVERRIDE_${key}`, value);
      }
    } catch (e) {
      console.error('Failed to set config override in localStorage:', e);
    }
  },

  /**
   * Reset all developer overrides back to .env defaults
   */
  resetOverrides() {
    try {
      const keys = ['VITE_API_BASE_URL', 'VITE_NLP_PARSER_ENDPOINT', 'VITE_ASSESSMENT_ENDPOINT', 'VITE_INTERVIEW_ENDPOINT'];
      keys.forEach((k) => localStorage.removeItem(`CONFIG_OVERRIDE_${k}`));
    } catch (e) {
      console.error('Failed to reset config overrides:', e);
    }
  }
};
