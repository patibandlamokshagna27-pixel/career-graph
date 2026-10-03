import { apiClient } from './client';

export const gapService = {
  /**
   * Calculate skill match and gaps against a target role
   * @param {Array<string>} userSkills - List of extracted or verified candidate skills
   * @param {Object} targetRole - Target role benchmark object
   */
  async calculateGaps(userSkills = [], targetRole) {
    if (!targetRole || !targetRole.requiredSkills) {
      return {
        matched: [],
        criticalGaps: [],
        moderateGaps: [],
        matchPercentage: 0,
        totalRequired: 0,
      };
    }

    // Try backend gap analysis endpoint first
    const backendResult = await apiClient.post('/skills/gap-analysis', {
      userSkills,
      roleId: targetRole.id,
    });

    if (backendResult.ok && backendResult.data) {
      return backendResult.data;
    }

    // Local deterministic matching algorithm against user's actual skills
    const normalizedUserSkills = userSkills.map((s) => s.toLowerCase().trim());
    const matched = [];
    const criticalGaps = [];
    const moderateGaps = [];

    targetRole.requiredSkills.forEach((req) => {
      const reqName = req.name.toLowerCase();
      // Check for partial or exact token overlap
      const isDirectMatch = normalizedUserSkills.some(
        (u) => reqName.includes(u) || u.includes(reqName) || (reqName.split(/[/ ,]+/).some((part) => part.length > 2 && u.includes(part)))
      );

      if (isDirectMatch) {
        matched.push(req);
      } else if (req.priority === 'High') {
        criticalGaps.push(req);
      } else {
        moderateGaps.push(req);
      }
    });

    const totalRequired = targetRole.requiredSkills.length;
    const matchPercentage = totalRequired > 0 ? Math.round((matched.length / totalRequired) * 100) : 0;

    return {
      matched,
      criticalGaps,
      moderateGaps,
      matchPercentage,
      totalRequired,
    };
  }
};
