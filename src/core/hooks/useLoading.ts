/**
 * 加载状态 Hook
 */
import { useState, useCallback } from 'react';

export interface UseLoadingOptions {
  defaultLoading?: boolean;
}

export interface UseLoadingReturn {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

export const useLoading = (options?: UseLoadingOptions): UseLoadingReturn => {
  const [loading, setLoading] = useState(options?.defaultLoading || false);

  const withLoading = useCallback(async <T>(promise: Promise<T>): Promise<T> => {
    setLoading(true);
    try {
      return await promise;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, setLoading, withLoading };
};
