import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { healthService } from '../services/api/healthService';
import { config } from '../config/env';

const ApiStatusContext = createContext(null);

export const ApiStatusProvider = ({ children }) => {
  const [status, setStatus] = useState({
    checked: false,
    online: false,
    latency: null,
    error: null,
    lastChecked: null,
    apiBaseUrl: config.apiBaseUrl,
  });

  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await healthService.checkHealth();
      setStatus({
        checked: true,
        online: result.online,
        latency: result.latency,
        error: result.error,
        lastChecked: result.timestamp,
        apiBaseUrl: config.apiBaseUrl,
      });
    } catch (err) {
      setStatus({
        checked: true,
        online: false,
        latency: null,
        error: err.message,
        lastChecked: new Date().toISOString(),
        apiBaseUrl: config.apiBaseUrl,
      });
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    // Periodic background check every 45s
    const interval = setInterval(checkHealth, 45000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <ApiStatusContext.Provider value={{ ...status, isChecking, refreshStatus: checkHealth }}>
      {children}
    </ApiStatusContext.Provider>
  );
};

export const useApiStatus = () => {
  const context = useContext(ApiStatusContext);
  if (!context) {
    throw new Error('useApiStatus must be used within an ApiStatusProvider');
  }
  return context;
};
