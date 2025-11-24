/**
 * Cache Optimization Utilities
 * Advanced caching strategies for better performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

/**
 * LRU Cache with size limit
 */
export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;
  private maxBytes: number;
  private currentBytes: number = 0;

  constructor(maxSize: number = 100, maxBytes: number = 50 * 1024 * 1024) {
    this.maxSize = maxSize;
    this.maxBytes = maxBytes;
  }

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Update access info
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, size?: number): void {
    const entrySize = size || this.estimateSize(value);
    
    // Check if we need to evict
    this.evictIfNeeded(entrySize);

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
      size: entrySize,
    };

    this.cache.set(key, entry);
    this.currentBytes += entrySize;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete key from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentBytes -= entry.size;
      return this.cache.delete(key);
    }
    return false;
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.currentBytes = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    bytes: number;
    maxSize: number;
    maxBytes: number;
    hitRate: number;
  } {
    const totalAccesses = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.accessCount,
      0
    );

    return {
      size: this.cache.size,
      bytes: this.currentBytes,
      maxSize: this.maxSize,
      maxBytes: this.maxBytes,
      hitRate: totalAccesses > 0 ? totalAccesses / this.cache.size : 0,
    };
  }

  /**
   * Evict entries if needed
   */
  private evictIfNeeded(newEntrySize: number): void {
    // Check size limit
    while (this.cache.size >= this.maxSize && this.cache.size > 0) {
      const firstKey = this.cache.keys().next().value;
      this.delete(firstKey);
    }

    // Check byte limit
    while (this.currentBytes + newEntrySize > this.maxBytes && this.cache.size > 0) {
      // Evict least recently used
      let lruKey: string | null = null;
      let lruTime = Infinity;

      for (const [key, entry] of this.cache.entries()) {
        if (entry.lastAccessed < lruTime) {
          lruTime = entry.lastAccessed;
          lruKey = key;
        }
      }

      if (lruKey) {
        this.delete(lruKey);
      }
    }
  }

  /**
   * Estimate size of value
   */
  private estimateSize(value: T): number {
    if (value instanceof Blob) {
      return value.size;
    }
    if (value instanceof ArrayBuffer) {
      return value.byteLength;
    }
    if (typeof value === 'string') {
      return value.length * 2; // UTF-16
    }
    // Rough estimate for objects
    return JSON.stringify(value).length * 2;
  }
}

/**
 * Time-based cache with TTL
 */
export class TTLCache<T> {
  private cache: Map<string, { data: T; expires: number }> = new Map();

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  /**
   * Set value in cache with TTL
   */
  set(key: string, value: T, ttl: number): void {
    this.cache.set(key, {
      data: value,
      expires: Date.now() + ttl,
    });
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
  }
}

