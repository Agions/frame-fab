/**
 * 通用计时工具：防抖、节流、延迟、重试
 */

type GenericFunction = (...args: unknown[]) => unknown;

/** 防抖函数 */
export function debounce<T extends GenericFunction>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/** 节流函数 */
export function throttle<T extends GenericFunction>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/** 流水线处理延时常量（模拟真实操作耗时） */
export const PROCESSING_DELAY_MS = {
  FFMPEG_INIT: 800,
  FFMPEG_STREAM_MUX: 1200,
  FFMPEG_ENCODE: 1000,
  FFMPEG_AUDIO_MIX: 800,
  FFMPEG_MUX_MP4: 600,
  FFMPEG_FILE_WRITE: 500,
  EXPORT_VIDEO: 2000,
  CLIP_VIDEO: 1000,
  MERGE_VIDEO: 2000,
  ADD_SUBTITLE: 1500,
  REVIEW_RECHECK: 1000,
} as const;

/** 延迟 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 重试（指数退避） */
export async function retry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 1000): Promise<T> {
  let lastError: Error;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < attempts - 1) {
        await delay(delayMs * Math.pow(2, i));
      }
    }
  }
  throw lastError!;
}
