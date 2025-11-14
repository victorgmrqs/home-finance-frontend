import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateRetryDelay,
  shouldRetryError,
  withRetry,
  isOnline,
  waitForOnline,
} from '../retryHelper';

describe('retryHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateRetryDelay', () => {
    it('should calculate exponential backoff delay', () => {
      const delay0 = calculateRetryDelay(0, 1000, 30000);
      const delay1 = calculateRetryDelay(1, 1000, 30000);
      const delay2 = calculateRetryDelay(2, 1000, 30000);

      // Deve haver progressão exponencial (com jitter)
      expect(delay0).toBeGreaterThanOrEqual(1000);
      expect(delay0).toBeLessThan(1000 * 1.3); // Considerando jitter de 30%

      expect(delay1).toBeGreaterThanOrEqual(2000);
      expect(delay1).toBeLessThan(2000 * 1.3);

      expect(delay2).toBeGreaterThanOrEqual(4000);
      expect(delay2).toBeLessThan(4000 * 1.3);
    });

    it('should respect max delay', () => {
      const delay = calculateRetryDelay(10, 1000, 5000);

      expect(delay).toBeLessThanOrEqual(5000 * 1.3); // max + jitter
    });
  });

  describe('shouldRetryError', () => {
    it('should retry on network errors', () => {
      const networkError = new TypeError('Failed to fetch');
      expect(shouldRetryError(networkError)).toBe(true);
    });

    it('should retry on timeout errors', () => {
      const timeoutError = new Error('Request timeout');
      expect(shouldRetryError(timeoutError)).toBe(true);
    });

    it('should retry on 5xx errors', () => {
      const serverError = { status: 500 };
      expect(shouldRetryError(serverError)).toBe(true);

      const badGateway = { status: 502 };
      expect(shouldRetryError(badGateway)).toBe(true);
    });

    it('should retry on 408 (Request Timeout)', () => {
      const timeoutError = { status: 408 };
      expect(shouldRetryError(timeoutError)).toBe(true);
    });

    it('should retry on 429 (Too Many Requests)', () => {
      const rateLimitError = { status: 429 };
      expect(shouldRetryError(rateLimitError)).toBe(true);
    });

    it('should not retry on 4xx client errors', () => {
      const badRequest = { status: 400 };
      expect(shouldRetryError(badRequest)).toBe(false);

      const unauthorized = { status: 401 };
      expect(shouldRetryError(unauthorized)).toBe(false);

      const notFound = { status: 404 };
      expect(shouldRetryError(notFound)).toBe(false);
    });

    it('should not retry on unknown errors', () => {
      const unknownError = new Error('Unknown error');
      expect(shouldRetryError(unknownError)).toBe(false);
    });
  });

  describe('withRetry', () => {
    it('should return immediately on success', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on transient errors', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, { maxRetries: 3, baseDelay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const error = new TypeError('Failed to fetch');
      const fn = vi.fn().mockRejectedValue(error);

      await expect(withRetry(fn, { maxRetries: 2, baseDelay: 10 })).rejects.toThrow(error);

      expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should not retry on non-retryable errors', async () => {
      const error = { status: 400 };
      const fn = vi.fn().mockRejectedValue(error);

      await expect(withRetry(fn, { maxRetries: 3, baseDelay: 10 })).rejects.toEqual(error);

      expect(fn).toHaveBeenCalledTimes(1); // No retries
    });

    it('should use custom shouldRetry function', async () => {
      const error = new Error('Custom error');
      const fn = vi.fn().mockRejectedValue(error);
      const shouldRetry = vi.fn().mockReturnValue(false);

      await expect(withRetry(fn, { shouldRetry, baseDelay: 10 })).rejects.toThrow(error);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(shouldRetry).toHaveBeenCalledWith(error, 0);
    });
  });

  describe('isOnline', () => {
    it('should return navigator.onLine status', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      expect(isOnline()).toBe(true);

      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      expect(isOnline()).toBe(false);
    });
  });

  describe('waitForOnline', () => {
    it('should resolve immediately if already online', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const result = await waitForOnline(100);

      expect(result).toBe(true);
    });

    it('should resolve when online event fires', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const promise = waitForOnline(1000);

      // Simular evento de online
      setTimeout(() => {
        window.dispatchEvent(new Event('online'));
      }, 50);

      const result = await promise;

      expect(result).toBe(true);
    });

    it('should timeout if not online within timeout', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const result = await waitForOnline(100);

      expect(result).toBe(false);
    });
  });
});
