import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiCache } from '../apiCache';

describe('ApiCache', () => {
  beforeEach(() => {
    apiCache.clear();
  });

  describe('set and get', () => {
    it('should store and retrieve data', () => {
      const data = { id: 1, name: 'Test' };
      apiCache.set('test-key', data);

      const result = apiCache.get('test-key');
      expect(result).toEqual(data);
    });

    it('should return null for non-existent key', () => {
      const result = apiCache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should return null for expired data', () => {
      vi.useFakeTimers();
      const data = { id: 1, name: 'Test' };
      apiCache.set('test-key', data, 1000); // 1 second TTL

      // Advance time beyond TTL
      vi.advanceTimersByTime(1100);

      const result = apiCache.get('test-key');
      expect(result).toBeNull();

      vi.useRealTimers();
    });

    it('should use default TTL when not specified', () => {
      vi.useFakeTimers();
      const data = { id: 1, name: 'Test' };
      apiCache.set('test-key', data); // Use default TTL (5 minutes)

      // Should still be valid after 4 minutes
      vi.advanceTimersByTime(4 * 60 * 1000);
      expect(apiCache.get('test-key')).toEqual(data);

      // Should expire after 6 minutes
      vi.advanceTimersByTime(2 * 60 * 1000);
      expect(apiCache.get('test-key')).toBeNull();

      vi.useRealTimers();
    });
  });

  describe('getStale', () => {
    it('should return expired data', () => {
      vi.useFakeTimers();
      const data = { id: 1, name: 'Test' };
      apiCache.set('test-key', data, 1000);

      vi.advanceTimersByTime(1100);

      // get() should return null
      expect(apiCache.get('test-key')).toBeNull();

      // getStale() should return data
      expect(apiCache.getStale('test-key')).toEqual(data);

      vi.useRealTimers();
    });

    it('should return null if key never existed', () => {
      const result = apiCache.getStale('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('has and hasStale', () => {
    it('has() should return false for expired data', () => {
      vi.useFakeTimers();
      apiCache.set('test-key', { data: 'test' }, 1000);

      expect(apiCache.has('test-key')).toBe(true);

      vi.advanceTimersByTime(1100);

      expect(apiCache.has('test-key')).toBe(false);

      vi.useRealTimers();
    });

    it('hasStale() should return true for expired data', () => {
      vi.useFakeTimers();
      apiCache.set('test-key', { data: 'test' }, 1000);

      vi.advanceTimersByTime(1100);

      expect(apiCache.has('test-key')).toBe(false);
      expect(apiCache.hasStale('test-key')).toBe(true);

      vi.useRealTimers();
    });
  });

  describe('delete', () => {
    it('should remove cache entry', () => {
      apiCache.set('test-key', { data: 'test' });
      expect(apiCache.has('test-key')).toBe(true);

      apiCache.delete('test-key');

      expect(apiCache.has('test-key')).toBe(false);
      expect(apiCache.hasStale('test-key')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all cache entries', () => {
      apiCache.set('key1', { data: 'test1' });
      apiCache.set('key2', { data: 'test2' });
      apiCache.set('key3', { data: 'test3' });

      expect(apiCache.getStats().size).toBe(3);

      apiCache.clear();

      expect(apiCache.getStats().size).toBe(0);
      expect(apiCache.has('key1')).toBe(false);
      expect(apiCache.has('key2')).toBe(false);
      expect(apiCache.has('key3')).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      apiCache.set('key1', { data: 'test1' });
      apiCache.set('key2', { data: 'test2' });

      const stats = apiCache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.keys).toEqual(['key1', 'key2']);
      expect(stats.entries).toHaveLength(2);
      expect(stats.entries[0]).toHaveProperty('key');
      expect(stats.entries[0]).toHaveProperty('age');
      expect(stats.entries[0]).toHaveProperty('isExpired');
    });

    it('should mark expired entries correctly', () => {
      vi.useFakeTimers();

      apiCache.set('key1', { data: 'test1' }, 1000);
      apiCache.set('key2', { data: 'test2' }, 5000);

      vi.advanceTimersByTime(2000);

      const stats = apiCache.getStats();

      const entry1 = stats.entries.find(e => e.key === 'key1');
      const entry2 = stats.entries.find(e => e.key === 'key2');

      expect(entry1?.isExpired).toBe(true);
      expect(entry2?.isExpired).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('generateKey', () => {
    it('should generate consistent keys for same params', () => {
      const key1 = apiCache.generateKey('/api/test', { a: 1, b: 2 });
      const key2 = apiCache.generateKey('/api/test', { b: 2, a: 1 });

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different params', () => {
      const key1 = apiCache.generateKey('/api/test', { a: 1 });
      const key2 = apiCache.generateKey('/api/test', { a: 2 });

      expect(key1).not.toBe(key2);
    });

    it('should handle endpoints without params', () => {
      const key = apiCache.generateKey('/api/test');
      expect(key).toBe('/api/test');
    });
  });
});
