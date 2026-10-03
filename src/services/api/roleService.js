import { apiClient } from './client';
import { ROLE_TAXONOMY } from '../../data/rolesBenchmark';

export const roleService = {
  /**
   * Fetch available benchmark roles from backend or fallback to standard taxonomy
   */
  async getRoles() {
    const res = await apiClient.get('/roles');
    if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
      return { data: res.data, source: 'backend', error: null };
    }
    // Return standard industry taxonomy benchmark
    return { data: ROLE_TAXONOMY, source: 'benchmark', error: res.error };
  },

  /**
   * Get specific role details by id
   */
  async getRoleById(roleId) {
    const res = await apiClient.get(`/roles/${roleId}`);
    if (res.ok && res.data) {
      return { data: res.data, source: 'backend', error: null };
    }
    const found = ROLE_TAXONOMY.find((r) => r.id === roleId);
    return { data: found || null, source: 'benchmark', error: null };
  }
};
