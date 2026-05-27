/**
 * Hooks — 统一公共 Hooks 库
 *
 * 来源：
 * - packages/common/src/hooks/index.ts（原有 8 个）
 * - core/utils/hooks.ts（额外 7 个）
 *
 * 改造后：core/utils/hooks.ts 和 shared/utils/index.ts 中的 hooks 统一从本文件导入
 * 消除散落各处的重复 Hook 定义
 */

import { useState, useEffect, useCallback, useRef } from 'react';

type GenericFunction = (...args: unknown[]) => unknown;

function debounce<T extends GenericFunction>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function throttle<T extends GenericFunction>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

// ============================================
// useLocalStorage
// ============================================

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        window.localStorage.setItem(key, JSON.stringify(next));
        return next;
      });
    } catch (error) {
      console.error('[useLocalStorage] setValue error:', error);
    }
  }, [key]);

  return [storedValue, setValue];
}

// ============================================
// useStepNavigation
// ============================================

export interface StepDef {
  id: string;
  label: string;
  isCompleted?: boolean;
  isLocked?: boolean;
}

export interface UseStepNavigationOptions {
  steps: StepDef[];
  initialStep?: string;
  onStepChange?: (prev: string, next: string) => void;
}

export function useStepNavigation({
  steps,
  initialStep,
  onStepChange,
}: UseStepNavigationOptions) {
  const [currentStepId, setCurrentStepId] = useState<string>(
    initialStep ?? steps[0]?.id ?? ''
  );

  const currentIndex = steps.findIndex((s) => s.id === currentStepId);

  const goTo = useCallback((stepId: string) => {
    const targetStep = steps.find((s) => s.id === stepId);
    if (!targetStep || targetStep.isLocked) return;

    const prev = currentStepId;
    setCurrentStepId(stepId);
    onStepChange?.(prev, stepId);
  }, [steps, currentStepId, onStepChange]);

  const goNext = useCallback(() => {
    const next = steps[currentIndex + 1];
    if (next && !next.isLocked) goTo(next.id);
  }, [steps, currentIndex, goTo]);

  const goPrev = useCallback(() => {
    const prev = steps[currentIndex - 1];
    if (prev) goTo(prev.id);
  }, [steps, currentIndex, goTo]);

  const progress = steps.length > 0
    ? Math.round(((currentIndex + 1) / steps.length) * 100)
    : 0;

  return {
    currentStepId,
    currentIndex,
    steps,
    goTo,
    goNext,
    goPrev,
    progress,
    canGoNext: currentIndex < steps.length - 1,
    canGoPrev: currentIndex > 0,
  };
}

// ============================================
// useDebounce
// ============================================

type GenericFunction = (...args: unknown[]) => unknown;

export function useDebounce<T extends GenericFunction>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef<T>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => debounce(callbackRef.current as GenericFunction, delay)(...args),
    [delay]
  );
}

// ============================================
// useThrottle
// ============================================

export function useThrottle<T extends GenericFunction>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef<T>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => throttle(callbackRef.current as GenericFunction, limit)(...args),
    [limit]
  );
}

// ============================================
// useWindowSize
// ============================================

export interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// ============================================
// useClickOutside
// ============================================

export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: () => void
): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, handler]);
}

// ============================================
// useCountdown
// ============================================

export function useCountdown(initialSeconds: number): [number, () => void, () => void, () => void] {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const start = useCallback(() => {
    isActiveRef.current = true;
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    isActiveRef.current = false;
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    isActiveRef.current = false;
    setIsActive(false);
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActiveRef.current) {
      const id = setTimeout(() => {
        isActiveRef.current = false;
        setIsActive(false);
      }, 0);
      return () => clearTimeout(id);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, seconds]);

  return [seconds, start, pause, reset];
}

// ============================================
// useAsync
// ============================================

interface UseAsyncReturn<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  execute: () => Promise<void>;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = false
): UseAsyncReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      const id = setTimeout(() => execute(), 0);
      return () => clearTimeout(id);
    }
  }, [immediate, execute]);

  return { data, error, loading, execute };
}

// ============================================
// usePrevious
// ============================================

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  // eslint-disable-next-line react-hooks/refs
  const prev = ref.current;
  ref.current = value;
  return prev;
}

// ============================================
// useMounted
// ============================================

export function useMounted(): boolean {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef.current;
}

// ============================================
// useUpdateEffect (skip first render)
// ============================================

export function useUpdateEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ============================================
// useKeyPress
// ============================================

export function useKeyPress(targetKey: string, callback: () => void): void {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === targetKey) callback();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [targetKey, callback]);
}

// ============================================
// useOnlineStatus
// ============================================

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// ============================================
// useMediaQuery
// ============================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// ============================================
// useScrollPosition
// ============================================

export interface ScrollPosition {
  x: number;
  y: number;
}

export function useScrollPosition(): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setPosition({ x: window.scrollX, y: window.scrollY });
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return position;
}

// ============================================
// useVisibility
// ============================================

export function useVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return isVisible;
}

// ============================================
// useAutoSave
// ============================================

export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => void | Promise<void>,
  delay = 30000
): void {
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      saveFunction(dataRef.current);
    }, delay);
    return () => clearInterval(interval);
  }, [delay, saveFunction]);
}

export default {
  useLocalStorage,
  useStepNavigation,
  useDebounce,
  useThrottle,
  useWindowSize,
  useClickOutside,
  useCountdown,
  useAsync,
  usePrevious,
  useMounted,
  useUpdateEffect,
  useKeyPress,
  useOnlineStatus,
  useMediaQuery,
  useScrollPosition,
  useVisibility,
  useAutoSave,
};