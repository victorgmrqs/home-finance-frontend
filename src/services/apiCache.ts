/**
 * API Cache Service
 * Provides fallback data when API is unavailable
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ApiCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_STALE_TIME = 24 * 60 * 60 * 1000; // 24 hours - remove entries older than this
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL = 10 * 60 * 1000; // Run cleanup every 10 minutes

  constructor() {
    // Start automatic cleanup routine
    this.startCleanupRoutine();
  }

  /**
   * Set cache entry with optional TTL
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get cache entry if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      // Don't delete - keep for fallback purposes
      return null;
    }

    return entry.data as T;
  }

  /**
   * Get cache entry even if expired (for fallback purposes)
   */
  getStale<T>(key: string): T | null {
    const entry = this.cache.get(key);
    return entry ? (entry.data as T) : null;
  }

  /**
   * Check if cache has valid (non-expired) entry
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Check if cache has any entry (even expired)
   */
  hasStale(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove stale entries that are too old (older than MAX_STALE_TIME)
   * This prevents memory growth from keeping expired entries indefinitely
   */
  cleanupStaleEntries(): number {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > this.MAX_STALE_TIME) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    return removedCount;
  }

  /**
   * Start automatic cleanup routine
   */
  private startCleanupRoutine(): void {
    // Only start in browser environment
    if (typeof window !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanupStaleEntries();
      }, this.CLEANUP_INTERVAL);
    }
  }

  /**
   * Stop automatic cleanup routine (useful for testing or cleanup)
   */
  stopCleanupRoutine(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    keys: string[];
    entries: Array<{ key: string; age: number; isExpired: boolean }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      isExpired: now - entry.timestamp > entry.ttl,
    }));

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      entries,
    };
  }

  /**
   * Generate cache key from endpoint and params
   * Includes both query params and request body for proper cache isolation
   */
  generateKey(endpoint: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return endpoint;
    }
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    return `${endpoint}?${sortedParams}`;
  }
}

// Singleton instance
export const apiCache = new ApiCache();
