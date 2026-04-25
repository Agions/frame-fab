/**
 * 通用 Hooks
 * 可复用的 React Hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import { logger } from '@/core/utils/logger';

import { debounce, throttle } from './index';

/**
 * 使用本地存储
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.error('useLocalStorage error:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      logger.error('useLocalStorage setValue error:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// 定义函数类型
type GenericFunction = (...args: unknown[]) => unknown;

/**
 * 使用防抖
 */
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

/**
 * 使用节流
 */
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

/**
 * 窗口大小类型
 */
export interface WindowSize {
  width: number;
  height: number;
}

/**
 * 使用窗口大小
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * 使用点击外部
 */
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

/**
 * 倒计时返回值类型
 */
type CountdownReturn = [number, () => void, () => void, () => void];

/**
 * 使用倒计时
 */
export function useCountdown(initialSeconds: number): CountdownReturn {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const isActiveRef = useRef(isActive);

  // Keep ref in sync with state
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
      // Defer setIsActive to avoid synchronous call in effect
      const id = setTimeout(() => {
        isActiveRef.current = false;
        setIsActive(false);
      }, 0);
      return () => clearTimeout(id);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, seconds]);

  return [seconds, start, pause, reset];
}

/**
 * 异步操作返回类型
 */
interface UseAsyncReturn<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  execute: () => Promise<void>;
}

/**
 * 使用异步操作
 */
export function useAsync<T>(asyncFunction: () => Promise<T>, immediate = false): UseAsyncReturn<T> {
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

  // Defer execute to avoid synchronous setState in effect
  useEffect(() => {
    if (immediate) {
      const id = setTimeout(() => execute(), 0);
      return () => clearTimeout(id);
    }
  }, [immediate, execute]);

  return { data, error, loading, execute };
}

/**
 * 使用上一状态
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  /* eslint-disable react-hooks/refs */
  const prev = ref.current;
  ref.current = value;
  return prev;
  /* eslint-enable react-hooks/refs */
}

/**
 * 使用挂载状态
 */
export function useMounted(): boolean {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Return a stable value that consumers can use
  // The ref should be accessed in event handlers, not render
  // eslint-disable-next-line react-hooks/refs
  return mountedRef.current;
}

/**
 * 使用更新效果（跳过首次渲染）
 */
export function useUpdateEffect(effect: React.EffectCallback, deps?: React.DependencyList): void {
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

/**
 * 使用键盘事件
 */
export function useKeyPress(targetKey: string, callback: () => void): void {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [targetKey, callback]);
}

/**
 * 使用在线状态
 */
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

/**
 * 使用媒体查询
 */
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

/**
 * 滚动位置类型
 */
interface ScrollPosition {
  x: number;
  y: number;
}

/**
 * 使用滚动位置
 */
export function useScrollPosition(): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setPosition({ x: window.scrollX, y: window.scrollY });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return position;
}

/**
 * 使用可见性
 */
export function useVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return isVisible;
}

/**
 * 使用自动保存
 */
export function useAutoSave<T>(data: T, saveFunction: (data: T) => void | Promise<void>, delay = 30000): void {
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      saveFunction(dataRef.current);
    }, delay);

    return () => clearInterval(interval);
  }, [saveFunction, delay]);
}