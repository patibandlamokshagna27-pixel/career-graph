import { apiClient } from './client';
import { config } from '../../config/env';

/**
 * Service for Resume parsing and NLP skill extraction.
 */
export const resumeService = {
  /**
   * Upload resume file (PDF, DOCX, TXT) to backend NLP parser
   * @param {File} file
   */
  async uploadAndParseResume(file) {
    const formData = new FormData();
    formData.append('file', file);

    const result = await apiClient.postForm(config.nlpParserEndpoint, formData, {
      timeout: 30000, // NLP parsing may take longer
    });

    if (result.ok) {
      return {
        success: true,
        data: result.data, // Expected: { candidateName, contact, skills: { technical: [], frameworks: [], tools: [], soft: [] }, experienceYears: number }
        error: null,
      };
    }

    return {
      success: false,
      data: null,
      error: result.error,
      isOffline: result.isOffline,
    };
  }
};
