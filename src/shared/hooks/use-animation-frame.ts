/**
 * RequestAnimationFrame Animation Hooks
 * Provides RAF-based hooks for efficient animation handling
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================
// Types
// ============================================

export interface UseRAFOptions {
  /** Whether to start immediately on mount. Default: false */
  autoStart?: boolean;
  /** Callback when animation frame fires */
  onTick?: (deltaTime: number, elapsedTime: number) => void;
}

export interface UseRAFCallbacks {
  /** Start the animation loop */
  start: () => void;
  /** Stop the animation loop */
  stop: () => void;
  /** Toggle the animation loop */
  toggle: () => void;
  /** Check if animation is running */
  isRunning: boolean;
}

export interface UseRAFLoopOptions {
  /** Initial running state. Default: false */
  initialRunning?: boolean;
  /** Frames per second throttle. 0 = no throttle. Default: 0 */
  fps?: number;
}

export interface UseRAFLoopReturn {
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  /** Current frame count */
  frame: number;
  /** Current elapsed time in ms */
  elapsed: number;
  /** Current FPS (rolling average) */
  fps: number;
}

export interface UseThrottleRAFOptions {
  /** Throttle interval in ms. Default: 16.67 (60fps) */
  interval?: number;
  /** Whether to lead with an immediate call. Default: true */
  leading?: boolean;
  /** Whether to trail with a call on stop. Default: false */
  trailing?: boolean;
}

export interface UseThrottleRAFReturn {
  /** Execute the callback, throttled by RAF and interval */
  throttled: (callback: () => void) => void;
  /** Cancel any pending RAF call */
  cancel: () => void;
  /** Check if a RAF is pending */
  isPending: boolean;
}

// ============================================
// useRAF - Single RAF callback wrapper
// ============================================

/**
 * Wraps a callback in a single RAF call.
 * Returns control functions for the animation.
 *
 * @example
 * ```tsx
 * const { start, stop, isRunning } = useRAF({
 *   autoStart: true,
 *   onTick: (dt, elapsed) => {
 *     // Update animation state
 *   }
 * });
 * ```
 */
export const useRAF = (options: UseRAFOptions = {}): UseRAFCallbacks => {
  const { autoStart = false, onTick } = options;

  const [isRunning, setIsRunning] = useState(autoStart);
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const callbacksRef = useRef(onTick);
  callbacksRef.current = onTick;

  const stop = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const toggle = useCallback(() => {
    setIsRunning((prev) => {
      if (prev) {
        // Stop
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      }
      return !prev;
    });
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const tick = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const deltaTime = lastTimeRef.current !== null ? timestamp - lastTimeRef.current : 0;

      lastTimeRef.current = timestamp;
      callbacksRef.current?.(deltaTime, elapsed);

      rafIdRef.current = requestAnimationFrame(tick);
    };

    startTimeRef.current = null;
    lastTimeRef.current = null;
    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isRunning]);

  return { start, stop, toggle, isRunning };
};

// ============================================
// useRAFLoop - Continuous RAF loop with controls
// ============================================

/**
 * Provides a continuous RAF loop with start/stop control
 * and built-in FPS throttling.
 *
 * @example
 * ```tsx
 * const { isRunning, start, stop, frame, elapsed, fps } = useRAFLoop({
 *   initialRunning: true,
 *   fps: 60
 * });
 * ```
 */
