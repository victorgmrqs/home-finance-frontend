import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from '../storage';

describe('Storage Service', () => {
  beforeEach(async () => {
    // Limpar storage antes de cada teste
    await storage.clear();
    vi.clearAllMocks();
  });

  describe('Basic Operations', () => {
    it('should store and retrieve string values', async () => {
      await storage.setItem('test-key', 'test-value');
      const value = await storage.getItem<string>('test-key');

      expect(value).toBe('test-value');
    });

    it('should store and retrieve object values', async () => {
      const testObj = { name: 'Test', age: 30 };

      await storage.setItem('test-obj', testObj);
      const value = await storage.getItem<typeof testObj>('test-obj');

      expect(value).toEqual(testObj);
    });

    it('should store and retrieve array values', async () => {
      const testArray = [1, 2, 3, 4, 5];

      await storage.setItem('test-array', testArray);
      const value = await storage.getItem<number[]>('test-array');

      expect(value).toEqual(testArray);
    });

    it('should return null for non-existent keys', async () => {
      const value = await storage.getItem('non-existent');

      expect(value).toBeNull();
    });

    it('should remove items', async () => {
      await storage.setItem('to-remove', 'value');

      await storage.removeItem('to-remove');

      const value = await storage.getItem('to-remove');
      expect(value).toBeNull();
    });

    it('should clear all items', async () => {
      await storage.setItem('key1', 'value1');
      await storage.setItem('key2', 'value2');
      await storage.setItem('key3', 'value3');

      await storage.clear();

      const value1 = await storage.getItem('key1');
      const value2 = await storage.getItem('key2');
      const value3 = await storage.getItem('key3');

      expect(value1).toBeNull();
      expect(value2).toBeNull();
      expect(value3).toBeNull();
    });

    it('should list all keys', async () => {
      await storage.setItem('key1', 'value1');
      await storage.setItem('key2', 'value2');
      await storage.setItem('key3', 'value3');

      const keys = await storage.keys();

      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });
  });

  describe('Storage Type', () => {
    it('should initialize with a storage type', async () => {
      const type = storage.getCurrentType();

      expect(['indexeddb', 'localstorage', 'sessionstorage', 'memory']).toContain(type);
    });

    it('should indicate if using fallback', () => {
      const isUsingFallback = storage.isUsingFallback();

      expect(typeof isUsingFallback).toBe('boolean');
    });
  });

  describe('Complex Data Types', () => {
    it('should handle null values', async () => {
      await storage.setItem('null-key', null);
      const value = await storage.getItem('null-key');

      expect(value).toBeNull();
    });

    it('should handle boolean values', async () => {
      await storage.setItem('bool-true', true);
      await storage.setItem('bool-false', false);

      const valueTrue = await storage.getItem<boolean>('bool-true');
      const valueFalse = await storage.getItem<boolean>('bool-false');

      expect(valueTrue).toBe(true);
      expect(valueFalse).toBe(false);
    });

    it('should handle number values', async () => {
      await storage.setItem('number', 42);
      const value = await storage.getItem<number>('number');

      expect(value).toBe(42);
    });

    it('should handle nested objects', async () => {
      const nested = {
        level1: {
          level2: {
            level3: {
              value: 'deep',
            },
          },
        },
      };

      await storage.setItem('nested', nested);
      const value = await storage.getItem<typeof nested>('nested');

      expect(value).toEqual(nested);
    });
  });

  describe('Error Handling', () => {
    it('should handle concurrent operations', async () => {
      const promises = [];

      for (let i = 0; i < 10; i++) {
        promises.push(storage.setItem(`concurrent-${i}`, `value-${i}`));
      }

      await Promise.all(promises);

      for (let i = 0; i < 10; i++) {
        const value = await storage.getItem(`concurrent-${i}`);
        expect(value).toBe(`value-${i}`);
      }
    });

    it('should handle rapid updates to same key', async () => {
      await storage.setItem('rapid', 'value1');
      await storage.setItem('rapid', 'value2');
      await storage.setItem('rapid', 'value3');

      const value = await storage.getItem('rapid');
      expect(value).toBe('value3');
    });
  });
});
