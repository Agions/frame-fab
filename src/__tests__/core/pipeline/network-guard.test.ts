/**
 * Unit Tests — NetworkTimeoutGuard (网络超时保护)
 */

import { withTimeout, withRetry, withNetworkGuard, TimeoutError, isRetryableError } from '@/infrastructure/ai/providers/network-guard';

describe('withTimeout', () => {
  it('should resolve if promise settles before timeout', async () => {
    const result = await withTimeout(Promise.resolve('success'), 1000);
    expect(result).toBe('success');
  });

  it('should reject with TimeoutError if promise exceeds timeout', async () => {
    const slow = new Promise<string>((resolve) => setTimeout(() => resolve('late'), 5000));

    await expect(withTimeout(slow, 100)).rejects.toThrow(TimeoutError);
    await expect(withTimeout(slow, 100)).rejects.toThrow(/timed out/i);
  });

  it('should include timeoutMs in error', async () => {
    const slow = new Promise<string>((resolve) => setTimeout(() => resolve('late'), 5000));

    try {
      await withTimeout(slow, 200);
    } catch (err) {
      expect(err).toBeInstanceOf(TimeoutError);
      expect((err as TimeoutError).timeoutMs).toBe(200);
    }
  });
});

describe('withRetry', () => {
  it('should return result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { retries: 3, retryDelayMs: 10 });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('transient'))
      .mockRejectedValueOnce(new Error('transient'))
      .mockResolvedValue('ok');

    const result = await withRetry(fn, { retries: 3, retryDelayMs: 10 });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should stop retrying after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('persistent'));

    await expect(
      withRetry(fn, { retries: 2, retryDelayMs: 10 })
    ).rejects.toThrow('persistent');

    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('should call onRetry callback', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    const onRetry = vi.fn();

    await expect(
      withRetry(fn, { retries: 1, retryDelayMs: 10, onRetry })
    ).rejects.toThrow();

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should use shouldRetry to filter errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('non-retryable'));

    await expect(
      withRetry(fn, {
        retries: 3,
        retryDelayMs: 10,
        shouldRetry: () => false,
      })
    ).rejects.toThrow('non-retryable');

    expect(fn).toHaveBeenCalledTimes(1); // no retries
  });
});

describe('withNetworkGuard (timeout + retry combined)', () => {
  it('should succeed if call completes within timeout', async () => {
    const call = vi.fn().mockResolvedValue('generated-image-url');

    const result = await withNetworkGuard(call, 5000, { retries: 2, retryDelayMs: 10 });

    expect(result).toBe('generated-image-url');
    expect(call).toHaveBeenCalledTimes(1);
  });

  it('should retry on timeout error', async () => {
    const call = vi.fn()
      .mockImplementation(() => new Promise((_, reject) => {
        setTimeout(() => reject(new TimeoutError('timeout', 100)), 100);
      }))
      .mockResolvedValue('result');

    const result = await withNetworkGuard(call, 200, { retries: 2, retryDelayMs: 10 });

    expect(result).toBe('result');
    expect(call).toHaveBeenCalledTimes(2);
  });

  it('should eventually fail after all retries exhausted', async () => {
    const call = vi.fn().mockImplementation(() =>
      new Promise((_, reject) => {
        setTimeout(() => reject(new TimeoutError('timeout', 100)), 100);
      })
    );

    await expect(
      withNetworkGuard(call, 200, { retries: 2, retryDelayMs: 10 })
    ).rejects.toThrow(TimeoutError);
  });
});

describe('isRetryableError', () => {
  it('should return true for TimeoutError', () => {
    expect(isRetryableError(new TimeoutError('timeout', 5000))).toBe(true);
  });

  it('should return true for network errors', () => {
    expect(isRetryableError(new Error('ECONNRESET'))).toBe(true);
    expect(isRetryableError(new Error('network error'))).toBe(true);
    expect(isRetryableError(new Error('fetch failed'))).toBe(true);
  });

  it('should return true for HTTP 5xx', () => {
    const err500 = { response: { status: 500 } } as Error;
    const err429 = { response: { status: 429 } } as Error;
    expect(isRetryableError(err500)).toBe(true);
    expect(isRetryableError(err429)).toBe(true);
  });

  it('should return false for HTTP 4xx', () => {
    const err400 = { response: { status: 400 } } as Error;
    expect(isRetryableError(err400)).toBe(false);
  });
});