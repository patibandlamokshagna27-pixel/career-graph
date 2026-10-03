const getStoredOverride = (key) => {
  try {
    return localStorage.getItem(`CONFIG_OVERRIDE_${key}`);
  } catch {
    return null;
  }
};

const getRuntimeOverride = (key) => {
  if (import.meta.env.DEV) {
    return getStoredOverride(key);
  }
  return null;
};

export const config = {
  get apiBaseUrl() {
    return (
      getRuntimeOverride('VITE_API_BASE_URL') ||
      import.meta.env.VITE_API_BASE_URL ||
      'http://localhost:8000/api'
    );
  },

  get nlpParserEndpoint() {
    return `${this.apiBaseUrl}/resume/upload`;
  },

  get assessmentEndpoint() {
    return (
      getRuntimeOverride('VITE_ASSESSMENT_ENDPOINT') ||
      import.meta.env.VITE_ASSESSMENT_ENDPOINT ||
      `${this.apiBaseUrl}/assessment`
    );
  },

  get interviewEndpoint() {
    return (
      getRuntimeOverride('VITE_INTERVIEW_ENDPOINT') ||
      import.meta.env.VITE_INTERVIEW_ENDPOINT ||
      `${this.apiBaseUrl}/interview`
    );
  },

  get timeoutMs() {
    return Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15000;
  },

  get isDev() {
    return import.meta.env.DEV;
  },

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

  resetOverrides() {
    try {
      const keys = [
        'VITE_API_BASE_URL',
        'VITE_NLP_PARSER_ENDPOINT',
        'VITE_ASSESSMENT_ENDPOINT',
        'VITE_INTERVIEW_ENDPOINT'
      ];

      keys.forEach((key) => {
        localStorage.removeItem(`CONFIG_OVERRIDE_${key}`);
      });
    } catch (e) {
      console.error('Failed to reset config overrides:', e);
    }
  }
};