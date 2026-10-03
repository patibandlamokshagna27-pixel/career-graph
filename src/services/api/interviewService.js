import { apiClient } from './client';
import { config } from '../../config/env';

export const interviewService = {
  /**
   * Initialize a role-specific AI mock interview session
   */
  async startSession(roleId, interviewType = 'Technical') {
    const res = await apiClient.post(`${config.interviewEndpoint}/start`, {
      roleId,
      interviewType,
    });

    if (res.ok && res.data) {
      return {
        success: true,
        sessionId: res.data.sessionId,
        firstQuestion: res.data.firstQuestion,
        error: null,
      };
    }

    return {
      success: false,
      error: res.error,
      isOffline: res.isOffline,
    };
  },

  /**
   * Submit an answer for the current interview turn
   */
  async submitAnswer(sessionId, question, answer, questionIndex) {
    const res = await apiClient.post(`${config.interviewEndpoint}/turn`, {
      sessionId,
      question,
      answer,
      questionIndex,
    });

    if (res.ok && res.data) {
      return {
        success: true,
        feedback: res.data.feedback,
        nextQuestion: res.data.nextQuestion,
        isCompleted: Boolean(res.data.isCompleted),
        error: null,
      };
    }

    return {
      success: false,
      error: res.error,
      isOffline: res.isOffline,
    };
  },

  /**
   * Finalize interview and receive evaluation scorecard
   */
  async finalizeSession(sessionId) {
    const res = await apiClient.post(`${config.interviewEndpoint}/finalize`, { sessionId });
    if (res.ok && res.data) {
      return {
        success: true,
        scorecard: res.data.scorecard,
        error: null,
      };
    }

    return {
      success: false,
      scorecard: null,
      error: res.error,
    };
  }
};
