/**
 * NetworkTimeoutGuard — 网络超时保护器
 * 根本性修复：子步骤网络超时导致整个任务僵死
 *
 * 方案：
 * 1. 所有网络请求强制包裹 withTimeout()，设置合理超时
 * 2. 超时抛出明确 TimeoutError，而非静默失败
 * 3. DAG 引擎捕获超时后进入重试逻辑（根据 RetryPolicy）
 */

import { logger } from '@/core/utils/logger';

export interface RetryOptions {
  retries: number;
  retryDelayMs: number;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

/**
 * 将 Promise 包装为带超时的 Promise
 * @param promise 原 Promise
 * @param timeoutMs 超时毫秒
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new TimeoutError('Operation timed out after ' + timeoutMs + 'ms', timeoutMs));
    }, timeoutMs);

    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

/**
 * 带重试的 Promise 执行器
 * @param fn 要执行的异步函数（工厂函数，每次重试都会调用）
 * @param opts 重试选项
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;

      const shouldRetry = opts.shouldRetry
        ? opts.shouldRetry(lastError)
        : isRetryableError(lastError);

      if (attempt === opts.retries || !shouldRetry) {
        throw lastError;
      }

      opts.onRetry?.(attempt + 1, lastError);
      await sleep(opts.retryDelayMs * (attempt + 1));
    }
  }

  throw lastError!;
}

/**
 * 带超时 + 重试的完整网络请求包装器
 * 推荐所有 AI Provider 调用使用此函数
 */
export async function withNetworkGuard<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOpts: RetryOptions
): Promise<T> {
  return withRetry(() => withTimeout(fn(), timeoutMs), retryOpts);
}

/**
 * TimeoutError — 超时异常
 */
export class TimeoutError extends Error {
  readonly isTimeout = true;
  readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number = 0) {
    super(message);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/**
 * 判断错误是否可重试（网络错误、超时、5xx 等）
 */
export function isRetryableError(error: Error): boolean {
  if (error instanceof TimeoutError) return true;

  const msg = error.message.toLowerCase();
  if (
    msg.includes('econnreset') ||
    msg.includes('enotfound') ||
    msg.includes('eai_again') ||
    msg.includes('timeout') ||
    msg.includes('network') ||
    msg.includes('fetch')
  ) {
    return true;
  }

  if ('response' in error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status && (status >= 500 || status === 429)) return true;
  }

  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export default { withTimeout, withRetry, withNetworkGuard, TimeoutError, isRetryableError };