export const useRAFLoop = (options: UseRAFLoopOptions = {}): UseRAFLoopReturn => {
  const { initialRunning = false, fps = 0 } = options;

  const [isRunning, setIsRunning] = useState(initialRunning);
  const [frame, setFrame] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [fpsValue, setFpsValue] = useState(0);

  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const fpsAccumRef = useRef(0);
  const fpsSampleStartRef = useRef<number | null>(null);
  const throttleIntervalRef = useRef(fps > 0 ? 1000 / fps : 0);
  const lastThrottleRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const tick = (timestamp: number) => {
      // FPS throttling
      if (fps > 0 && lastThrottleRef.current !== null) {
        const elapsed = timestamp - lastThrottleRef.current;
        if (elapsed < throttleIntervalRef.current) {
          rafIdRef.current = requestAnimationFrame(tick);
          return;
        }
        lastThrottleRef.current = timestamp;
      }

      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
        fpsSampleStartRef.current = timestamp;
      }

      const currentElapsed = timestamp - startTimeRef.current;
      const deltaTime = lastTimeRef.current !== null ? timestamp - lastTimeRef.current : 0;
      lastTimeRef.current = timestamp;

      frameCountRef.current += 1;
      setFrame(frameCountRef.current);
      setElapsed(currentElapsed);

      // Calculate rolling FPS (over 1 second window)
      fpsAccumRef.current += deltaTime;
      const sampleElapsed = timestamp - (fpsSampleStartRef.current ?? timestamp);
      if (sampleElapsed >= 1000) {
        const calculatedFps = Math.round((frameCountRef.current * 1000) / sampleElapsed);
        setFpsValue(calculatedFps);
        // Reset counters
        frameCountRef.current = 0;
        fpsAccumRef.current = 0;
        fpsSampleStartRef.current = timestamp;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    startTimeRef.current = null;
    lastTimeRef.current = null;
    frameCountRef.current = 0;
    lastThrottleRef.current = null;

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isRunning, fps]);

  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);
  const toggle = useCallback(() => setIsRunning((prev) => !prev), []);

  return { isRunning, start, stop, toggle, frame, elapsed, fps };
};

// ============================================
// useThrottleRAF - Throttle a callback by RAF + interval
// ============================================

/**
 * Returns a throttled version of the callback that combines
 * RAF timing with an optional minimum interval.
 *
 * @example
 * ```tsx
 * const { throttled, cancel, isPending } = useThrottleRAF({ interval: 100 });
 *
 * // Safe to call rapidly - will execute at most once per RAF/interval
 * throttled(() => { console.log('expensive work'); });
 * ```
 */
export const useThrottleRAF = (options: UseThrottleRAFOptions = {}): UseThrottleRAFReturn => {
  const { interval = 16.67, leading = true, trailing = false } = options;

  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const lastArgsRef = useRef<(() => void) | null>(null);
  const trailingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cancel = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (trailingTimeoutRef.current !== null) {
      clearTimeout(trailingTimeoutRef.current);
      trailingTimeoutRef.current = null;
    }
    lastArgsRef.current = null;
  }, []);

  const throttled = useCallback(
    (callback: () => void) => {
      const now = performance.now();

      // If we're within the throttle interval, queue the latest callback
      if (lastTimeRef.current !== null) {
        const elapsed = now - lastTimeRef.current;
        if (elapsed < interval) {
          lastArgsRef.current = callback;

          // Schedule trailing call if enabled
          if (trailing && trailingTimeoutRef.current === null) {
            const remaining = interval - elapsed;
            trailingTimeoutRef.current = setTimeout(() => {
              if (lastArgsRef.current) {
                lastArgsRef.current();
                lastArgsRef.current = null;
              }
              trailingTimeoutRef.current = null;
            }, remaining);
          }
          return;
        }
      }

      // Execute immediately on leading edge
      if (leading) {
        lastTimeRef.current = now;
        callback();
      } else {
        lastTimeRef.current = now;
      }

      // Schedule RAF for trailing or non-leading cases
      if (!leading && rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          const timeSinceLast = performance.now() - (lastTimeRef.current ?? performance.now());
          if (timeSinceLast >= interval && lastArgsRef.current) {
            lastArgsRef.current();
            lastArgsRef.current = null;
          }
          rafIdRef.current = null;
        });
      }
    },
    [interval, leading, trailing]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  const isPending = rafIdRef.current !== null || lastArgsRef.current !== null;

  return { throttled, cancel, isPending };
};

// ============================================
// Export all hooks
// ============================================

export default {
  useRAF,
  useRAFLoop,
  useThrottleRAF,
};
