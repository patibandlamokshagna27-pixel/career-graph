// src/services/api/assessmentService.js

import { apiClient } from './client';
import { config } from '../../config/env';

/**
 * Get the assessment API base endpoint.
 * Falls back to the standard backend path if config is missing.
 */
const ASSESSMENT_ENDPOINT =
  config?.assessmentEndpoint || '/api/assessment';

/**
 * Safely extract useful data from apiClient responses.
 *
 * Supports:
 * 1. Custom client:
 *    { ok: true, data: {...} }
 *
 * 2. Axios-style:
 *    { data: {...} }
 *
 * 3. Already-unwrapped:
 *    {...}
 */
const unwrapResponse = (response) => {
  if (!response) {
    return {};
  }

  if (response.data !== undefined) {
    return response.data || {};
  }

  return response;
};

/**
 * Extract an error message from different response formats.
 */
const normalizeError = (
  response,
  fallback = 'Assessment service error'
) => {
  console.error('Assessment API error:', response);

  return (
    response?.error ||
    response?.detail ||
    response?.message ||
    response?.response?.data?.detail ||
    response?.response?.data?.error ||
    fallback
  );
};

export const assessmentService = {
  // ============================================================
  // GENERATE RANDOM ASSESSMENT
  //
  // Backend:
  // POST /api/assessment/generate
  //
  // Returns:
  // {
  //   success: true,
  //   assessmentId: "...",
  //   questions: [...],
  //   totalQuestions: 12,
  //   skills: [...]
  // }
  // ============================================================

  async generateAssessment(
    roleId,
    focusSkills = [],
    difficulty = 'Intermediate'
  ) {
    try {
      const safeFocusSkills = Array.isArray(focusSkills)
        ? focusSkills
        : [];

      console.log('====================================');
      console.log('ASSESSMENT GENERATE REQUEST');
      console.log('Role ID:', roleId);
      console.log('Focus Skills:', safeFocusSkills);
      console.log('Difficulty:', difficulty);
      console.log('====================================');

      const payload = {
        // Different naming styles for backend compatibility
        role_id: roleId,
        roleId: roleId,
        role: roleId,

        focusSkills: safeFocusSkills,
        focus_skills: safeFocusSkills,

        difficulty,

        // Backend controls the actual randomized size.
        // This is only sent for compatibility.
        questionCount: 12,
        question_count: 12,
      };

      const response = await apiClient.post(
        `${ASSESSMENT_ENDPOINT}/generate`,
        payload
      );

      console.log(
        'ASSESSMENT GENERATE RAW RESPONSE:',
        response
      );

      // Custom apiClient failure
      if (response?.ok === false) {
        return {
          success: false,
          assessmentId: null,
          questions: [],
          totalQuestions: 0,
          skills: [],
          error: normalizeError(
            response,
            'Unable to generate assessment.'
          ),
          isOffline: response?.isOffline || false,
        };
      }

      const data = unwrapResponse(response);

      console.log(
        'ASSESSMENT GENERATE DATA:',
        data
      );

      const questions = Array.isArray(data?.questions)
        ? data.questions
        : [];

      const assessmentId =
        data?.assessmentId ||
        data?.assessment_id ||
        data?.id ||
        null;

      const totalQuestions =
        Number(
          data?.totalQuestions ??
          data?.total_questions ??
          questions.length
        ) || questions.length;

      const skills =
        Array.isArray(data?.skills)
          ? data.skills
          : Array.isArray(data?.focusSkills)
            ? data.focusSkills
            : safeFocusSkills;

      // SUCCESS
      if (
        (data?.success === true || response?.ok === true) &&
        questions.length > 0
      ) {
        return {
          success: true,

          assessmentId,

          questions,

          totalQuestions,

          skills,

          error: null,

          isOffline: false,
        };
      }

      // Some backends may not explicitly return success:true
      // but still return valid questions.
      if (questions.length > 0) {
        return {
          success: true,

          assessmentId,

          questions,

          totalQuestions,

          skills,

          error: null,

          isOffline: false,
        };
      }

      return {
        success: false,

        assessmentId,

        questions: [],

        totalQuestions: 0,

        skills,

        error:
          data?.error ||
          data?.detail ||
          'Backend returned no assessment questions.',

        isOffline: false,
      };
    } catch (error) {
      console.error(
        'ASSESSMENT GENERATE EXCEPTION:',
        error
      );

      return {
        success: false,
        assessmentId: null,
        questions: [],
        totalQuestions: 0,
        skills: [],
        error: normalizeError(
          error,
          'Unable to connect to the assessment backend.'
        ),
        isOffline: true,
      };
    }
  },

  // ============================================================
  // SUBMIT ASSESSMENT
  //
  // Backend:
  // POST /api/assessment/submit
  //
  // Important:
  // The backend uses assessmentId to score ONLY the randomized
  // questions given to this student.
  // ============================================================

  async submitAssessment(
    assessmentId,
    answers,
    roleId = null
  ) {
    try {
      console.log('====================================');
      console.log('ASSESSMENT SUBMIT REQUEST');
      console.log('Assessment ID:', assessmentId);
      console.log('Answers:', answers);
      console.log('Role ID:', roleId);
      console.log('====================================');

      if (!assessmentId) {
        return {
          success: false,
          assessmentId: null,
          score: 0,
          correct_answers: 0,
          total_questions: 0,
          answered_questions: 0,
          proficiency: null,
          readiness: null,
          report: null,
          error:
            'Assessment ID is missing. Please generate the assessment again.',
        };
      }

      const payload = {
        assessmentId,
        assessment_id: assessmentId,

        answers: answers || {},

        roleId,
        role_id: roleId,
      };

      const response = await apiClient.post(
        `${ASSESSMENT_ENDPOINT}/submit`,
        payload
      );

      console.log(
        'ASSESSMENT SUBMIT RAW RESPONSE:',
        response
      );

      if (response?.ok === false) {
        return {
          success: false,
          assessmentId,
          score: 0,
          correct_answers: 0,
          total_questions: 0,
          answered_questions: 0,
          proficiency: null,
          readiness: null,
          report: null,
          error: normalizeError(
            response,
            'Assessment submission failed.'
          ),
          isOffline: response?.isOffline || false,
        };
      }

      const data = unwrapResponse(response);

      console.log(
        'ASSESSMENT SUBMIT DATA:',
        data
      );

      const score = Number(
        data?.score ??
        data?.scorePct ??
        data?.percentage ??
        0
      );

      const correctAnswers = Number(
        data?.correct_answers ??
        data?.correctAnswers ??
        data?.correctCount ??
        0
      );

      const totalQuestions = Number(
        data?.total_questions ??
        data?.totalQuestions ??
        0
      );

      const answeredQuestions = Number(
        data?.answered_questions ??
        data?.answeredQuestions ??
        0
      );

      return {
        success:
          data?.success === true ||
          response?.ok === true,

        assessmentId:
          data?.assessmentId ||
          data?.assessment_id ||
          assessmentId,

        score,

        correct_answers:
          correctAnswers,

        total_questions:
          totalQuestions,

        answered_questions:
          answeredQuestions,

        proficiency:
          data?.proficiency ||
          null,

        readiness:
          data?.readiness ||
          null,

        report:
          data?.report ||
          data?.performance ||
          null,

        error:
          data?.error ||
          data?.detail ||
          null,

        isOffline: false,
      };
    } catch (error) {
      console.error(
        'ASSESSMENT SUBMIT EXCEPTION:',
        error
      );

      return {
        success: false,
        assessmentId,
        score: 0,
        correct_answers: 0,
        total_questions: 0,
        answered_questions: 0,
        proficiency: null,
        readiness: null,
        report: null,
        error: normalizeError(
          error,
          'Assessment submission failed.'
        ),
        isOffline: true,
      };
    }
  },

  // ============================================================
  // GET ASSESSMENT SKILLS
  //
  // GET /api/assessment/skills
  // ============================================================

  async getAssessmentSkills() {
    try {
      const response = await apiClient.get(
        `${ASSESSMENT_ENDPOINT}/skills`
      );

      console.log(
        'ASSESSMENT SKILLS RAW RESPONSE:',
        response
      );

      if (response?.ok === false) {
        return {
          success: false,
          skills: [],
          error: normalizeError(
            response,
            'Unable to load assessment skills.'
          ),
          isOffline: response?.isOffline || false,
        };
      }

      const data = unwrapResponse(response);

      return {
        success:
          data?.success !== false,

        skills:
          Array.isArray(data?.skills)
            ? data.skills
            : [],

        error:
          data?.error ||
          data?.detail ||
          null,

        isOffline: false,
      };
    } catch (error) {
      console.error(
        'GET ASSESSMENT SKILLS ERROR:',
        error
      );

      return {
        success: false,
        skills: [],
        error: normalizeError(
          error,
          'Unable to load assessment skills.'
        ),
        isOffline: true,
      };
    }
  },

  // ============================================================
  // GET QUESTIONS FOR ONE SKILL
  //
  // GET /api/assessment/questions/{skill}
  //
  // Backend returns a random selection of questions.
  // ============================================================

  async getQuestions(skill) {
    try {
      if (!skill) {
        return {
          success: false,
          skill: '',
          questions: [],
          error: 'Skill is required.',
        };
      }

      const response = await apiClient.get(
        `${ASSESSMENT_ENDPOINT}/questions/${encodeURIComponent(
          skill
        )}`
      );

      console.log(
        `QUESTIONS RAW RESPONSE [${skill}]:`,
        response
      );

      if (response?.ok === false) {
        return {
          success: false,
          skill,
          questions: [],
          error: normalizeError(
            response,
            `Unable to load questions for ${skill}.`
          ),
          isOffline: response?.isOffline || false,
        };
      }

      const data = unwrapResponse(response);

      const questions =
        Array.isArray(data?.questions)
          ? data.questions
          : [];

      return {
        success:
          data?.success !== false,

        skill:
          data?.skill ||
          skill,

        questions,

        error:
          data?.error ||
          data?.detail ||
          null,

        isOffline: false,
      };
    } catch (error) {
      console.error(
        `GET QUESTIONS ERROR [${skill}]:`,
        error
      );

      return {
        success: false,
        skill,
        questions: [],
        error: normalizeError(
          error,
          `Unable to load questions for ${skill}.`
        ),
        isOffline: true,
      };
    }
  },

  // ============================================================
  // HEALTH CHECK
  //
  // GET /api/health
  // ============================================================

  async checkBackend() {
    try {
      const response = await apiClient.get(
        '/api/health'
      );

      console.log(
        'ASSESSMENT BACKEND HEALTH:',
        response
      );

      if (response?.ok === false) {
        return {
          success: false,
          data: null,
          error: normalizeError(
            response,
            'Assessment backend is unavailable.'
          ),
          isOffline: response?.isOffline || false,
        };
      }

      const data = unwrapResponse(response);

      return {
        success: true,
        data,
        error: null,
        isOffline: false,
      };
    } catch (error) {
      console.error(
        'ASSESSMENT BACKEND HEALTH ERROR:',
        error
      );

      return {
        success: false,
        data: null,
        error: normalizeError(
          error,
          'Assessment backend is unavailable.'
        ),
        isOffline: true,
      };
    }
  },
};

export default assessmentService;