import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiCircuitBreaker } from '../circuitBreaker';

describe('CircuitBreaker', () => {
  beforeEach(() => {
    apiCircuitBreaker.reset();
  });

  describe('CLOSED state', () => {
    it('should execute function successfully when closed', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const result = await apiCircuitBreaker.execute(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(apiCircuitBreaker.getStats().state).toBe('CLOSED');
    });

    it('should remain closed after single failure', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('fail'));

      await expect(apiCircuitBreaker.execute(mockFn)).rejects.toThrow('fail');
      expect(apiCircuitBreaker.getStats().state).toBe('CLOSED');
      expect(apiCircuitBreaker.getStats().failures).toBe(1);
    });

    it('should open after reaching failure threshold', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('fail'));

      // Execute 3 times to reach threshold
      await expect(apiCircuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(apiCircuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(apiCircuitBreaker.execute(mockFn)).rejects.toThrow();

      expect(apiCircuitBreaker.getStats().state).toBe('OPEN');
      expect(apiCircuitBreaker.getStats().failures).toBe(3);
    });
  });

  describe('OPEN state', () => {
    beforeEach(async () => {
      // Trigger circuit to open
      const mockFn = vi.fn().mockRejectedValue(new Error('fail'));
      await expect(apiCircuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(apiCircuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(apiCircuitBreaker.execute(mockFn)).rejects.toThrow();
    });

    it('should reject calls immediately when open', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      await expect(apiCircuitBreaker.execute(mockFn)).rejects.toThrow('Circuit breaker is OPEN');
      expect(mockFn).not.toHaveBeenCalled();
    });

    it('should have nextAttemptTime set', () => {
      const stats = apiCircuitBreaker.getStats();
      expect(stats.nextAttemptTime).not.toBeNull();
      expect(stats.nextAttemptTime! > Date.now()).toBe(true);
    });
  });

  describe('HALF_OPEN state', () => {
    it('should transition to CLOSED after successful calls', async () => {
      // Open the circuit
      const failFn = vi.fn().mockRejectedValue(new Error('fail'));
      await expect(apiCircuitBreaker.execute(failFn)).rejects.toThrow();
      await expect(apiCircuitBreaker.execute(failFn)).rejects.toThrow();
      await expect(apiCircuitBreaker.execute(failFn)).rejects.toThrow();

      expect(apiCircuitBreaker.getStats().state).toBe('OPEN');

      // Force transition to HALF_OPEN by manipulating time
      const stats = apiCircuitBreaker.getStats();
      if (stats.nextAttemptTime) {
        vi.useFakeTimers();
        vi.setSystemTime(stats.nextAttemptTime + 1000);
      }

      // Should now be HALF_OPEN and execute successfully
      const successFn = vi.fn().mockResolvedValue('success');
      await apiCircuitBreaker.execute(successFn);
      await apiCircuitBreaker.execute(successFn);

      expect(apiCircuitBreaker.getStats().state).toBe('CLOSED');
      expect(successFn).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });

    it('should return to OPEN on failure in HALF_OPEN', async () => {
      // Open the circuit
      const failFn = vi.fn().mockRejectedValue(new Error('fail'));
      await expect(apiCircuitBreaker.execute(failFn)).rejects.toThrow();
      await expect(apiCircuitBreaker.execute(failFn)).rejects.toThrow();
      await expect(apiCircuitBreaker.execute(failFn)).rejects.toThrow();

      // Force transition to HALF_OPEN
      const stats = apiCircuitBreaker.getStats();
      if (stats.nextAttemptTime) {
        vi.useFakeTimers();
        vi.setSystemTime(stats.nextAttemptTime + 1000);
      }

      // Fail in HALF_OPEN state
      await expect(apiCircuitBreaker.execute(failFn)).rejects.toThrow();

      expect(apiCircuitBreaker.getStats().state).toBe('OPEN');

      vi.useRealTimers();
    });
  });

  describe('reset', () => {
    it('should reset circuit to CLOSED state', async () => {
      // Open the circuit
      const mockFn = vi.fn().mockRejectedValue(new Error('fail'));
      await expect(apiCircuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(apiCircuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(apiCircuitBreaker.execute(mockFn)).rejects.toThrow();

      expect(apiCircuitBreaker.getStats().state).toBe('OPEN');

      // Reset
      apiCircuitBreaker.reset();

      const stats = apiCircuitBreaker.getStats();
      expect(stats.state).toBe('CLOSED');
      expect(stats.failures).toBe(0);
      expect(stats.successes).toBe(0);
      expect(stats.lastFailureTime).toBeNull();
      expect(stats.nextAttemptTime).toBeNull();
    });
  });

  describe('subscribe', () => {
    it('should notify listeners on state change', async () => {
      const listener = vi.fn();
      const unsubscribe = apiCircuitBreaker.subscribe(listener);

      // Trigger state change
      const mockFn = vi.fn().mockRejectedValue(new Error('fail'));
      await expect(apiCircuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(apiCircuitBreaker.execute(mockFn)).rejects.toThrow();
      await expect(apiCircuitBreaker.execute(mockFn)).rejects.toThrow();

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ state: 'OPEN' })
      );

      unsubscribe();
    });

    it('should not notify unsubscribed listeners', async () => {
      const listener = vi.fn();
      const unsubscribe = apiCircuitBreaker.subscribe(listener);

      unsubscribe();

      // Trigger state change
      const mockFn = vi.fn().mockRejectedValue(new Error('fail'));
      await expect(apiCircuitBreaker.execute(mockFn)).rejects.toThrow();

      expect(listener).not.toHaveBeenCalled();
    });
  });
});
