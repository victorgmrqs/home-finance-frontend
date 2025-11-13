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
});
