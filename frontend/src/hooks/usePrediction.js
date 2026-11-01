import { useState, useCallback, useEffect } from 'react';
import {
  checkHealth,
  getModelInfo,
  predictImage,
} from '../services/predictionService';

/**
 * Custom React Hook for Managing Waste Classification and Model State
 *
 * Provides:
 * - predict(file): runs actual POST /predict against FastAPI backend
 * - prediction: actual backend response or null
 * - isLoading: boolean state during inference
 * - error: user-facing error message or null
 * - isBackendOnline: boolean indicating if GET / responded successfully
 * - modelInfo: metadata from GET /model-info
 * - reset(): clears prediction and error state
 */
export function usePrediction({ autoCheckHealth = true } = {}) {
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  // Health check query
  const checkBackendHealth = useCallback(async () => {
    try {
      const res = await checkHealth();
      const isOnline = res?.status === 'success';
      setIsBackendOnline(isOnline);
      return isOnline;
    } catch {
      setIsBackendOnline(false);
      return false;
    }
  }, []);

  // Fetch model metadata
  const fetchModelMetadata = useCallback(async () => {
    try {
      const info = await getModelInfo();
      setModelInfo(info);
      return info;
    } catch (err) {
      // Don't crash if backend is down; record error
      console.warn('Unable to retrieve model information:', err.message);
      return null;
    }
  }, []);

  // Run initial health and model metadata check on mount if requested
  useEffect(() => {
    if (autoCheckHealth) {
      checkBackendHealth().then((online) => {
        if (online) {
          fetchModelMetadata();
        }
      });
    }
  }, [autoCheckHealth, checkBackendHealth, fetchModelMetadata]);

  // Execute classification request
  const predict = useCallback(async (file, fileName, weightKg) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await predictImage(file, fileName, weightKg);

      // Enforce: only set state with the genuine backend response
      setPrediction(response);
      setIsBackendOnline(true);
      return response;
    } catch (err) {
      const msg = err.message || 'Failed to classify image.';
      setError(msg);
      setPrediction(null);
      if (err.status === 0) {
        setIsBackendOnline(false);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPrediction(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    predict,
    prediction,
    isLoading,
    error,
    isBackendOnline,
    modelInfo,
    checkBackendHealth,
    fetchModelMetadata,
    reset,
    clearError,
  };
}

export default usePrediction;
