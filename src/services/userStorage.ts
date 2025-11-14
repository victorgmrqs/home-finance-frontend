/**
 * User Storage Service
 * Provides fallback storage mechanisms for user data with IndexedDB backup
 * Using unified storage abstraction
 */

import type { Usuario } from '@/types/usuario';
import { storage } from './storage';

const USER_KEY = 'currentUser';

/**
 * Validate user data integrity
 */
function validateUser(data: unknown): data is Usuario {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check required fields
  if (typeof data.id !== 'number' || !data.id) {
    return false;
  }

  if (typeof data.nome !== 'string' || !data.nome.trim()) {
    return false;
  }

  // Email is optional but if present must be valid
  if (data.email !== undefined && data.email !== null && typeof data.email !== 'string') {
    return false;
  }

  return true;
}

/**
 * User Storage Service with unified storage abstraction
 */
export const userStorage = {
  /**
   * Save user using unified storage abstraction
   */
  async saveUser(user: Usuario): Promise<void> {
    // Validate before saving
    if (!validateUser(user)) {
      throw new Error('Invalid user data');
    }

    try {
      await storage.setItem(USER_KEY, user);
    } catch (error) {
      console.error('Failed to save user:', error);
      throw error;
    }
  },

  /**
   * Load user with automatic fallback
   */
  async loadUser(): Promise<Usuario | null> {
    try {
      const user = await storage.getItem<Usuario>(USER_KEY);

      if (user && validateUser(user)) {
        return user;
      }

      if (user) {
        console.warn('Invalid user data in storage, removing...');
        await storage.removeItem(USER_KEY);
      }

      return null;
    } catch (error) {
      console.error('Failed to load user:', error);
      return null;
    }
  },

  /**
   * Remove user from storage
   */
  async removeUser(): Promise<void> {
    try {
      await storage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Failed to remove user:', error);
    }
  },

  /**
   * Get storage type being used
   */
  getStorageType() {
    return storage.getCurrentType();
  },

  /**
   * Check if using fallback storage
   */
  isUsingFallback() {
    return storage.isUsingFallback();
  },

  /**
   * Validate stored user data
   */
  validateUser,
};
