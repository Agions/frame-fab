/**
 * 异步操作 Hook
 */
import { useState, useCallback, useRef } from 'react';

export interface UseAsyncOptions<T> {
  defaultValue?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface UseAsyncReturn<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
  reset: () => void;
}

export const useAsync = <T>(
  asyncFn: () => Promise<T>,
  options?: UseAsyncOptions<T>
): UseAsyncReturn<T> => {
  const [data, setData] = useState<T | undefined>(options?.defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      if (mountedRef.current) {
        setData(result);
        options?.onSuccess?.(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [asyncFn, options]);

  const reset = useCallback(() => {
    setData(options?.defaultValue);
    setError(null);
    setLoading(false);
  }, [options?.defaultValue]);

  return { data, loading, error, execute, reset };
};
