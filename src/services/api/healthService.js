import { apiClient } from './client';
import { config } from '../../config/env';

/**
 * Health check service to inspect backend availability.
 */
export const healthService = {
  /**
   * Ping backend root or health endpoint
   */
  async checkHealth() {
    const startTime = performance.now();
    const result = await apiClient.get('/health', { timeout: 3000 });
    const latency = Math.round(performance.now() - startTime);

    if (result.ok) {
      return {
        online: true,
        latency,
        details: result.data || { status: 'healthy' },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      online: false,
      latency: null,
      error: result.error,
      isOffline: result.isOffline,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Test a custom user-defined endpoint
   */
  async pingUrl(url) {
    const startTime = performance.now();
    const result = await apiClient.request(url, { method: 'GET', timeout: 4000 });
    const latency = Math.round(performance.now() - startTime);

    return {
      ok: result.ok,
      status: result.status,
      latency: result.ok ? latency : null,
      error: result.error,
    };
  }
};
