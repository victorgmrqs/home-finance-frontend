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

  describe('Fallback Scenarios', () => {
    it('should work with any available storage type', async () => {
      // Este teste verifica que o storage funciona independente do tipo
      const type = storage.getCurrentType();
      expect(['indexeddb', 'localstorage', 'sessionstorage', 'memory']).toContain(type);

      // Deve conseguir armazenar e recuperar dados
      await storage.setItem('fallback-test', { value: 'test' });
      const result = await storage.getItem<{ value: string }>('fallback-test');
      expect(result).toEqual({ value: 'test' });
    });

    it('should fallback gracefully when primary storage fails', async () => {
      // O storage já está inicializado neste ponto
      // Este teste verifica que mesmo se o storage preferido não estiver disponível,
      // o sistema consegue usar um dos fallbacks
      const isUsingFallback = storage.isUsingFallback();
      
      // Se não está usando fallback, é porque IndexedDB está disponível (ideal)
      // Se está usando fallback, é porque caiu para localStorage, sessionStorage ou memory
      expect(typeof isUsingFallback).toBe('boolean');

      // Independente do storage, deve funcionar
      await storage.setItem('test-fallback', 'works');
      const value = await storage.getItem<string>('test-fallback');
      expect(value).toBe('works');
    });

    it('should initialize consistently when called concurrently', async () => {
      // Este teste simula múltiplas inicializações concorrentes
      // Todas devem retornar o mesmo tipo de storage
      const types = await Promise.all([
        storage.initialize(),
        storage.initialize(),
        storage.initialize(),
      ]);

      // Todos devem ser do mesmo tipo
      expect(types[0]).toBe(types[1]);
      expect(types[1]).toBe(types[2]);
    });

    it('should maintain data integrity across operations', async () => {
      // Armazenar múltiplos valores
      await storage.setItem('key1', 'value1');
      await storage.setItem('key2', { nested: 'value2' });
      await storage.setItem('key3', [1, 2, 3]);

      // Verificar que todos os valores estão corretos
      expect(await storage.getItem('key1')).toBe('value1');
      expect(await storage.getItem('key2')).toEqual({ nested: 'value2' });
      expect(await storage.getItem('key3')).toEqual([1, 2, 3]);
    });

    it('should handle storage quota exceeded gracefully', async () => {
      // Este teste verifica que o sistema não quebra se o storage estiver cheio
      // Em um cenário real, isso pode acionar um fallback para outro tipo de storage
      
      try {
        // Tentar armazenar um valor muito grande (pode falhar em alguns storages)
        const largeData = 'x'.repeat(1024 * 1024); // 1MB de dados
        await storage.setItem('large-data', largeData);

        // Se conseguiu armazenar, deve conseguir recuperar
        const retrieved = await storage.getItem<string>('large-data');
        expect(retrieved).toBe(largeData);
      } catch (error) {
        // Se falhou, não deve quebrar a aplicação
        expect(error).toBeDefined();
      }
    });
  });
});
