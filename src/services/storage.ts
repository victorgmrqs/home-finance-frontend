/**
 * Storage Service
 * Abstração de storage com fallback automático
 * Ordem: IndexedDB → localStorage → sessionStorage → memory
 */

import localforage from 'localforage';

// Tipos
export type StorageType = 'indexeddb' | 'localstorage' | 'sessionstorage' | 'memory';

export interface StorageAdapter {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

// Configurar localforage
localforage.config({
  name: 'home-finance',
  version: 1.0,
  storeName: 'keyvaluepairs',
  description: 'Home Finance Application Storage',
});

/**
 * Adapter para IndexedDB (usando localforage)
 */
class IndexedDBAdapter implements StorageAdapter {
  async getItem<T>(key: string): Promise<T | null> {
    return await localforage.getItem<T>(key);
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    await localforage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await localforage.removeItem(key);
  }

  async clear(): Promise<void> {
    await localforage.clear();
  }

  async keys(): Promise<string[]> {
    return await localforage.keys();
  }
}

/**
 * Adapter para localStorage
 */
class LocalStorageAdapter implements StorageAdapter {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      return JSON.parse(item);
    } catch (error) {
      console.error('Error getting item from localStorage:', error);

      // Tentar limpar dados corrompidos
      try {
        localStorage.removeItem(key);
      } catch (cleanupError) {
        console.warn('Failed to cleanup corrupted data:', cleanupError);
      }

      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  async keys(): Promise<string[]> {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting keys from localStorage:', error);
      return [];
    }
  }
}

/**
 * Adapter para sessionStorage
 */
class SessionStorageAdapter implements StorageAdapter {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;

      return JSON.parse(item);
    } catch (error) {
      console.error('Error getting item from sessionStorage:', error);

      // Tentar limpar dados corrompidos
      try {
        sessionStorage.removeItem(key);
      } catch (cleanupError) {
        console.warn('Failed to cleanup corrupted data:', cleanupError);
      }

      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting item in sessionStorage:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from sessionStorage:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }

  async keys(): Promise<string[]> {
    try {
      return Object.keys(sessionStorage);
    } catch (error) {
      console.error('Error getting keys from sessionStorage:', error);
      return [];
    }
  }
}

/**
 * Adapter para memory storage (fallback final)
 */
class MemoryStorageAdapter implements StorageAdapter {
  private storage: Map<string, unknown> = new Map();

  async getItem<T>(key: string): Promise<T | null> {
    return (this.storage.get(key) as T) || null;
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }
}

/**
 * Detecta se um tipo de storage está disponível
 */
async function isStorageAvailable(type: StorageType): Promise<boolean> {
  try {
    switch (type) {
      case 'indexeddb': {
        // Testa IndexedDB
        if (!window.indexedDB) return false;

        // Tenta criar um teste real
        const testKey = '__indexeddb_test__';
        await localforage.setItem(testKey, 'test');
        await localforage.removeItem(testKey);
        return true;
      }

      case 'localstorage': {
        // Testa localStorage
        if (typeof localStorage === 'undefined') return false;

        const testKey = '__localstorage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
      }

      case 'sessionstorage': {
        // Testa sessionStorage
        if (typeof sessionStorage === 'undefined') return false;

        const testKey = '__sessionstorage_test__';
        sessionStorage.setItem(testKey, 'test');
        sessionStorage.removeItem(testKey);
        return true;
      }

      case 'memory': {
        // Memory storage sempre disponível
        return true;
      }

      default:
        return false;
    }
  } catch (error) {
    console.warn(`Storage type ${type} is not available:`, error);
    return false;
  }
}

/**
 * Cria um adapter para o tipo especificado
 */
function createAdapterForType(type: StorageType): StorageAdapter {
  switch (type) {
    case 'indexeddb':
      return new IndexedDBAdapter();
    case 'localstorage':
      return new LocalStorageAdapter();
    case 'sessionstorage':
      return new SessionStorageAdapter();
    case 'memory':
      return new MemoryStorageAdapter();
  }
}

/**
 * Storage Service com fallback automático
 */
class StorageService implements StorageAdapter {
  private adapter: StorageAdapter | null = null;
  private currentType: StorageType = 'memory';
  private initialized = false;
  private initializationPromise: Promise<StorageType> | null = null;

  /**
   * Inicializa o storage com fallback automático
   * Protegido contra race conditions com promise caching
   */
  async initialize(): Promise<StorageType> {
    // Se já inicializado, retornar tipo atual
    if (this.initialized) {
      return this.currentType;
    }

    // Se já há uma inicialização em andamento, aguardar ela
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Criar nova promise de inicialização
    this.initializationPromise = (async () => {
      // Ordem de preferência
      const storageTypes: StorageType[] = ['indexeddb', 'localstorage', 'sessionstorage', 'memory'];

      for (const type of storageTypes) {
        const available = await isStorageAvailable(type);
        if (available) {
          this.currentType = type;
          this.adapter = createAdapterForType(type);
          this.initialized = true;
          console.info(`Storage initialized with ${type}`);
          return type;
        }
      }

      // Fallback para memory (sempre disponível)
      this.currentType = 'memory';
      this.adapter = createAdapterForType('memory');
      this.initialized = true;
      console.warn('All storage types failed, using memory storage');
      return 'memory';
    })();

    try {
      return await this.initializationPromise;
    } finally {
      // Limpar promise após conclusão
      this.initializationPromise = null;
    }
  }

  /**
   * Garante que o storage está inicializado
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Retorna o tipo de storage atual
   */
  getCurrentType(): StorageType {
    return this.currentType;
  }

  /**
   * Verifica se o storage está usando fallback (não é IndexedDB)
   */
  isUsingFallback(): boolean {
    return this.currentType !== 'indexeddb';
  }

  async getItem<T>(key: string): Promise<T | null> {
    await this.ensureInitialized();
    return this.adapter!.getItem<T>(key);
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    await this.ensureInitialized();
    await this.adapter!.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await this.ensureInitialized();
    await this.adapter!.removeItem(key);
  }

  async clear(): Promise<void> {
    await this.ensureInitialized();
    await this.adapter!.clear();
  }

  async keys(): Promise<string[]> {
    await this.ensureInitialized();
    return this.adapter!.keys();
  }
}

// Instância singleton
export const storage = new StorageService();

// Inicializar automaticamente
storage.initialize().catch(console.error);
