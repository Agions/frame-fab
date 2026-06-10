/**
 * 轮询 Hook
 */
import { useState, useCallback, useRef, useEffect } from 'react';

export interface UsePollingOptions {
  interval?: number;
  immediate?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

export interface UsePollingReturn {
  start: () => void;
  stop: () => void;
  isPolling: boolean;
}

export const usePolling = (
  fetchFn: () => Promise<unknown>,
  options: UsePollingOptions = {}
): UsePollingReturn => {
  const { interval = 5000, immediate = true, onSuccess, onError } = options;
  const [isPolling, setIsPolling] = useState(immediate);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => setIsPolling(true), []);

  const stop = useCallback(() => {
    setIsPolling(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    try {
      const data = await fetchFn();
      onSuccess?.(data);
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }, [fetchFn, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      poll();
      timerRef.current = setInterval(poll, interval);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [immediate, poll, interval]);

  return { start, stop, isPolling };
};
