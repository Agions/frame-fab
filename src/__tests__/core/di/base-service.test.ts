import { BaseService, RetryConfig, DEFAULT_RETRY_CONFIG } from '@/core/di/base-service';

describe('BaseService', () => {
  // Concrete implementation for testing
  class TestService extends BaseService {
    public getName(): string {
      return this.name;
    }

    public callWithRetry<T>(fn: () => Promise<T>, config?: Partial<RetryConfig>): Promise<T> {
      return this.withRetry(fn, config);
    }

    public callSleep(ms: number): Promise<void> {
      return this.sleep(ms);
    }

    public callSafeAsync<T>(fn: () => Promise<T>, defaultValue: T): Promise<T> {
      return this.safeAsync(fn, defaultValue);
    }

    public callWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
      return this.withTimeout(promise, timeoutMs);
    }
  }

  let service: TestService;

  beforeEach(() => {
    service = new TestService('TestService');
  });

  describe('constructor', () => {
    it('should set the service name', () => {
      expect(service.getName()).toBe('TestService');
    });
  });

  describe('DEFAULT_RETRY_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_RETRY_CONFIG.maxAttempts).toBe(3);
      expect(DEFAULT_RETRY_CONFIG.delayMs).toBe(1000);
      expect(DEFAULT_RETRY_CONFIG.backoffMultiplier).toBe(2);
    });
  });

  describe('withRetry', () => {
    it('should return result on successful first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const result = await service.callWithRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed on second attempt', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('first failure'))
        .mockResolvedValueOnce('success');

      const result = await service.callWithRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should retry on failure and succeed on third attempt', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('first failure'))
        .mockRejectedValueOnce(new Error('second failure'))
        .mockResolvedValueOnce('success');

      const result = await service.callWithRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after exhausting all retries', async () => {
      const error = new Error('always fails');
      const fn = jest.fn().mockRejectedValue(error);

      await expect(service.callWithRetry(fn)).rejects.toThrow('always fails');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should use custom retry config', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('failure'))
        .mockResolvedValueOnce('success');

      const result = await service.callWithRetry(fn, { maxAttempts: 2 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should apply backoff multiplier for delay between retries', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('failure'))
        .mockResolvedValueOnce('success');

      const start = Date.now();
      await service.callWithRetry(fn, { delayMs: 100, backoffMultiplier: 2 });
      const elapsed = Date.now() - start;

      // First retry delay should be: 100 * 2^0 = 100ms
      expect(elapsed).toBeGreaterThanOrEqual(90);
    });
  });

  describe('sleep', () => {
    it('should delay execution for specified milliseconds', async () => {
      const start = Date.now();
      await service.callSleep(100);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(90);
    });
  });

  describe('safeAsync', () => {
    it('should return result on successful execution', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const result = await service.callSafeAsync(fn, 'default');

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should return default value on failure', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('failure'));

      const result = await service.callSafeAsync(fn, 'default');

      expect(result).toBe('default');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should not throw on failure', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('failure'));

      await expect(service.callSafeAsync(fn, 'default')).resolves.toBe('default');
    });
  });

  describe('withTimeout', () => {
    it('should return result if promise resolves before timeout', async () => {
      const promise = new Promise<string>((resolve) => setTimeout(() => resolve('success'), 50));

      const result = await service.callWithTimeout(promise, 1000);

      expect(result).toBe('success');
    });

    it('should throw timeout error if promise does not resolve in time', async () => {
      const promise = new Promise<string>((resolve) => setTimeout(() => resolve('success'), 500));

      await expect(service.callWithTimeout(promise, 100)).rejects.toThrow('Operation timed out after 100ms');
    });

    it('should reject with timeout message containing the correct timeout value', async () => {
      const promise = new Promise<string>((resolve) => setTimeout(() => resolve('success'), 500));

      try {
        await service.callWithTimeout(promise, 200);
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toBe('Operation timed out after 200ms');
      }
    });
  });
});
