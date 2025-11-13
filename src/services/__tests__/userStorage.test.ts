import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { userStorage } from '../userStorage';
import type { Usuario } from '@/types/usuario';

const mockUser: Usuario = {
  id: 1,
  nome: 'Test User',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(),
  databases: new Map(),
};

describe('userStorage', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('validateUser', () => {
    it('should validate valid user data', () => {
      expect(userStorage.validateUser(mockUser)).toBe(true);
    });

    it('should reject user without id', () => {
      const invalidUser = { ...mockUser, id: undefined };
      expect(userStorage.validateUser(invalidUser)).toBe(false);
    });

    it('should reject user with invalid id', () => {
      const invalidUser = { ...mockUser, id: 0 };
      expect(userStorage.validateUser(invalidUser)).toBe(false);
    });

    it('should reject user without nome', () => {
      const invalidUser = { ...mockUser, nome: '' };
      expect(userStorage.validateUser(invalidUser)).toBe(false);
    });

    it('should reject user with whitespace-only nome', () => {
      const invalidUser = { ...mockUser, nome: '   ' };
      expect(userStorage.validateUser(invalidUser)).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(userStorage.validateUser(null)).toBe(false);
      expect(userStorage.validateUser(undefined)).toBe(false);
    });

    it('should reject non-object values', () => {
      expect(userStorage.validateUser('string')).toBe(false);
      expect(userStorage.validateUser(123)).toBe(false);
      expect(userStorage.validateUser(true)).toBe(false);
    });

    it('should accept user with null email', () => {
      const userWithNullEmail = { ...mockUser, email: null };
      expect(userStorage.validateUser(userWithNullEmail)).toBe(true);
    });

    it('should reject user with invalid email type', () => {
      const userWithInvalidEmail = { ...mockUser, email: 123 };
      expect(userStorage.validateUser(userWithInvalidEmail)).toBe(false);
    });
  });

  describe('saveUser and loadUser (localStorage)', () => {
    it('should save and load user from localStorage', async () => {
      await userStorage.saveUser(mockUser);

      const loaded = await userStorage.loadUser();
      expect(loaded).toEqual(mockUser);
    });

    it('should return null when no user is stored', async () => {
      const loaded = await userStorage.loadUser();
      expect(loaded).toBeNull();
    });

    it('should handle corrupted localStorage data', async () => {
      // Store invalid JSON
      localStorage.setItem('currentUser', 'invalid json{');

      const loaded = await userStorage.loadUser();
      expect(loaded).toBeNull();

      // Should have cleaned up invalid data
      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    it('should handle invalid user data in localStorage', async () => {
      // Store invalid user data
      localStorage.setItem('currentUser', JSON.stringify({ id: 0, nome: '' }));

      const loaded = await userStorage.loadUser();
      expect(loaded).toBeNull();

      // Should have cleaned up invalid data
      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    it('should throw error when saving invalid user', async () => {
      const invalidUser = { id: 0, nome: '' };

      await expect(userStorage.saveUser(invalidUser as Usuario)).rejects.toThrow(
        'Invalid user data'
      );
    });
  });

  describe('removeUser', () => {
    it('should remove user from localStorage', async () => {
      await userStorage.saveUser(mockUser);
      expect(localStorage.getItem('currentUser')).not.toBeNull();

      await userStorage.removeUser();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    it('should not throw when removing non-existent user', async () => {
      await expect(userStorage.removeUser()).resolves.not.toThrow();
    });
  });

  describe('localStorage errors', () => {
    it('should handle localStorage.setItem errors gracefully', async () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw, just log warning
      await expect(userStorage.saveUser(mockUser)).resolves.not.toThrow();

      // Restore
      localStorage.setItem = originalSetItem;
    });

    it('should handle localStorage.getItem errors gracefully', async () => {
      // Mock localStorage to throw error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error('SecurityError');
      });

      // Should return null instead of throwing
      const loaded = await userStorage.loadUser();
      expect(loaded).toBeNull();

      // Restore
      localStorage.getItem = originalGetItem;
    });
  });

  describe('IndexedDB fallback and recovery', () => {
    // Note: These tests verify behavior when IndexedDB is not available (Node.js environment)
    // In a browser environment with IndexedDB, the fallback mechanism would work as designed

    it('should handle IndexedDB absence gracefully during save', async () => {
      // In Node.js (test environment), IndexedDB is not available
      // The service should still save to localStorage without throwing
      await expect(userStorage.saveUser(mockUser)).resolves.not.toThrow();

      // Verify localStorage save succeeded
      const stored = localStorage.getItem('currentUser');
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual(mockUser);
    });

    it('should handle IndexedDB absence gracefully during load', async () => {
      // Save to localStorage
      await userStorage.saveUser(mockUser);

      // Should load from localStorage when IndexedDB is not available
      const loaded = await userStorage.loadUser();
      expect(loaded).toEqual(mockUser);
    });

    it('should handle corrupted localStorage gracefully', async () => {
      // Simulate localStorage corruption
      localStorage.setItem('currentUser', 'corrupted data');

      // Should clean up and return null (IndexedDB not available in test env)
      const loaded = await userStorage.loadUser();
      expect(loaded).toBeNull();

      // Should have cleaned up invalid data
      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    it('should save to localStorage when IndexedDB is unavailable', async () => {
      // This is the default behavior in Node.js test environment
      await userStorage.saveUser(mockUser);

      const stored = localStorage.getItem('currentUser');
      expect(stored).not.toBeNull();
      
      const loaded = await userStorage.loadUser();
      expect(loaded).toEqual(mockUser);
    });
  });

  describe('IndexedDB error handling in Node.js environment', () => {
    // These tests verify that the service handles the absence of IndexedDB gracefully
    // which is the case in Node.js test environments

    it('should not throw when IndexedDB is unavailable during save', async () => {
      // IndexedDB is not defined in Node.js, but service should handle it
      await expect(userStorage.saveUser(mockUser)).resolves.not.toThrow();
    });

    it('should not throw when IndexedDB is unavailable during load', async () => {
      // Should return null without throwing when only IndexedDB would have data
      // but it's not available
      const loaded = await userStorage.loadUser();
      expect(loaded).toBeNull();
    });

    it('should not throw when IndexedDB is unavailable during remove', async () => {
      // Should complete without throwing
      await expect(userStorage.removeUser()).resolves.not.toThrow();
    });

    it('should handle the full lifecycle without IndexedDB', async () => {
      // Save
      await userStorage.saveUser(mockUser);
      expect(localStorage.getItem('currentUser')).not.toBeNull();

      // Load
      let loaded = await userStorage.loadUser();
      expect(loaded).toEqual(mockUser);

      // Remove
      await userStorage.removeUser();
      expect(localStorage.getItem('currentUser')).toBeNull();

      // Load after remove
      loaded = await userStorage.loadUser();
      expect(loaded).toBeNull();
    });
  });
});
