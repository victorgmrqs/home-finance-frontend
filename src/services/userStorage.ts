/**
 * User Storage Service
 * Provides fallback storage mechanisms for user data with IndexedDB backup
 */

import type { Usuario } from '@/types/usuario';

const DB_NAME = 'home-finance-db';
const DB_VERSION = 1;
const STORE_NAME = 'user';
const USER_KEY = 'currentUser';

/**
 * Initialize IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

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
 * User Storage Service with fallback mechanisms
 */
export const userStorage = {
  /**
   * Save user to localStorage with IndexedDB backup
   */
  async saveUser(user: Usuario): Promise<void> {
    // Validate before saving
    if (!validateUser(user)) {
      throw new Error('Invalid user data');
    }

    const userData = JSON.stringify(user);

    // Try localStorage first
    try {
      localStorage.setItem(USER_KEY, userData);
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }

    // Backup to IndexedDB
    let db: IDBDatabase | undefined;
    try {
      db = await openDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      await new Promise<void>((resolve, reject) => {
        const request = store.put(userData, USER_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('Failed to save to IndexedDB:', error);
    } finally {
      if (db) {
        db.close();
      }
    }
  },

  /**
   * Load user with fallback chain: localStorage → IndexedDB → null
   */
  async loadUser(): Promise<Usuario | null> {
    // Try localStorage first
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (validateUser(parsed)) {
          return parsed;
        }
        console.warn('Invalid user data in localStorage, removing...');
        localStorage.removeItem(USER_KEY);
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      // Try to clean up corrupted data
      try {
        localStorage.removeItem(USER_KEY);
      } catch (cleanupError) {
        console.warn('Failed to clean up localStorage:', cleanupError);
      }
    }

    // Fallback to IndexedDB
    let db: IDBDatabase | undefined;
    try {
      db = await openDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      const userData = await new Promise<string | null>((resolve, reject) => {
        const request = store.get(USER_KEY);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });

      if (userData) {
        const parsed = JSON.parse(userData);
        if (validateUser(parsed)) {
          // Restore to localStorage
          try {
            localStorage.setItem(USER_KEY, userData);
          } catch (error) {
            console.warn('Failed to restore to localStorage:', error);
          }
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load from IndexedDB:', error);
    } finally {
      if (db) {
        db.close();
      }
    }

    return null;
  },

  /**
   * Remove user from all storage
   */
  async removeUser(): Promise<void> {
    // Remove from localStorage
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }

    // Remove from IndexedDB
    let db: IDBDatabase | undefined;
    try {
      db = await openDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(USER_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('Failed to remove from IndexedDB:', error);
    } finally {
      if (db) {
        db.close();
      }
    }
  },

  /**
   * Validate stored user data
   */
  validateUser,
};
